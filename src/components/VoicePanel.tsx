import React, { useState, useCallback, useEffect } from 'react';
import { voiceChatService, VoicePeer } from '../services/voiceChatService';
import VoiceChatPanel from './VoiceChatPanel';

interface Props {
  roomCode: string;
  uid: string;
  displayName: string;
}

/**
 * Self-contained voice + text chat panel.
 * Owns all voice state internally — App.tsx only supplies identity props.
 */
export default function VoicePanel({ roomCode, uid, displayName }: Props) {
  const [joined, setJoined]             = useState(false);
  const [muted, setMuted]               = useState(false);
  const [peers, setPeers]               = useState<VoicePeer[]>([]);
  const [localSpeaking, setLocalSpeak]  = useState(false);
  const [outputVolume, setVolState]     = useState(1);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // Leave voice channel when this panel is unmounted (screen change / game exit)
  useEffect(() => {
    return () => { voiceChatService.leave().catch(() => {}); };
  }, []);

  const handleJoin = useCallback(async () => {
    if (loading) return;

    // Check browser support before starting
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Seu navegador não suporta áudio (use HTTPS ou um navegador moderno).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 20_000),
      );
      await Promise.race([
        voiceChatService.join(roomCode, uid, displayName, (p, ls) => {
          setPeers(p);
          setLocalSpeak(ls);
        }),
        timeout,
      ]);
      setJoined(true);
      setMuted(false);
    } catch (e) {
      const err = e as Error;
      // Clean up any partial state so the next join attempt starts fresh
      voiceChatService.leave().catch(() => {});
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permissão de microfone negada. Autorize o acesso ao microfone nas configurações do navegador.');
      } else if (err.message === 'TIMEOUT') {
        setError('Tempo limite atingido. Verifique sua conexão e tente novamente.');
      } else if (err.message?.includes('Missing or insufficient')) {
        setError('Erro de permissão no Firestore.');
      } else {
        setError(`Erro ao conectar: ${err.message || err.name}`);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, roomCode, uid, displayName]);

  const handleLeave = useCallback(async () => {
    await voiceChatService.leave().catch(() => {});
    setJoined(false);
    setMuted(false);
    setPeers([]);
    setLocalSpeak(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted(voiceChatService.toggleMute());
  }, []);

  const handleTogglePeerMute = useCallback((peerId: string) => {
    voiceChatService.toggleLocalPeerMute(peerId);
  }, []);

  const handleSetVolume = useCallback((vol: number) => {
    voiceChatService.setOutputVolume(vol);
    setVolState(vol);
  }, []);

  return (
    <VoiceChatPanel
      roomCode={roomCode}
      myUid={uid}
      myDisplayName={displayName}
      voiceJoined={joined}
      voiceMuted={muted}
      voiceLocalSpeaking={localSpeaking}
      voiceOutputVolume={outputVolume}
      peers={peers}
      onJoinVoice={handleJoin}
      onLeaveVoice={handleLeave}
      onToggleMute={handleToggleMute}
      onTogglePeerMute={handleTogglePeerMute}
      onSetVolume={handleSetVolume}
      voiceError={error}
      voiceLoading={loading}
      onClearVoiceError={() => setError(null)}
    />
  );
}
