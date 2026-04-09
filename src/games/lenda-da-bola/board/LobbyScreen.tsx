import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Copy, Check, Wifi, WifiOff, Play, Loader } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { listenRoom, startRoom, leaveRoom } from './service';
import type { RoomDoc } from './types';
import { PLAYER_COLORS } from './types';

interface Props {
  roomCode: string;
  onGameStart: () => void;
  onBack: () => void;
}

export default function LobbyScreen({ roomCode, onGameStart, onBack }: Props) {
  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';

  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [copied, setCopied] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    unsubRef.current?.();
    unsubRef.current = listenRoom(roomCode, (r) => {
      setRoom(r);
      if (r.status === 'playing') {
        onGameStart();
      }
    });
    return () => { unsubRef.current?.(); };
  }, [roomCode, onGameStart]);

  async function handleStart() {
    if (!roomCode) return;
    await startRoom(roomCode);
  }

  async function handleLeave() {
    if (uid && roomCode) await leaveRoom(roomCode, uid);
    onBack();
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isHost = room?.hostUid === uid;
  const canStart = (room?.players.length ?? 0) >= 2;

  if (!room) {
    return (
      <div className="lenda-root" style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-void)',
      }}>
        <div className="lenda-spinner" />
      </div>
    );
  }

  return (
    <div className="lenda-root" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-void)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0d2240 0%, var(--bg-void) 100%)',
        borderBottom: '1px solid var(--border-default)',
        padding: '20px 16px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <button onClick={handleLeave} className="lenda-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>
            <ChevronLeft size={14} />
            Sair
          </button>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em',
            color: 'var(--text-primary)',
          }}>
            AGUARDANDO JOGADORES
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {room.players.length} jogador(es) na sala · máx. 6
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Room code */}
          <div className="lenda-card" style={{
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid var(--border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wifi size={16} color="var(--wc-gold)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Código da sala
              </p>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 26,
                letterSpacing: '0.18em', color: 'var(--wc-gold)',
              }}>
                {roomCode}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="lenda-btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', fontSize: 11, fontWeight: 700 }}
            >
              {copied ? <><Check size={12} />Copiado</> : <><Copy size={12} />Copiar</>}
            </button>
          </div>

          {/* Players */}
          <div>
            <p className="lenda-label" style={{ marginBottom: 8 }}>Jogadores</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {room.players.map((p, idx) => {
                const colors = PLAYER_COLORS[p.color];
                return (
                  <div key={p.uid} className="lenda-card" style={{
                    padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    border: p.uid === uid ? '1px solid var(--border-gold)' : '1px solid var(--border-default)',
                  }}>
                    {/* Token */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: colors.bg,
                      border: `2px solid ${colors.light}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: '#fff',
                      flexShrink: 0,
                    }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {p.name}
                        {p.uid === uid && (
                          <span style={{
                            marginLeft: 6, fontSize: 9, fontWeight: 800,
                            color: 'var(--wc-gold)', background: 'rgba(251,191,36,0.1)',
                            padding: '2px 6px', borderRadius: 999,
                          }}>VOCÊ</span>
                        )}
                        {p.uid === room.hostUid && (
                          <span style={{
                            marginLeft: 6, fontSize: 9, fontWeight: 800,
                            color: '#fbbf24', background: 'rgba(251,191,36,0.15)',
                            padding: '2px 6px', borderRadius: 999, border: '1px solid rgba(251,191,36,0.3)',
                          }}>HOST</span>
                        )}
                      </p>
                      <p style={{ fontSize: 10, color: colors.light }}>
                        Peão {p.color} · Posição {idx + 1}
                      </p>
                    </div>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: '0 0 6px #22c55e',
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            borderRadius: 10, border: '1px solid rgba(37,99,235,0.3)',
            background: 'rgba(37,99,235,0.06)',
            padding: '12px 14px',
          }}>
            {isHost ? (
              canStart ? (
                <p style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>
                  ✅ Pronto para começar! Aguardando mais jogadores é opcional.
                </p>
              ) : (
                <p style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>
                  ⏳ Aguardando mais 1 jogador para iniciar (mín. 2).
                </p>
              )
            ) : (
              <p style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>
                ⏳ Aguardando o host iniciar o jogo…
              </p>
            )}
          </div>

          {/* Game log */}
          {room.log.length > 0 && (
            <div className="lenda-card" style={{ padding: 14 }}>
              <p className="lenda-label" style={{ marginBottom: 8 }}>Atividade</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[...room.log].reverse().slice(0, 5).map((entry, i) => (
                  <p key={i} style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer — host only */}
      {isHost && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-void)', borderTop: '1px solid var(--border-default)',
          padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}>
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="lenda-btn-gold"
            style={{
              width: '100%', padding: 14, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: canStart ? 1 : 0.4,
            }}
          >
            <Play size={16} />
            Iniciar Jogo ({room.players.length} jogadores)
          </button>
        </div>
      )}
    </div>
  );
}
