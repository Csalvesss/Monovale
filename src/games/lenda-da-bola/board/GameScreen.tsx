import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { listenRoom, submitAction, endTurn } from './service';
import { rollDice, resolveSpaceAction, getSpace } from './engine';
import type { RoomDoc, BoardPlayer } from './types';
import { PLAYER_COLORS } from './types';
import CircleBoard from './CircleBoard';
import ActionModal from './ActionModal';

interface Props {
  roomCode: string;
  onExit: () => void;
}

// ─── Dice face ────────────────────────────────────────────────────────────────

const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DiceFace({ value, size = 40 }: { value: number; size?: number }) {
  const dots = DICE_DOTS[value] ?? DICE_DOTS[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x={4} y={4} width={92} height={92} rx={18}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={3} />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={9} fill="#1e293b" />
      ))}
    </svg>
  );
}

// ─── GameScreen ───────────────────────────────────────────────────────────────

export default function GameScreen({ roomCode, onExit }: Props) {
  const { user } = useAuth();
  const uid = user?.uid ?? '';

  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    unsubRef.current?.();
    unsubRef.current = listenRoom(roomCode, setRoom);
    return () => {
      unsubRef.current?.();
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, [roomCode]);

  const myPlayer = room?.players.find(p => p.uid === uid) ?? null;
  const isMyTurn = room ? room.turnOrder[room.currentTurnIndex] === uid : false;
  const currentPlayer = room
    ? room.players.find(p => p.uid === room.turnOrder[room.currentTurnIndex]) ?? null
    : null;

  const handleRoll = useCallback(async () => {
    if (!room || !myPlayer || !isMyTurn || rolling) return;
    setRolling(true);
    setAnimating(true);

    // Animate dice roll
    let frame = 0;
    rollIntervalRef.current = setInterval(() => {
      setDisplayDice(Math.floor(Math.random() * 6) + 1);
      frame++;
      if (frame >= 12) {
        clearInterval(rollIntervalRef.current!);
        rollIntervalRef.current = null;

        const finalDice = rollDice();
        setDisplayDice(finalDice);
        setAnimating(false);

        // Compute new position + space action
        const newPos = (myPlayer.position + finalDice) % 36;
        const space = getSpace(newPos);
        const { action, updatedPlayer } = resolveSpaceAction(
          myPlayer,
          space,
          finalDice,
          room.players,
        );

        submitAction(roomCode, uid, finalDice, action, updatedPlayer)
          .then(() => setRolling(false));
      }
    }, 80);
  }, [room, myPlayer, isMyTurn, rolling, roomCode, uid]);

  const handleConfirm = useCallback(async () => {
    if (!room?.lastAction) return;
    await endTurn(roomCode, uid, room.lastAction.extraTurn);
  }, [room, roomCode, uid]);

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

  // ─── Winner screen ────────────────────────────────────────────────────────

  if (room.status === 'finished' && room.winner) {
    const winner = room.players.find(p => p.uid === room.winner);
    const sorted = [...room.players].sort((a, b) => b.points - a.points);
    const winColors = winner ? PLAYER_COLORS[winner.color] : null;
    return (
      <div className="lenda-root" style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-void)', padding: '0 16px',
        gap: 24,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
          <p className="lenda-label" style={{ marginBottom: 6 }}>Vencedor</p>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 32,
            letterSpacing: '0.1em', color: 'var(--wc-gold)',
          }}>
            {winner?.name ?? 'Jogador'}
          </div>
          {winColors && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: winColors.bg, border: `3px solid ${winColors.light}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#fff', fontWeight: 900,
              }}>
                {winner?.name.charAt(0)}
              </div>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="lenda-card" style={{ width: '100%', maxWidth: 320, padding: 16 }}>
          <p className="lenda-label" style={{ marginBottom: 10 }}>Placar Final</p>
          {sorted.map((p, i) => {
            const pc = PLAYER_COLORS[p.color];
            return (
              <div key={p.uid} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
                borderBottom: i < sorted.length - 1 ? '1px solid var(--border-default)' : 'none',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-muted)',
                  width: 20, textAlign: 'center',
                }}>
                  {i + 1}
                </span>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: pc.bg, border: `2px solid ${pc.light}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0,
                }}>
                  {p.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.nig} NIG · {p.legendCards} lendas</p>
                </div>
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: 20,
                  color: i === 0 ? 'var(--wc-gold)' : 'var(--text-secondary)',
                }}>
                  {p.points} pts
                </p>
              </div>
            );
          })}
        </div>

        <button onClick={onExit} className="lenda-btn-gold" style={{ padding: '14px 40px', fontSize: 15 }}>
          Voltar ao Início
        </button>
      </div>
    );
  }

  // ─── Active game ──────────────────────────────────────────────────────────

  const sortedPlayers = [...room.players].sort((a, b) => b.points - a.points);

  return (
    <div className="lenda-root" style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-void)', overflow: 'hidden',
    }}>
      {/* ── Top bar ── */}
      <header className="lenda-topbar">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="lenda-btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700 }}
        >
          <ChevronLeft size={13} />
          Sair
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={14} color="var(--wc-gold)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em' }}>
            LENDAS DA BOLA
          </span>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.06)',
          padding: '4px 8px', borderRadius: 6,
        }}>
          R {room.round}/{room.maxRounds}
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Turn indicator */}
        {currentPlayer && (
          <div style={{
            padding: '8px 14px',
            background: isMyTurn
              ? 'rgba(251,191,36,0.08)'
              : 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: PLAYER_COLORS[currentPlayer.color].bg,
              border: `1.5px solid ${PLAYER_COLORS[currentPlayer.color].light}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900, color: '#fff',
            }}>
              {currentPlayer.name.charAt(0)}
            </div>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
              {isMyTurn ? 'Sua vez de jogar!' : `Vez de ${currentPlayer.name}`}
            </p>
            {room.lastDice && (
              <div style={{ marginLeft: 'auto' }}>
                <DiceFace value={room.lastDice} size={28} />
              </div>
            )}
          </div>
        )}

        {/* Board */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '12px 8px 8px',
        }}>
          <CircleBoard
            players={room.players}
            currentTurnUid={room.turnOrder[room.currentTurnIndex] ?? ''}
            highlightSpace={room.lastAction?.spaceId}
          />
        </div>

        {/* Roll dice button */}
        {isMyTurn && room.phase === 'roll' && (
          <div style={{ padding: '8px 16px 12px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleRoll}
              disabled={rolling}
              className="lenda-btn-gold"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 32px', fontSize: 16,
                opacity: rolling ? 0.7 : 1,
              }}
            >
              <div style={{ animation: animating ? 'lenda-shake 0.5s ease infinite' : 'none' }}>
                <DiceFace value={displayDice} size={32} />
              </div>
              {rolling ? 'Rolando…' : 'Rolar Dados'}
            </button>
          </div>
        )}

        {/* Waiting for other player */}
        {!isMyTurn && room.phase === 'roll' && (
          <div style={{ textAlign: 'center', padding: '8px 16px 12px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              ⏳ Aguardando {currentPlayer?.name ?? 'jogador'} rolar os dados…
            </p>
          </div>
        )}

        {/* Scoreboard */}
        <div style={{ padding: '0 12px 16px' }}>
          <p className="lenda-label" style={{ marginBottom: 8, paddingLeft: 4 }}>Placar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sortedPlayers.map((p, rank) => {
              const pc = PLAYER_COLORS[p.color];
              const isMe = p.uid === uid;
              const isTurn = p.uid === room.turnOrder[room.currentTurnIndex];
              return (
                <div key={p.uid} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  borderRadius: 10, padding: '8px 10px',
                  background: isMe
                    ? 'rgba(251,191,36,0.06)'
                    : isTurn
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                  border: `1px solid ${isMe ? 'rgba(251,191,36,0.2)' : isTurn ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 14, textAlign: 'center', fontWeight: 700 }}>
                    {rank + 1}
                  </span>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: pc.bg, border: `2px solid ${pc.light}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 900, color: '#fff',
                  }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                      {isTurn && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--wc-gold)' }}>▶</span>}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                      💰 {p.nig} NIG · ⭐ {p.legendCards} · Casa {p.position}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontSize: 18,
                      color: rank === 0 ? 'var(--wc-gold)' : 'var(--text-secondary)',
                    }}>
                      {p.points}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>PTS</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game log */}
        {room.log.length > 0 && (
          <div style={{ padding: '0 12px 20px' }}>
            <p className="lenda-label" style={{ marginBottom: 6, paddingLeft: 4 }}>Log</p>
            <div className="lenda-card" style={{ padding: '10px 12px' }}>
              {[...room.log].reverse().slice(0, 6).map((entry, i) => (
                <p key={i} style={{
                  fontSize: 10, color: i === 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                  lineHeight: 1.5,
                  fontWeight: i === 0 ? 600 : 400,
                }}>
                  {entry}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Action modal ── */}
      {room.phase === 'action' && room.lastAction && (
        <ActionModal
          action={room.lastAction}
          player={room.players.find(p => p.uid === room.lastAction!.playerUid) ?? room.players[0]}
          roomCode={roomCode}
          isMyTurn={isMyTurn}
          onConfirm={handleConfirm}
        />
      )}

      {/* ── Exit confirm ── */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="lenda-card"
            style={{
              width: '100%', maxWidth: 300, padding: '24px 20px', textAlign: 'center',
              animation: 'lenda-pop-in 0.25s var(--ease-out)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>🚪</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', marginBottom: 8 }}>
              SAIR DO JOGO?
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Você perderá o jogo atual. Outros jogadores continuarão jogando.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowExitConfirm(false)} className="lenda-btn-ghost"
                style={{ flex: 1, padding: 12, fontSize: 13, borderRadius: 10 }}>
                Cancelar
              </button>
              <button onClick={onExit}
                style={{
                  flex: 1, padding: 12, fontSize: 13, fontWeight: 800,
                  background: '#b91c1c', border: 'none', borderRadius: 10,
                  color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
