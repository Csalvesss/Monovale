import {
  doc, setDoc, deleteDoc, onSnapshot, updateDoc, arrayUnion, collection,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface VoicePeer {
  uid: string;
  displayName: string;
  /** They muted themselves (remote state from Firestore) */
  muted: boolean;
  /** WebRTC connection is established */
  connected: boolean;
  /** Detected speaking via audio analyser */
  speaking: boolean;
  /** We locally muted their audio (does not affect their stream, only our playback) */
  locallyMuted: boolean;
}

/** Called whenever peer list or local speaking state changes */
type PeersCallback = (peers: VoicePeer[], localSpeaking: boolean) => void;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/** RMS threshold (0-128 scale) above which we consider a track as speaking */
const SPEAKING_THRESHOLD = 12;
/** Poll interval in ms for speaking detection */
const SPEAK_POLL_MS = 80;

/**
 * Manages WebRTC voice chat for room games.
 *
 * Signaling via Firestore:
 *   rooms/{code}/voice/{uid}               → presence { enabled, muted, displayName }
 *   rooms/{code}/voiceSignal/{lowerUid_higherUid} → { offer, offerCandidates[], answer, answerCandidates[] }
 *
 * Audio pipeline (per remote peer):
 *   RTCPeerConnection track → MediaStream
 *   → AudioContext.createMediaStreamSource()
 *   → AnalyserNode (speaking detection)
 *   → GainNode (volume + individual mute)
 *   → AudioContext.destination (speakers)
 *
 * The peer with the lexicographically lower uid is always the offer initiator.
 */
class VoiceChatService {
  private roomCode: string | null = null;
  private myUid: string | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private listeners: Array<() => void> = [];
  private presenceMap = new Map<string, { muted: boolean; displayName: string }>();
  private processedCandidates = new Map<string, Set<string>>();

  // ── Audio pipeline (shared context for all peers) ──
  private audioCtx: AudioContext | null = null;
  private analysers = new Map<string, AnalyserNode>();
  private gainNodes = new Map<string, GainNode>();
  /** Speaking state per remote peer uid */
  private speakingState = new Map<string, boolean>();
  /** Local speaking detection */
  private localAnalyser: AnalyserNode | null = null;
  private _localSpeaking = false;
  /** Polling interval id for speaking detection */
  private speakingInterval: ReturnType<typeof setInterval> | null = null;

  // ── Per-user local controls ──
  /** Peers we've chosen to silence locally (their gain is set to 0) */
  private locallyMutedPeers = new Set<string>();
  /** Master output volume 0-1 */
  private _outputVolume = 1;

  private _muted = false;
  private _enabled = false;
  private onPeersChange: PeersCallback | null = null;

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  async join(
    roomCode: string,
    uid: string,
    displayName: string,
    onPeersChange: PeersCallback,
  ): Promise<void> {
    if (this._enabled) await this.leave();

    this.roomCode = roomCode;
    this.myUid = uid;
    this.onPeersChange = onPeersChange;
    this._muted = false;
    this._enabled = true;
    this.locallyMutedPeers.clear();

    // Request microphone
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Shared AudioContext for all audio routing (created inside user gesture → 'running' state)
    this.audioCtx = new AudioContext();

    // Local speaking detection — source connected to analyser only, NOT to destination
    const localSource = this.audioCtx.createMediaStreamSource(this.localStream);
    this.localAnalyser = this.audioCtx.createAnalyser();
    this.localAnalyser.fftSize = 512;
    localSource.connect(this.localAnalyser);

    this.startSpeakingDetection();

    // Announce presence
    await setDoc(doc(db, 'rooms', roomCode, 'voice', uid), {
      enabled: true,
      muted: false,
      displayName,
    });

    // Watch all voice-enabled users in the room
    const unsub = onSnapshot(
      collection(db, 'rooms', roomCode, 'voice'),
      async (snap) => {
        const current = new Set<string>();

        for (const d of snap.docs) {
          if (d.id === uid) continue;
          const data = d.data() as { enabled: boolean; muted: boolean; displayName: string };
          if (!data.enabled) continue;

          current.add(d.id);
          this.presenceMap.set(d.id, { muted: data.muted, displayName: data.displayName });

          if (!this.peerConnections.has(d.id)) {
            this.connectToPeer(d.id).catch(console.error);
          }
        }

        // Clean up peers who left
        for (const [peerId] of [...this.presenceMap]) {
          if (!current.has(peerId)) {
            this.disconnectPeer(peerId);
          }
        }

        this.notifyChange();
      },
    );
    this.listeners.push(unsub);
  }

  /** Toggle local mic mute. Returns new muted state. */
  toggleMute(): boolean {
    this._muted = !this._muted;
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = !this._muted; });

    if (this.roomCode && this.myUid) {
      updateDoc(doc(db, 'rooms', this.roomCode, 'voice', this.myUid), {
        muted: this._muted,
      }).catch(() => {});
    }

    this.notifyChange();
    return this._muted;
  }

  /**
   * Toggle local mute for a specific remote peer.
   * Does not affect their stream — only silences their audio on our end.
   * Returns true if the peer is now locally muted.
   */
  toggleLocalPeerMute(peerId: string): boolean {
    const wasMuted = this.locallyMutedPeers.has(peerId);
    if (wasMuted) {
      this.locallyMutedPeers.delete(peerId);
    } else {
      this.locallyMutedPeers.add(peerId);
    }

    const gain = this.gainNodes.get(peerId);
    if (gain) {
      gain.gain.value = wasMuted ? this._outputVolume : 0;
    }

    this.notifyChange();
    return !wasMuted;
  }

  /**
   * Set the master output volume (0-1) for all remote audio.
   * Individually locally-muted peers remain at 0.
   */
  setOutputVolume(vol: number): void {
    this._outputVolume = Math.max(0, Math.min(1, vol));
    for (const [uid, gain] of this.gainNodes) {
      if (!this.locallyMutedPeers.has(uid)) {
        gain.gain.value = this._outputVolume;
      }
    }
  }

  async leave(): Promise<void> {
    this._enabled = false;

    this.stopSpeakingDetection();

    this.listeners.forEach(u => u());
    this.listeners = [];

    for (const peerId of [...this.peerConnections.keys()]) {
      this.disconnectPeer(peerId);
    }

    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;

    this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
    this.localAnalyser = null;
    this.analysers.clear();
    this.gainNodes.clear();
    this.speakingState.clear();
    this.locallyMutedPeers.clear();
    this._localSpeaking = false;

    if (this.roomCode && this.myUid) {
      await deleteDoc(doc(db, 'rooms', this.roomCode, 'voice', this.myUid)).catch(() => {});
    }

    this.presenceMap.clear();
    this.processedCandidates.clear();
    this.roomCode = null;
    this.myUid = null;
    this.onPeersChange = null;
  }

  get muted(): boolean { return this._muted; }
  get enabled(): boolean { return this._enabled; }
  get outputVolume(): number { return this._outputVolume; }
  get localSpeaking(): boolean { return this._localSpeaking; }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: WebRTC connection lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  private async connectToPeer(peerId: string): Promise<void> {
    const myUid = this.myUid!;
    const isInitiator = myUid < peerId;
    const pairKey = isInitiator ? `${myUid}_${peerId}` : `${peerId}_${myUid}`;
    const signalRef = doc(db, 'rooms', this.roomCode!, 'voiceSignal', pairKey);

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(peerId, pc);
    this.processedCandidates.set(peerId, new Set());

    // Add local audio tracks
    this.localStream?.getTracks().forEach(track => pc.addTrack(track, this.localStream!));

    // Route incoming audio through AudioContext for analysis + volume control
    pc.ontrack = (event) => {
      const ctx = this.audioCtx;
      if (!ctx) return;

      // Resume if the browser suspended the context (focus loss, etc.)
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const stream = event.streams[0];
      if (!stream) return;

      // Tear down any previous pipeline for this peer (re-negotiation)
      this.analysers.delete(peerId);
      this.gainNodes.delete(peerId);

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      const gain = ctx.createGain();
      gain.gain.value = this.locallyMutedPeers.has(peerId) ? 0 : this._outputVolume;

      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);

      this.analysers.set(peerId, analyser);
      this.gainNodes.set(peerId, gain);
    };

    pc.onconnectionstatechange = () => this.notifyChange();

    if (isInitiator) {
      const offer = await pc.createOffer();

      await setDoc(signalRef, {
        offer: { type: offer.type, sdp: offer.sdp },
        offerCandidates: [],
        answer: null,
        answerCandidates: [],
      });

      pc.onicecandidate = ({ candidate }) => {
        if (candidate && this.peerConnections.has(peerId)) {
          setDoc(signalRef, { offerCandidates: arrayUnion(candidate.toJSON()) }, { merge: true })
            .catch(() => {});
        }
      };

      await pc.setLocalDescription(offer);

      const unsub = onSnapshot(signalRef, async (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(() => {});
        }

        const processed = this.processedCandidates.get(peerId);
        if (!processed) return;
        for (const c of (data.answerCandidates as RTCIceCandidateInit[] || [])) {
          const key = JSON.stringify(c);
          if (!processed.has(key)) {
            processed.add(key);
            pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
          }
        }
      });
      this.listeners.push(unsub);

    } else {
      const unsub = onSnapshot(signalRef, async (snap) => {
        const data = snap.data();
        if (!data?.offer) return;

        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer)).catch(() => {});
          const answer = await pc.createAnswer();

          await updateDoc(signalRef, {
            answer: { type: answer.type, sdp: answer.sdp },
            answerCandidates: [],
          }).catch(() => {});

          pc.onicecandidate = ({ candidate }) => {
            if (candidate && this.peerConnections.has(peerId)) {
              setDoc(signalRef, { answerCandidates: arrayUnion(candidate.toJSON()) }, { merge: true })
                .catch(() => {});
            }
          };

          await pc.setLocalDescription(answer).catch(() => {});
        }

        const processed = this.processedCandidates.get(peerId);
        if (!processed) return;
        for (const c of (data.offerCandidates as RTCIceCandidateInit[] || [])) {
          const key = JSON.stringify(c);
          if (!processed.has(key)) {
            processed.add(key);
            pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
          }
        }
      });
      this.listeners.push(unsub);
    }
  }

  private disconnectPeer(peerId: string): void {
    this.peerConnections.get(peerId)?.close();
    this.peerConnections.delete(peerId);

    // GainNode disconnects automatically when AudioContext remains alive
    this.analysers.delete(peerId);
    this.gainNodes.delete(peerId);
    this.speakingState.delete(peerId);

    this.presenceMap.delete(peerId);
    this.processedCandidates.delete(peerId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: Speaking detection
  // ─────────────────────────────────────────────────────────────────────────

  private startSpeakingDetection(): void {
    this.speakingInterval = setInterval(() => {
      let changed = false;

      // Local speaking (don't report while muted)
      if (this.localAnalyser) {
        const buf = new Uint8Array(this.localAnalyser.frequencyBinCount);
        this.localAnalyser.getByteTimeDomainData(buf);
        const rms = calcRms(buf);
        const speaking = rms > SPEAKING_THRESHOLD && !this._muted;
        if (speaking !== this._localSpeaking) {
          this._localSpeaking = speaking;
          changed = true;
        }
      }

      // Remote peers
      for (const [uid, analyser] of this.analysers) {
        const buf = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(buf);
        const rms = calcRms(buf);
        const speaking = rms > SPEAKING_THRESHOLD;
        if (speaking !== this.speakingState.get(uid)) {
          this.speakingState.set(uid, speaking);
          changed = true;
        }
      }

      if (changed) this.notifyChange();
    }, SPEAK_POLL_MS);
  }

  private stopSpeakingDetection(): void {
    if (this.speakingInterval !== null) {
      clearInterval(this.speakingInterval);
      this.speakingInterval = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: State notification
  // ─────────────────────────────────────────────────────────────────────────

  private notifyChange(): void {
    if (!this.onPeersChange) return;
    const peers: VoicePeer[] = [];
    for (const [uid, data] of this.presenceMap) {
      const pc = this.peerConnections.get(uid);
      peers.push({
        uid,
        displayName: data.displayName,
        muted: data.muted,
        connected: pc?.connectionState === 'connected',
        speaking: this.speakingState.get(uid) ?? false,
        locallyMuted: this.locallyMutedPeers.has(uid),
      });
    }
    this.onPeersChange(peers, this._localSpeaking);
  }
}

/** Compute RMS from a Uint8Array of time-domain samples (0-255, centre = 128). */
function calcRms(buf: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = buf[i] - 128;
    sum += v * v;
  }
  return Math.sqrt(sum / buf.length);
}

export const voiceChatService = new VoiceChatService();
