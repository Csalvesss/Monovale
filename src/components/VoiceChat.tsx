import React from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

interface Props {
  joined: boolean;
  muted: boolean;
  loading: boolean;
  error: string | null;
  onJoin: () => void;
  onLeave: () => void;
  onToggleMute: () => void;
  onClearError: () => void;
}

/**
 * Compact top-bar voice controls (join/mute/leave).
 * All state is lifted — this component is fully controlled.
 * The full participant list and text chat live in VoiceChatPanel.
 */
export default function VoiceChat({
  joined, muted, loading, error,
  onJoin, onLeave, onToggleMute, onClearError,
}: Props) {
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
        <button
          onClick={onJoin}
          disabled={loading}
          title="Entrar no canal de voz"
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
          {/* Mute / unmute */}
          <button
            onClick={onToggleMute}
            title={muted ? 'Desmutar microfone' : 'Mutar microfone'}
            style={{
              ...btnBase,
              background: muted ? 'rgba(220,38,38,0.35)' : 'rgba(5,150,105,0.35)',
              border: `1px solid ${muted ? 'rgba(220,38,38,0.5)' : 'rgba(5,150,105,0.5)'}`,
            }}
          >
            {muted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          {/* Leave */}
          <button
            onClick={onLeave}
            title="Sair do canal de voz"
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

      {/* Error toast */}
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
            onClick={onClearError}
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
