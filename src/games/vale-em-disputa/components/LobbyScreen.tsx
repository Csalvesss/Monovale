// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Lobby Screen (Create or Join Room)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

interface Props {
  onCreateRoom: (playerName: string) => Promise<void>;
  onJoinRoom: (code: string, playerName: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function LobbyScreen({ onCreateRoom, onJoinRoom, onBack, loading, error }: Props) {
  const [mode, setMode] = useState<'pick' | 'create' | 'join'>('pick');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  async function handleCreate() {
    if (!playerName.trim()) return;
    await onCreateRoom(playerName.trim());
  }

  async function handleJoin() {
    if (!playerName.trim() || roomCode.length < 4) return;
    await onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f2213 0%, #0f172a 50%, #1e1438 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'var(--font-body)',
    }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🗺️</div>
        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontSize: 34, fontWeight: 900, margin: 0,
          color: '#f1f5f9',
          letterSpacing: '-0.5px',
          textShadow: '0 0 40px rgba(5,150,105,0.4)',
        }}>
          Vale em Disputa
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 8, fontStyle: 'italic' }}>
          War do Vale do Paraíba · 2–5 jogadores · Multijogador online
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '28px 28px',
        width: '100%', maxWidth: 400,
        backdropFilter: 'blur(12px)',
      }}>

        {mode === 'pick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: '0 0 4px', textAlign: 'center' }}>
              Como deseja jogar?
            </h2>

            <button onClick={() => setMode('create')} style={S.bigBtn('#059669')}>
              <span style={{ fontSize: 24 }}>🏰</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Criar Sala</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Gere um código e convide amigos</div>
              </div>
            </button>

            <button onClick={() => setMode('join')} style={S.bigBtn('#1d4ed8')}>
              <span style={{ fontSize: 24 }}>🔑</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Entrar na Sala</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Digite o código de 6 letras</div>
              </div>
            </button>

            <button onClick={onBack} style={S.ghostBtn}>
              ← Voltar ao Hub
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: '0 0 4px', textAlign: 'center' }}>
              Criar Sala
            </h2>

            <input
              type="text"
              placeholder="Seu apelido"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={16}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              style={S.input}
              autoFocus
            />

            {error && <div style={S.error}>{error}</div>}

            <button
              onClick={handleCreate}
              disabled={loading || !playerName.trim()}
              style={{ ...S.bigBtn('#059669'), opacity: loading || !playerName.trim() ? 0.5 : 1 }}
            >
              <span style={{ fontSize: 20 }}>🏰</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {loading ? 'Criando...' : 'Criar Sala'}
                </div>
              </div>
            </button>

            <button onClick={() => setMode('pick')} style={S.ghostBtn}>
              ← Voltar
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: '0 0 4px', textAlign: 'center' }}>
              Entrar na Sala
            </h2>

            <input
              type="text"
              placeholder="Seu apelido"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={16}
              style={S.input}
              autoFocus
            />

            <input
              type="text"
              placeholder="Código da sala (ex: ABCDEF)"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              style={{ ...S.input, textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontSize: 20, fontWeight: 900 }}
            />

            {error && <div style={S.error}>{error}</div>}

            <button
              onClick={handleJoin}
              disabled={loading || !playerName.trim() || roomCode.length < 4}
              style={{
                ...S.bigBtn('#1d4ed8'),
                opacity: loading || !playerName.trim() || roomCode.length < 4 ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 20 }}>🔑</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </div>
              </div>
            </button>

            <button onClick={() => setMode('pick')} style={S.ghostBtn}>
              ← Voltar
            </button>
          </div>
        )}
      </div>

      {/* Game description */}
      <div style={{
        marginTop: 24, maxWidth: 400, textAlign: 'center',
        color: '#475569', fontSize: 11, lineHeight: 1.6,
      }}>
        Conquiste as 30 cidades do Vale do Paraíba. Dispute regiões, derrote adversários e
        cumpra sua missão secreta para vencer.
      </div>
    </div>
  );
}

const S = {
  bigBtn: (bg: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px',
    background: bg,
    border: 'none', borderRadius: 14,
    color: '#fff', cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'transform 0.1s, opacity 0.1s',
    fontFamily: 'var(--font-body)',
  }),
  ghostBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '10px',
    color: '#64748b', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    fontFamily: 'var(--font-body)',
  } as React.CSSProperties,
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px',
    color: '#f1f5f9', fontSize: 15,
    outline: 'none', fontFamily: 'var(--font-body)',
    width: '100%', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  error: {
    background: '#7f1d1d', border: '1px solid #ef4444',
    borderRadius: 8, padding: '8px 12px',
    fontSize: 12, color: '#fca5a5',
  } as React.CSSProperties,
};
