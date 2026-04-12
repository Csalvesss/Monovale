import {
  doc, setDoc, deleteDoc, onSnapshot, updateDoc, arrayUnion, collection,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface VoicePeer {
  uid: string;
  displayName: string;
  muted: boolean;
  connected: boolean;
}

type PeersCallback = (peers: VoicePeer[]) => void;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/**
 * Manages WebRTC voice chat for room games.
 *
 * Signaling via Firestore:
 *   rooms/{code}/voice/{uid}               → presence { enabled, muted, displayName }
 *   rooms/{code}/voiceSignal/{lowerUid_higherUid} → { offer, offerCandidates[], answer, answerCandidates[] }
 *
 * The peer with the lexicographically lower uid is always the offer initiator.
 */
class VoiceChatService {
  private roomCode: string | null = null;
  private myUid: string | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private audioElements = new Map<string, HTMLAudioElement>();
  private listeners: Array<() => void> = [];
  private presenceMap = new Map<string, { muted: boolean; displayName: string }>();
  private processedCandidates = new Map<string, Set<string>>();
  private _muted = false;
  private _enabled = false;
  private onPeersChange: PeersCallback | null = null;

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

    // Request microphone access
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Announce presence to other players
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
        for (const [peerId] of this.presenceMap) {
          if (!current.has(peerId)) {
            this.disconnectPeer(peerId);
          }
        }

        this.notifyChange();
      },
    );
    this.listeners.push(unsub);
  }

  private async connectToPeer(peerId: string): Promise<void> {
    const myUid = this.myUid!;
    // Lower UID is always the offer initiator — prevents both sides sending offers simultaneously
    const isInitiator = myUid < peerId;
    const pairKey = isInitiator ? `${myUid}_${peerId}` : `${peerId}_${myUid}`;
    const signalRef = doc(db, 'rooms', this.roomCode!, 'voiceSignal', pairKey);

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(peerId, pc);
    this.processedCandidates.set(peerId, new Set());

    // Add local audio tracks to the connection
    this.localStream?.getTracks().forEach(track => pc.addTrack(track, this.localStream!));

    // Play incoming audio from remote peer
    pc.ontrack = (event) => {
      let audio = this.audioElements.get(peerId);
      if (!audio) {
        audio = document.createElement('audio');
        audio.autoplay = true;
        document.body.appendChild(audio);
        this.audioElements.set(peerId, audio);
      }
      if (audio.srcObject !== event.streams[0]) {
        audio.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => this.notifyChange();

    if (isInitiator) {
      const offer = await pc.createOffer();

      // Write offer to Firestore BEFORE setLocalDescription to avoid ICE candidate race condition
      await setDoc(signalRef, {
        offer: { type: offer.type, sdp: offer.sdp },
        offerCandidates: [],
        answer: null,
        answerCandidates: [],
      });

      // Register ICE handler before setLocalDescription (candidates fire after it resolves)
      pc.onicecandidate = ({ candidate }) => {
        if (candidate && this.peerConnections.has(peerId)) {
          setDoc(signalRef, { offerCandidates: arrayUnion(candidate.toJSON()) }, { merge: true })
            .catch(() => {});
        }
      };

      await pc.setLocalDescription(offer);

      // Listen for answer + answer-side ICE candidates
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
      // Responder: wait for the offer, then create an answer
      const unsub = onSnapshot(signalRef, async (snap) => {
        const data = snap.data();
        if (!data?.offer) return;

        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer)).catch(() => {});
          const answer = await pc.createAnswer();

          // Write answer to Firestore BEFORE setLocalDescription to avoid ICE candidate race condition
          await updateDoc(signalRef, {
            answer: { type: answer.type, sdp: answer.sdp },
            answerCandidates: [],
          }).catch(() => {});

          // Register ICE handler before setLocalDescription
          pc.onicecandidate = ({ candidate }) => {
            if (candidate && this.peerConnections.has(peerId)) {
              setDoc(signalRef, { answerCandidates: arrayUnion(candidate.toJSON()) }, { merge: true })
                .catch(() => {});
            }
          };

          await pc.setLocalDescription(answer).catch(() => {});
        }

        // Process offer-side ICE candidates
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

    const audio = this.audioElements.get(peerId);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
      this.audioElements.delete(peerId);
    }

    this.presenceMap.delete(peerId);
    this.processedCandidates.delete(peerId);
  }

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

  async leave(): Promise<void> {
    this._enabled = false;

    this.listeners.forEach(u => u());
    this.listeners = [];

    for (const peerId of [...this.peerConnections.keys()]) {
      this.disconnectPeer(peerId);
    }

    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;

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
      });
    }
    this.onPeersChange(peers);
  }
}

export const voiceChatService = new VoiceChatService();
