import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Trophy, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { listenRoom, submitAction, endTurn, skipTurn } from './service';
import { rollDice, resolveSpaceAction, getSpace } from './engine';
import type { RoomDoc, BoardPlayer } from './types';
import { PLAYER_COLORS } from './types';
import { TOTAL_SPACES } from './data';
import { POSITION_LABEL } from './cards';
import CircleBoard from './CircleBoard';
import ActionModal from './ActionModal';

// ─── Single die component ─────────────────────────────────────────────────────

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function Die({ value, size = 64, spinning = false }: { value: number; size?: number; spinning?: boolean }) {
  const dots = DOT_POSITIONS[value] ?? DOT_POSITIONS[1];
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: 'linear-gradient(145deg, #ffffff, #e8e8e8)',
      borderRadius: size * 0.18,
      boxShadow: `0 ${size * 0.06}px ${size * 0.15}px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.8)`,
      position: 'relative',
      transition: spinning ? 'none' : 'transform 0.15s ease',
      animation: spinning ? 'lenda-shake 0.15s ease infinite' : 'none',
    }}>
      {dots.map(([cx, cy], i) => (
        <div key={i} style={{
          position: 'absolute',
          width: size * 0.17,
          height: size * 0.17,
          borderRadius: '50%',
          background: '#1a1a2e',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          left: `${cx}%`,
          top: `${cy}%`,
          transform: 'translate(-50%, -50%)',
        }} />
      ))}
    </div>
  );
}

// ─── GameScreen ───────────────────────────────────────────────────────────────

export default function GameScreen({ roomCode, onExit }: { roomCode: string; onExit: () => void }) {
  const { user } = useAuth();
  const uid = user?.uid ?? '';

  const [room, setRoom]           = useState<RoomDoc | null>(null);
  const [diceVal, setDiceVal]     = useState(1);
  const [spinning, setSpinning]   = useState(false);
  const [animPos, _setAnimPos]    = useState<Record<string, number>>({});
  const animPosRef                = useRef<Record<string, number>>({});
  function setAnimPos(val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) {
    const next = typeof val === 'function' ? val(animPosRef.current) : val;
    animPosRef.current = next;
    _setAnimPos(next);
  }
  const [busy, setBusy]           = useState(false);
  const [showExit, setShowExit]   = useState(false);
  const [showSquad, setShowSquad] = useState(false);
  const [squadUid, setSquadUid]   = useState<string | null>(null);
  const [boardSize, setBoardSize] = useState(() => Math.min(window.innerWidth - 8, 560));

  const unsubRef    = useRef<(() => void) | null>(null);
  const spinRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const walkRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive board size
  useEffect(() => {
    function update() { setBoardSize(Math.min(window.innerWidth - 8, 560)); }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    unsubRef.current?.();
    unsubRef.current = listenRoom(roomCode, setRoom);
    return () => {
      unsubRef.current?.();
      if (spinRef.current) clearInterval(spinRef.current);
      if (walkRef.current) clearInterval(walkRef.current);
    };
  }, [roomCode]);

  const myPlayer      = room?.players.find(p => p.uid === uid) ?? null;
  const isMyTurn      = !!room && room.turnOrder[room.currentTurnIndex] === uid;
  const currentPlayer = room
    ? room.players.find(p => p.uid === room.turnOrder[room.currentTurnIndex]) ?? null
    : null;

  // ── Step-by-step pawn animation ────────────────────────────────────────────
  function animateWalk(
    playerUid: string,
    fromPos: number,
    steps: number,
    onDone: () => void,
  ) {
    let step = 0;
    // Initialise animation at current position
    setAnimPos(prev => ({ ...prev, [playerUid]: fromPos }));
    walkRef.current = setInterval(() => {
      step++;
      const pos = (fromPos + step) % TOTAL_SPACES;
      setAnimPos(prev => ({ ...prev, [playerUid]: pos }));
      if (step >= steps) {
        clearInterval(walkRef.current!);
        walkRef.current = null;
        setTimeout(onDone, 180);
      }
    }, 260); // 260 ms per space
  }

  // ── Roll handler ───────────────────────────────────────────────────────────
  const handleRoll = useCallback(() => {
    if (!room || !myPlayer || !isMyTurn || busy) return;
    setBusy(true);
    setSpinning(true);

    // Spin die for ~0.9 s
    let tick = 0;
    spinRef.current = setInterval(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      tick++;
      if (tick >= 11) {
        clearInterval(spinRef.current!);
        spinRef.current = null;

        const final = rollDice();
        setDiceVal(final);
        setSpinning(false);

        // Walk pawn step by step
        animateWalk(myPlayer.uid, myPlayer.position, final, () => {
          // After walk, compute & submit action
          const newPos  = (myPlayer.position + final) % TOTAL_SPACES;
          const space   = getSpace(newPos);
          const { action, updatedPlayer } = resolveSpaceAction(myPlayer, space, final, room.players);
          submitAction(roomCode, uid, final, action, updatedPlayer).finally(() => setBusy(false));
        });
      }
    }, 80);
  }, [room, myPlayer, isMyTurn, busy, roomCode, uid]);

  const handleConfirm = useCallback(async () => {
    if (!room?.lastAction) return;
    await endTurn(roomCode, uid, room.lastAction.extraTurn);
  }, [room, roomCode, uid]);

  const handleSkipTurn = useCallback(async () => {
    if (!isMyTurn || !myPlayer?.skipsNext) return;
    await skipTurn(roomCode, uid);
  }, [isMyTurn, myPlayer, roomCode, uid]);

  // ── Loading ────────────────────────────────────────────────────────────────
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

  // ── Winner screen ──────────────────────────────────────────────────────────
  if (room.status === 'finished' && room.winner) {
    const winner = room.players.find(p => p.uid === room.winner);
    const sorted = [...room.players].sort((a, b) => b.points - a.points);
    return (
      <div className="lenda-root" style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-void)', padding: '0 16px', gap: 24,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
          <p className="lenda-label" style={{ marginBottom: 6 }}>Vencedor</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.1em', color: 'var(--wc-gold)' }}>
            {winner?.name ?? 'Jogador'}
          </p>
        </div>

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
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-muted)', width: 20, textAlign: 'center' }}>
                  {i + 1}
                </span>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: pc.bg, border: `2px solid ${pc.light}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, color: '#fff',
                }}>
                  {p.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.nig} NIG</p>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: i === 0 ? 'var(--wc-gold)' : 'var(--text-secondary)' }}>
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

  // ── Active game ────────────────────────────────────────────────────────────
  const sortedPlayers = [...room.players].sort((a, b) => b.points - a.points);
  const canRoll = isMyTurn && room.phase === 'roll' && !busy;

  return (
    <div className="lenda-root" style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-void)', overflow: 'hidden',
    }}>
      {/* ── Top bar ── */}
      <header className="lenda-topbar" style={{ flexShrink: 0 }}>
        <button onClick={() => setShowExit(true)} className="lenda-btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700 }}>
          <ChevronLeft size={13} /> Sair
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={14} color="var(--wc-gold)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em' }}>
            LENDAS DA BOLA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => { setSquadUid(uid); setShowSquad(true); }}
            className="lenda-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 10, fontWeight: 800 }}
          >
            <Users size={12} />
            🃏
          </button>
          <div style={{
            fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 6,
          }}>
            R {room.round}/{room.maxRounds}
          </div>
        </div>
      </header>

      {/* ── Main scrollable area ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Turn banner */}
        {currentPlayer && (
          <div style={{
            width: '100%', padding: '8px 16px',
            background: isMyTurn ? 'rgba(251,191,36,0.09)' : 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: PLAYER_COLORS[currentPlayer.color].bg,
              border: `2px solid ${PLAYER_COLORS[currentPlayer.color].light}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900, color: '#fff',
            }}>
              {currentPlayer.name.charAt(0)}
            </div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
              {isMyTurn && myPlayer?.skipsNext
                ? '😴 Seu turno está perdido — confirme para continuar'
                : isMyTurn
                ? '🎲 Sua vez de jogar!'
                : `⏳ Vez de ${currentPlayer.name}`}
            </p>
          </div>
        )}

        {/* ── Board + dice area ── */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '10px 0 6px',
          background: 'radial-gradient(ellipse at center, rgba(22,100,50,0.08) 0%, transparent 70%)',
        }}>
          {/* Board */}
          <CircleBoard
            players={room.players}
            animPos={animPos}
            currentTurnUid={room.turnOrder[room.currentTurnIndex] ?? ''}
            highlightSpace={room.lastAction?.spaceId}
            size={boardSize}
          />

          {/* Dice + Roll button */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 20, padding: '14px 0 8px',
          }}>
            <Die value={diceVal} size={68} spinning={spinning} />

            {isMyTurn && room.phase === 'roll' && myPlayer?.skipsNext ? (
              <button
                onClick={handleSkipTurn}
                style={{
                  padding: '16px 28px', fontSize: 15,
                  fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(71,85,105,0.4)',
                  border: '1.5px solid rgba(148,163,184,0.3)',
                  borderRadius: 14, color: '#94a3b8', cursor: 'pointer',
                }}
              >
                😴 TURNO PERDIDO
              </button>
            ) : canRoll ? (
              <button
                onClick={handleRoll}
                className="lenda-btn-gold"
                style={{
                  padding: '16px 36px', fontSize: 17,
                  fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                🎲 ROLAR DADO
              </button>
            ) : isMyTurn && room.phase === 'roll' && busy ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>
                Rolando…
              </div>
            ) : !isMyTurn && room.phase === 'roll' ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Aguardando {currentPlayer?.name}…
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Scoreboard ── */}
        <div style={{ width: '100%', padding: '0 12px 12px' }}>
          <p className="lenda-label" style={{ marginBottom: 6, paddingLeft: 2 }}>Placar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sortedPlayers.map((p, rank) => {
              const pc = PLAYER_COLORS[p.color];
              const isMe   = p.uid === uid;
              const isTurn = p.uid === room.turnOrder[room.currentTurnIndex];
              return (
                <div key={p.uid} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  borderRadius: 10, padding: '7px 10px',
                  background: isMe  ? 'rgba(251,191,36,0.07)' : isTurn ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: `1px solid ${isMe ? 'rgba(251,191,36,0.22)' : isTurn ? 'rgba(255,255,255,0.09)' : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 14, textAlign: 'center', fontWeight: 700 }}>
                    {rank + 1}
                  </span>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: pc.bg, border: `2px solid ${pc.light}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 900, color: '#fff',
                  }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}{isTurn && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--wc-gold)' }}>▶</span>}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                      💰 {p.nig} · ⭐ {p.legendCards} · Casa {animPos[p.uid] ?? p.position}
                    </p>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontSize: 20,
                    color: rank === 0 ? 'var(--wc-gold)' : 'var(--text-secondary)',
                  }}>
                    {p.points}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginLeft: 2 }}>pts</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Log ── */}
        {room.log.length > 0 && (
          <div style={{ width: '100%', padding: '0 12px 20px' }}>
            <p className="lenda-label" style={{ marginBottom: 5, paddingLeft: 2 }}>Log</p>
            <div className="lenda-card" style={{ padding: '10px 12px' }}>
              {[...room.log].reverse().slice(0, 5).map((entry, i) => (
                <p key={i} style={{
                  fontSize: 10, lineHeight: 1.5,
                  color: i === 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontWeight: i === 0 ? 600 : 400,
                }}>{entry}</p>
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

      {/* ── Squad modal ── */}
      {showSquad && (() => {
        const target = room.players.find(p => p.uid === squadUid) ?? myPlayer;
        if (!target) return null;
        const pc = PLAYER_COLORS[target.color];
        const byPos: Record<string, typeof target.cards> = { GK: [], DEF: [], MID: [], ATK: [] };
        for (const c of target.cards) byPos[c.position].push(c);
        const totalStars = target.cards.reduce((s, c) => s + c.stars, 0);
        const posColors: Record<string, string> = { GK: '#7c3aed', DEF: '#2563eb', MID: '#16a34a', ATK: '#dc2626' };
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }} onClick={() => setShowSquad(false)}>
            <div style={{
              width: '100%', maxWidth: 440, maxHeight: '88dvh',
              background: '#1e293b', borderRadius: '24px 24px 0 0',
              borderTop: `3px solid ${pc.light}`,
              display: 'flex', flexDirection: 'column',
              animation: 'lenda-slide-up 0.3s var(--ease-out)',
            }} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ padding: '16px 20px 10px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: pc.bg, border: `2px solid ${pc.light}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 900, color: '#fff',
                  }}>
                    {target.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 900, color: '#f8fafc' }}>
                      Elenco de {target.name}
                    </p>
                    <p style={{ fontSize: 10, color: '#64748b' }}>
                      {target.cards.length} jogadores · {totalStars}★ total · {target.defenseTokens} fichas defesa · Ataque 1-{target.attackRange}
                    </p>
                  </div>
                  <button onClick={() => setShowSquad(false)} className="lenda-btn-ghost"
                    style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                    Fechar
                  </button>
                </div>
                {/* Switch between players */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {room.players.map(p => {
                    const c = PLAYER_COLORS[p.color];
                    return (
                      <button key={p.uid}
                        onClick={() => setSquadUid(p.uid)}
                        style={{
                          flexShrink: 0,
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 800,
                          background: squadUid === p.uid ? c.bg : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${squadUid === p.uid ? c.light : 'rgba(255,255,255,0.1)'}`,
                          color: squadUid === p.uid ? '#fff' : '#94a3b8',
                          cursor: 'pointer',
                        }}>
                        {p.name.charAt(0)} {p.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Cards by position */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '12px 20px 20px' }}>
                {(['GK', 'DEF', 'MID', 'ATK'] as const).map(pos => {
                  const cards = byPos[pos];
                  if (cards.length === 0) return null;
                  return (
                    <div key={pos} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: '#fff',
                          background: posColors[pos], padding: '2px 6px', borderRadius: 4,
                        }}>
                          {POSITION_LABEL[pos]}
                        </span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{cards.length} jogadores</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {cards.map(card => (
                          <div key={card.id} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8, padding: '5px 8px',
                          }}>
                            <span style={{ fontSize: 16 }}>{card.flag}</span>
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 800, color: '#f1f5f9' }}>{card.name}</p>
                              <p style={{ fontSize: 9, color: '#fbbf24' }}>{'★'.repeat(card.stars)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Exit confirm ── */}
      {showExit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setShowExit(false)}>
          <div className="lenda-card"
            style={{ width: '100%', maxWidth: 300, padding: '24px 20px', textAlign: 'center', animation: 'lenda-pop-in 0.25s var(--ease-out)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🚪</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', marginBottom: 8 }}>
              SAIR DO JOGO?
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Você perderá o jogo atual.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowExit(false)} className="lenda-btn-ghost"
                style={{ flex: 1, padding: 12, fontSize: 13, borderRadius: 10 }}>
                Cancelar
              </button>
              <button onClick={onExit}
                style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 800, background: '#b91c1c', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
