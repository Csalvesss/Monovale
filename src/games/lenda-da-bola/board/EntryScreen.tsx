import React, { useState } from 'react';
import { ChevronLeft, Trophy, Users, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { createRoom, joinRoom } from './service';
import type { PlayerColor } from './types';
import { ALL_PLAYER_COLORS, PLAYER_COLORS } from './types';

interface Props {
  onBack: () => void;
  onRoomReady: (code: string) => void;
}

export default function EntryScreen({ onBack, onRoomReady }: Props) {
  const { user, profile } = useAuth();
  const displayName = profile?.displayName ?? user?.displayName ?? 'Jogador';
  const uid = user?.uid ?? '';

  const [codeInput, setCodeInput] = useState('');
  const [color, setColor] = useState<PlayerColor>('red');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!uid) { setError('Faça login primeiro.'); return; }
    setLoading(true); setError('');
    try {
      const code = await createRoom(uid, displayName, color);
      onRoomReady(code);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function handleJoin() {
    if (!uid) { setError('Faça login primeiro.'); return; }
    if (codeInput.trim().length < 6) { setError('Digite o código de 6 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      await joinRoom(codeInput.trim().toUpperCase(), uid, displayName, color);
      onRoomReady(codeInput.trim().toUpperCase());
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    setLoading(false);
  }

  return (
    <div className="lenda-root" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-void)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0d2240 0%, var(--bg-void) 100%)',
        borderBottom: '1px solid var(--border-gold)',
        padding: '24px 16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button
            onClick={onBack}
            className="lenda-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}
          >
            <ChevronLeft size={14} />
            Voltar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--wc-gold), var(--wc-gold-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 14 }}>🎲</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, letterSpacing: '0.08em',
              color: 'var(--text-primary)',
            }}>
              LENDAS DA BOLA
            </span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Tabuleiro online para 2–6 jogadores
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 40px' }}>
        <div style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Color picker */}
          <div className="lenda-card" style={{ padding: 18 }}>
            <p className="lenda-label" style={{ marginBottom: 10 }}>Sua cor no tabuleiro</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL_PLAYER_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: PLAYER_COLORS[c].bg,
                    border: `3px solid ${color === c ? PLAYER_COLORS[c].light : 'transparent'}`,
                    cursor: 'pointer',
                    transform: color === c ? 'scale(1.18)' : 'scale(1)',
                    transition: 'all 0.15s',
                    boxShadow: color === c ? `0 0 12px ${PLAYER_COLORS[c].bg}88` : 'none',
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Create room */}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="lenda-card"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 18, cursor: 'pointer', textAlign: 'left',
              border: '1px solid var(--border-gold)',
              background: 'rgba(251,191,36,0.04)',
              width: '100%',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <div style={{
              width: 44, height: 44, flexShrink: 0, borderRadius: 12,
              background: 'rgba(251,191,36,0.15)', border: '1px solid var(--border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {loading ? <Loader size={20} color="var(--wc-gold)" style={{ animation: 'lenda-spin 0.8s linear infinite' }} />
                : <Trophy size={20} color="var(--wc-gold)" />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                Criar Sala
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Gere um código e convide amigos
              </p>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          </div>

          {/* Join room */}
          <div className="lenda-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Users size={15} color="var(--wc-gold)" />
              <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                Entrar em Sala
              </p>
            </div>
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="Código de 6 caracteres"
              className="lenda-input"
              style={{ marginBottom: 10, textAlign: 'center', letterSpacing: '0.2em', fontWeight: 800, fontSize: 16 }}
            />
            <button
              onClick={handleJoin}
              disabled={loading || codeInput.trim().length < 6}
              className="lenda-btn-gold"
              style={{
                width: '100%', padding: 12, fontSize: 15,
                opacity: loading || codeInput.trim().length < 6 ? 0.5 : 1,
              }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </div>

          {error && (
            <div style={{
              borderRadius: 10, border: '1px solid rgba(185,28,28,0.4)',
              background: 'rgba(185,28,28,0.1)',
              padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          {/* Rules summary */}
          <div className="lenda-card" style={{ padding: 16 }}>
            <p className="lenda-label" style={{ marginBottom: 10 }}>Como jogar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['🎲', 'Role 2 dados e mova seu peão no tabuleiro'],
                ['⚽', 'Dia de Jogo: simule uma partida e ganhe pontos'],
                ['🔄', 'Mercado: melhore seu ataque ou defesa'],
                ['⭐', 'Lenda: colete cartas de lendas do futebol'],
                ['🏆', 'O jogador com mais pontos em 3 voltas vence!'],
              ].map(([emoji, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{emoji}</span>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
