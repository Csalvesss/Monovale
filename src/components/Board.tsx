import React, { useEffect, useRef, useState } from 'react';
import type { GameState, BoardSpace } from '../types';
import { positionToGrid, getBoardSide, GROUP_COLORS } from '../data/properties';
import { getPawn } from '../data/pawns';

interface Props {
  state: GameState;
  onSpaceClick?: (position: number) => void;
}

const CORNER   = 100;
const CELL_W   = 72;   // was 64 — wider for more readable text
const BOARD_SIZE = CORNER * 2 + CELL_W * 9; // 830

// ─── Die face (SVG dots) ──────────────────────────────────────────────────────

const DOT_POS: Record<number, [number, number][]> = {
  1: [[21, 21]],
  2: [[11, 11], [31, 31]],
  3: [[11, 11], [21, 21], [31, 31]],
  4: [[11, 11], [31, 11], [11, 31], [31, 31]],
  5: [[11, 11], [31, 11], [21, 21], [11, 31], [31, 31]],
  6: [[11, 10], [31, 10], [11, 21], [31, 21], [11, 32], [31, 32]],
};

function Die({ value }: { value: number }) {
  const dots = DOT_POS[value] ?? DOT_POS[1];
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}>
      <rect x="1" y="1" width="40" height="40" rx="9" fill="white" stroke="rgba(15,23,42,0.12)" strokeWidth="1.5" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#1f2937" />
      ))}
    </svg>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export default function Board({ state, onSpaceClick }: Props) {
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);

  // ── Pawn step-by-step animation ──
  const [visualPositions, setVisualPositions] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    state.players.forEach(p => { m[p.id] = p.position; });
    return m;
  });
  const lastPosRef    = useRef<Record<string, number>>({});
  const animTimers    = useRef<ReturnType<typeof setTimeout>[]>([]);

  function cancelAnim() {
    animTimers.current.forEach(clearTimeout);
    animTimers.current = [];
  }

  // Stable key: changes whenever any player position changes
  const posKey = state.players.map(p => `${p.id}:${p.position}`).join(',');

  useEffect(() => {
    cancelAnim();

    for (const player of state.players) {
      const from = lastPosRef.current[player.id] ?? player.position;
      const to   = player.position;
      lastPosRef.current[player.id] = to;

      if (from === to) continue;

      // Forward steps (wrapping 40)
      const steps = to > from ? to - from : 40 - from + to;

      if (steps > 12 || player.bankrupt) {
        // Teleport: jail, card move, bankruptcy
        setVisualPositions(prev => ({ ...prev, [player.id]: to }));
        continue;
      }

      for (let i = 1; i <= steps; i++) {
        const stepPos = (from + i) % 40;
        const t = setTimeout(() => {
          setVisualPositions(prev => ({ ...prev, [player.id]: stepPos }));
        }, i * 130);
        animTimers.current.push(t);
      }
    }

    return cancelAnim;
  }, [posKey]); // eslint-disable-line

  // Build per-position map using visual positions
  const playersByPos: Record<number, typeof state.players> = {};
  for (const p of state.players) {
    if (p.bankrupt) continue;
    const vp = visualPositions[p.id] ?? p.position;
    if (!playersByPos[vp]) playersByPos[vp] = [];
    playersByPos[vp].push(p);
  }

  const cells: React.ReactNode[] = [];

  for (let pos = 0; pos < 40; pos++) {
    const space      = state.spaces[pos];
    const { row, col } = positionToGrid(pos);
    const side       = getBoardSide(pos);
    const propState  = state.properties[pos];
    const playersHere = playersByPos[pos] ?? [];
    const isHovered  = hoveredPos === pos;
    const isPending  = state.pendingPropertyPosition === pos;

    cells.push(
      <div
        key={pos}
        onClick={() => onSpaceClick?.(pos)}
        onMouseEnter={() => setHoveredPos(pos)}
        onMouseLeave={() => setHoveredPos(null)}
        style={getCellStyle(side, row, col, isHovered, isPending)}
      >
        <CellContent
          space={space}
          propState={propState}
          side={side}
          players={playersHere}
          state={state}
        />
      </div>
    );
  }

  // Center area
  const diceRolled = state.dice[0] > 0;
  const diceTotal  = state.dice[0] + state.dice[1];
  const currentPlayer = state.players[state.currentPlayerIndex];

  cells.push(
    <div
      key="center"
      style={{
        gridRow: '2 / 11',
        gridColumn: '2 / 11',
        background: 'linear-gradient(160deg, #0d4a27 0%, #165a30 50%, #1a6b3a 100%)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background texture lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
        backgroundSize: '20px 20px',
      }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.12" />
          <path d="M8 28L14 16L20 22L26 12L32 28H8Z" fill="white" fillOpacity="0.9" />
        </svg>
        <span style={{
          fontFamily: 'var(--font-title)',
          fontSize: 20,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.3px',
        }}>Monovale</span>
      </div>

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Vale do Paraíba
      </div>

      {/* Dice display */}
      {diceRolled && (
        <div
          key={state.dice.join('+')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            animation: 'pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Die value={state.dice[0]} />
            <div style={{ width: 6, height: 2, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
            <Die value={state.dice[1]} />
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 99,
            padding: '3px 14px',
            fontSize: 14,
            fontWeight: 800,
            color: '#fff',
            fontFamily: 'var(--font-title)',
            letterSpacing: '0.5px',
          }}>
            = {diceTotal}
            {state.dice[0] === state.dice[1] && (
              <span style={{ marginLeft: 6, fontSize: 11, color: '#fcd34d' }}>par!</span>
            )}
          </div>
        </div>
      )}

      {/* Current player indicator */}
      {currentPlayer && state.phase === 'playing' && (
        <div style={{
          marginTop: diceRolled ? 6 : 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 99,
          padding: '4px 12px',
          position: 'relative',
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: getPawn(currentPlayer.pawnId).color,
            boxShadow: `0 0 0 2px ${getPawn(currentPlayer.pawnId).color}44`,
            animation: 'pulse-ring 1.5s ease infinite',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentPlayer.name}
          </span>
        </div>
      )}

      {/* Color legend */}
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: 180 }}>
        {Object.entries(GROUP_COLORS).slice(0, 8).map(([group, color]) => (
          <div key={group} style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            background: color,
            opacity: 0.8,
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      width: BOARD_SIZE,
      height: BOARD_SIZE,
      display: 'grid',
      gridTemplateColumns: `${CORNER}px repeat(9, ${CELL_W}px) ${CORNER}px`,
      gridTemplateRows: `${CORNER}px repeat(9, ${CELL_W}px) ${CORNER}px`,
      border: '3px solid #0d3d18',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      flexShrink: 0,
      background: '#fff',
    }}>
      {cells}
    </div>
  );
}

// ─── Cell Style ───────────────────────────────────────────────────────────────

function getCellStyle(
  side: string,
  row: number,
  col: number,
  isHovered: boolean,
  isPending: boolean,
): React.CSSProperties {
  return {
    gridRow:  row,
    gridColumn: col,
    background: isPending
      ? '#fef9c3'
      : isHovered
        ? '#f0fdf4'
        : '#ffffff',
    border: '1px solid rgba(15,23,42,0.09)',
    cursor: isHovered ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background 0.1s',
    boxSizing: 'border-box',
    outline: isPending ? '2px solid #c9a84c' : undefined,
  };
}

// ─── Cell Content ─────────────────────────────────────────────────────────────

function CellContent({
  space,
  propState,
  side,
  players,
  state,
}: {
  space: BoardSpace;
  propState?: typeof state.properties[number];
  side: ReturnType<typeof getBoardSide>;
  players: typeof state.players;
  state: GameState;
}) {
  const groupColor  = space.group ? GROUP_COLORS[space.group] : null;
  const ownerPlayer = propState?.ownerId ? state.players.find(p => p.id === propState.ownerId) : null;
  const ownerPawn   = ownerPlayer ? getPawn(ownerPlayer.pawnId) : null;

  if (side === 'corner') {
    return <CornerCell space={space} players={players} state={state} />;
  }

  const isVertical = side === 'left' || side === 'right';

  const bandStyle: React.CSSProperties = {
    background: propState?.mortgaged ? '#d1d5db' : (groupColor ?? 'transparent'),
    flexShrink: 0,
  };
  if (!isVertical) {
    Object.assign(bandStyle, { height: 16, width: '100%' });
  } else {
    Object.assign(bandStyle, { width: 16, height: '100%', minHeight: CELL_W });
  }

  const overlays = (
    <>
      {ownerPawn && (
        <div style={{
          position: 'absolute',
          top:   side === 'bottom' ? 2 : side === 'top' ? 'auto' : 2,
          bottom: side === 'top'   ? 2 : undefined,
          left:  side === 'right'  ? 2 : side === 'left' ? 'auto' : 2,
          right: side === 'left'   ? 2 : undefined,
          width: 9, height: 9,
          borderRadius: '50%',
          background: ownerPawn.color,
          border: '1.5px solid white',
          zIndex: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      )}

      {propState?.mortgaged && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(156,163,175,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, transform: isVertical ? 'rotate(-90deg)' : undefined }}>HIPOT</span>
        </div>
      )}

      {propState && !propState.mortgaged && (propState.houses > 0 || propState.hotel) && (
        <div style={{
          position: 'absolute',
          top:    side === 'bottom' ? 18 : undefined,
          bottom: side === 'top'    ? 18 : undefined,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          gap: 1,
        }}>
          {propState.hotel
            ? <span style={{ fontSize: 10, lineHeight: 1 }}>🏨</span>
            : Array.from({ length: propState.houses }, (_, i) => (
                <span key={i} style={{ fontSize: 9, lineHeight: 1 }}>🏠</span>
              ))
          }
        </div>
      )}

      <PlayerTokens players={players} size="sm" />
    </>
  );

  const nameStyle: React.CSSProperties = {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 1.25,
    wordBreak: 'break-word',
    hyphens: 'auto',
    maxWidth: '100%',
  };

  const priceStyle: React.CSSProperties = {
    fontSize: 8,
    color: '#4b5563',
    fontWeight: 600,
  };

  if (!isVertical) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: side === 'bottom' ? 'column-reverse' : 'column',
        height: '100%',
        position: 'relative',
      }}>
        <div style={bandStyle} />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '2px 2px',
          gap: 1,
          overflow: 'hidden',
        }}>
          {space.icon && <span style={{ fontSize: 14, lineHeight: 1 }}>{space.icon}</span>}
          <span style={nameStyle}>{space.name}</span>
          {space.price     !== undefined && <span style={priceStyle}>R${space.price}</span>}
          {space.taxAmount !== undefined && <span style={{ ...priceStyle, color: '#dc2626' }}>R${space.taxAmount}</span>}
        </div>
        {overlays}
      </div>
    );
  }

  // Vertical cells (left/right)
  return (
    <div style={{
      display: 'flex',
      flexDirection: side === 'left' ? 'row' : 'row-reverse',
      height: '100%',
      position: 'relative',
    }}>
      <div style={bandStyle} />
      <div style={{
        writingMode: 'vertical-lr',
        transform: side === 'left' ? 'rotate(180deg)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 2,
        padding: '3px 0',
        position: 'relative',
      }}>
        {space.icon && <span style={{ fontSize: 13, lineHeight: 1 }}>{space.icon}</span>}
        <span style={{ ...nameStyle, maxWidth: undefined }}>
          {space.name}
        </span>
        {space.price     !== undefined && <span style={priceStyle}>R${space.price}</span>}
        {space.taxAmount !== undefined && <span style={{ ...priceStyle, color: '#dc2626' }}>R${space.taxAmount}</span>}
        {ownerPawn && (
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: ownerPawn.color,
            border: '1.5px solid white',
            marginTop: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        )}
      </div>
      <PlayerTokens players={players} size="sm" vertical />
      {propState?.mortgaged && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(156,163,175,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          <span style={{ fontSize: 7, color: '#6b7280', fontWeight: 700, writingMode: 'vertical-lr' }}>HIP</span>
        </div>
      )}
    </div>
  );
}

// ─── Corner Cell ──────────────────────────────────────────────────────────────

function CornerCell({ space, players, state }: {
  space: BoardSpace;
  players: typeof state.players;
  state: GameState;
}) {
  const configs: Record<string, { bg: string; icon: string; lines: string[] }> = {
    go:           { bg: '#dcfce7', icon: '🛣️', lines: ['PEDÁGIO', 'DA DUTRA', 'Receba R$200'] },
    jail:         { bg: '#fef3c7', icon: '🚔', lines: ['PRESO NO', 'DETRAN', 'Visitando'] },
    free_parking: { bg: '#dbeafe', icon: '🏔️', lines: ['MIRANTE', 'DO VALE'] },
    go_to_jail:   { bg: '#fee2e2', icon: '🚨', lines: ['MULTA NA', 'VIA DUTRA'] },
  };

  const cfg = configs[space.type] ?? { bg: '#f9fafb', icon: '⭐', lines: [space.name] };

  return (
    <div style={{
      background: cfg.bg,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      gap: 2,
      position: 'relative',
    }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{cfg.icon}</span>
      {cfg.lines.map((line, i) => (
        <span key={i} style={{
          fontSize: i === 2 ? 8 : 9,
          fontWeight: i === 0 ? 800 : 600,
          color: '#111827',
          textAlign: 'center',
          lineHeight: 1.15,
        }}>{line}</span>
      ))}
      <PlayerTokens players={players} size="md" />
    </div>
  );
}

// ─── Player Tokens ────────────────────────────────────────────────────────────

function PlayerTokens({ players, size, vertical }: {
  players: import('../types').Player[];
  size: 'sm' | 'md';
  vertical?: boolean;
}) {
  if (players.length === 0) return null;
  const sz = size === 'md' ? 20 : 15;
  const fs = size === 'md' ? 12 : 9;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      justifyContent: 'center',
      padding: 2,
      position: 'absolute',
      bottom: vertical ? 'auto' : 2,
      right: vertical ? 2 : 'auto',
      top: vertical ? 2 : 'auto',
      zIndex: 10,
      ...(vertical ? { flexDirection: 'column' } : {}),
    }}>
      {players.map(p => {
        const pawn = getPawn(p.pawnId);
        return (
          <div
            key={p.id}
            title={p.name}
            style={{
              width: sz,
              height: sz,
              borderRadius: '50%',
              background: pawn.color,
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: fs,
              boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
              flexShrink: 0,
            }}
          >
            {pawn.emoji}
          </div>
        );
      })}
    </div>
  );
}
