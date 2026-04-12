import React, { useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { voiceChatService, VoicePeer } from '../services/voiceChatService';

interface Props {
  roomCode: string;
  uid: string;
  displayName: string;
  isMobile: boolean;
}

export default function VoiceChat({ roomCode, uid, displayName, isMobile }: Props) {
  const [joined, setJoined]   = useState(false);
  const [muted, setMuted]     = useState(false);
  const [peers, setPeers]     = useState<VoicePeer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleJoin = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await voiceChatService.join(roomCode, uid, displayName, setPeers);
      setJoined(true);
      setMuted(false);
    } catch (e) {
      const err = e as Error;
      console.error('[VoiceChat] join error:', err.name, err.message, e);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permissão de microfone negada.');
      } else if (err.message?.includes('permission') || err.message?.includes('Missing or insufficient')) {
        setError('Erro de permissão no banco de dados. Atualize as regras do Firestore.');
      } else {
        setError(`Erro: ${err.message || err.name}`);
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
  }, []);

  const handleToggleMute = useCallback(() => {
    const nowMuted = voiceChatService.toggleMute();
    setMuted(nowMuted);
  }, []);

  // Disconnect voice chat when this component is removed (game exit, screen change)
  useEffect(() => {
    return () => {
      if (voiceChatService.enabled) {
        voiceChatService.leave().catch(() => {});
      }
    };
  }, []);

  // Shared button base style (mirrors existing topBar buttons)
  const btnBase: React.CSSProperties = {
    width: 32, height: 32,
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0,
    transition: 'background 0.15s',
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>

      {!joined ? (
        /* ── Join button ── */
        <button
          onClick={handleJoin}
          disabled={loading}
          title="Entrar no chat de voz"
          style={{
            ...btnBase,
            background: 'rgba(255,255,255,0.15)',
            opacity: loading ? 0.55 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <Mic size={15} />
        </button>
      ) : (
        <>
          {/* ── Mute / unmute ── */}
          <button
            onClick={handleToggleMute}
            title={muted ? 'Desmutar microfone' : 'Mutar microfone'}
            style={{
              ...btnBase,
              background: muted
                ? 'rgba(220,38,38,0.35)'
                : 'rgba(5,150,105,0.35)',
              border: `1px solid ${muted ? 'rgba(220,38,38,0.5)' : 'rgba(5,150,105,0.5)'}`,
            }}
          >
            {muted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          {/* ── Peer status dots (desktop only) ── */}
          {!isMobile && peers.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '0 8px',
              height: 32,
            }}>
              {peers.map(p => (
                <span
                  key={p.uid}
                  title={`${p.displayName}${p.muted ? ' (mutado)' : ''}`}
                  style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: p.muted
                      ? '#6B7280'
                      : p.connected ? '#10B981' : '#F59E0B',
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Leave voice chat ── */}
          <button
            onClick={handleLeave}
            title="Sair do chat de voz"
            style={{
              ...btnBase,
              background: 'rgba(220,38,38,0.25)',
              border: '1px solid rgba(220,38,38,0.4)',
            }}
          >
            <PhoneOff size={15} />
          </button>
        </>
      )}

      {/* ── Error toast ── */}
      {error && (
        <div style={{
          position: 'absolute', top: 38, right: 0,
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 12, color: '#DC2626', fontWeight: 600,
          whiteSpace: 'nowrap', zIndex: 200,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              marginLeft: 8, color: '#DC2626', fontSize: 14, lineHeight: 1, padding: 0,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
