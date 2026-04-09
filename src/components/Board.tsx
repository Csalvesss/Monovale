import React, { useState } from 'react';
import type { GameState, BoardSpace } from '../types';
import { positionToGrid, getBoardSide, GROUP_COLORS } from '../data/properties';
import { getPawn } from '../data/pawns';

interface Props {
  state: GameState;
  onSpaceClick?: (position: number) => void;
}

// Grid dimensions
const CORNER = 82;
const CELL_W = 52;
const CELL_H = 82;
const BOARD_SIZE = CORNER * 2 + CELL_W * 9;

export default function Board({ state, onSpaceClick }: Props) {
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);

  // Group players by position
  const playersByPos: Record<number, typeof state.players> = {};
  for (const p of state.players) {
    if (!p.bankrupt) {
      if (!playersByPos[p.position]) playersByPos[p.position] = [];
      playersByPos[p.position].push(p);
    }
  }

  const cells: React.ReactNode[] = [];

  // Render all 40 spaces
  for (let pos = 0; pos < 40; pos++) {
    const space = state.spaces[pos];
    const { row, col } = positionToGrid(pos);
    const side = getBoardSide(pos);
    const propState = state.properties[pos];
    const playersHere = playersByPos[pos] ?? [];
    const isHovered = hoveredPos === pos;
    const isPending = state.pendingPropertyPosition === pos;

    cells.push(
      <div
        key={pos}
        onClick={() => onSpaceClick?.(pos)}
        onMouseEnter={() => setHoveredPos(pos)}
        onMouseLeave={() => setHoveredPos(null)}
        style={getCellStyle(pos, side, row, col, isHovered, isPending)}
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
  cells.push(
    <div
      key="center"
      style={{
        gridRow: '2 / 11',
        gridColumn: '2 / 11',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #14532d, #1a6b3a, #15803d)',
        borderRadius: 6,
        padding: 8,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 4, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>🗺️</div>
      <div style={{
        fontFamily: "'Boogaloo', sans-serif",
        fontSize: 26,
        color: '#d4af37',
        letterSpacing: '2px',
        textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        textAlign: 'center',
        lineHeight: 1.1,
      }}>
        MONO<br />VALE
      </div>
      <div style={{ fontSize: 10, color: '#86efac', marginTop: 5, textAlign: 'center', fontWeight: 800, letterSpacing: '0.5px' }}>
        Vale do Paraíba
      </div>
      <div style={{ fontSize: 10, color: '#d4af37', marginTop: 8, textAlign: 'center', opacity: 0.9, fontWeight: 700 }}>
        🏦 Sr. Marinho
      </div>

      {/* Mini legend */}
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', maxWidth: 200 }}>
        {Object.entries(GROUP_COLORS).slice(0, 8).map(([group, color]) => (
          <div key={group} style={{
            width: 12,
            height: 12,
            borderRadius: 2,
            background: color,
            opacity: 0.9,
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
      border: '4px solid #0f3a1a',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 8px 0 rgba(15,58,26,0.5), 0 12px 40px rgba(0,0,0,0.35)',
      flexShrink: 0,
    }}>
      {cells}
    </div>
  );
}

// ─── Cell Style ──────────────────────────────────────────────────────────────

function getCellStyle(
  pos: number,
  side: string,
  row: number,
  col: number,
  isHovered: boolean,
  isPending: boolean
): React.CSSProperties {
  const isCorner = side === 'corner';

  return {
    gridRow: row,
    gridColumn: col,
    background: isPending
      ? '#fef9c3'
      : isHovered
        ? '#f5f5dc'
        : '#faf8f0',
    border: '1px solid rgba(139,94,60,0.18)',
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
  const groupColor = space.group ? GROUP_COLORS[space.group] : null;
  const ownerPlayer = propState?.ownerId ? state.players.find(p => p.id === propState.ownerId) : null;
  const ownerPawn = ownerPlayer ? getPawn(ownerPlayer.pawnId) : null;

  const isCorner = side === 'corner';

  if (isCorner) {
    return <CornerCell space={space} players={players} state={state} />;
  }

  const isVertical = side === 'left' || side === 'right';

  const bandStyle: React.CSSProperties = {
    background: groupColor ?? (propState?.mortgaged ? '#9ca3af' : 'transparent'),
    flexShrink: 0,
  };

  if (!isVertical) {
    // top or bottom — band is horizontal strip
    Object.assign(bandStyle, { height: 14, width: '100%' });
  } else {
    // left or right — band is vertical strip
    Object.assign(bandStyle, { width: 14, height: '100%', minHeight: CELL_W });
  }

  const content = (
    <>
      {/* Ownership dot */}
      {ownerPawn && (
        <div style={{
          position: 'absolute',
          top: side === 'bottom' ? 2 : side === 'top' ? 'auto' : 2,
          bottom: side === 'top' ? 2 : undefined,
          left: side === 'right' ? 2 : side === 'left' ? 'auto' : 2,
          right: side === 'left' ? 2 : undefined,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ownerPawn.color,
          border: '1px solid white',
          zIndex: 2,
        }} />
      )}

      {/* Mortgaged overlay */}
      {propState?.mortgaged && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(156,163,175,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>HIPOT</span>
        </div>
      )}

      {/* Houses/Hotel */}
      {propState && !propState.mortgaged && (propState.houses > 0 || propState.hotel) && (
        <div style={{
          position: 'absolute',
          top: side === 'bottom' ? 16 : undefined,
          bottom: side === 'top' ? 16 : undefined,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          gap: 1,
        }}>
          {propState.hotel
            ? <span style={{ fontSize: 9, lineHeight: 1 }}>🏨</span>
            : Array.from({ length: propState.houses }, (_, i) => (
                <span key={i} style={{ fontSize: 8, lineHeight: 1 }}>🏠</span>
              ))
          }
        </div>
      )}

      {/* Player tokens */}
      <PlayerTokens players={players} size="sm" />
    </>
  );

  const textContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '2px 1px',
      gap: 1,
      minWidth: 0,
      overflow: 'hidden',
    }}>
      {space.icon && (
        <span style={{ fontSize: isVertical ? 11 : 13, lineHeight: 1 }}>{space.icon}</span>
      )}
      <span style={{
        fontSize: 7.5,
        fontWeight: 700,
        color: '#1f2937',
        textAlign: 'center',
        lineHeight: 1.2,
        wordBreak: 'break-word',
        hyphens: 'auto',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {space.name}
      </span>
      {space.price !== undefined && (
        <span style={{ fontSize: 7, color: '#374151', fontWeight: 600 }}>
          R${space.price}
        </span>
      )}
      {space.taxAmount !== undefined && (
        <span style={{ fontSize: 7, color: '#dc2626', fontWeight: 600 }}>
          R${space.taxAmount}
        </span>
      )}
    </div>
  );

  if (!isVertical) {
    // bottom or top
    return (
      <div style={{
        display: 'flex',
        flexDirection: side === 'bottom' ? 'column-reverse' : 'column',
        height: '100%',
        position: 'relative',
      }}>
        <div style={bandStyle} />
        {textContent}
        {content}
      </div>
    );
  }

  // left or right
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
        gap: 1,
        padding: '2px 0',
        position: 'relative',
      }}>
        {space.icon && <span style={{ fontSize: 11, lineHeight: 1 }}>{space.icon}</span>}
        <span style={{
          fontSize: 7.5,
          fontWeight: 700,
          color: '#1f2937',
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {space.name}
        </span>
        {space.price !== undefined && (
          <span style={{ fontSize: 7, color: '#374151', fontWeight: 600 }}>R${space.price}</span>
        )}
        {space.taxAmount !== undefined && (
          <span style={{ fontSize: 7, color: '#dc2626', fontWeight: 600 }}>R${space.taxAmount}</span>
        )}
        {/* Owner dot */}
        {ownerPawn && (
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: ownerPawn.color,
            border: '1px solid white',
            marginTop: 2,
          }} />
        )}
      </div>
      <PlayerTokens players={players} size="sm" vertical />
      {propState?.mortgaged && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(156,163,175,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
  const icons: Record<string, string> = {
    go: '🛣️',
    jail: '🚔',
    free_parking: '🏔️',
    go_to_jail: '🚨',
  };

  const labels: Record<string, string[]> = {
    go: ['PEDÁGIO', 'DA DUTRA', 'Receba', 'R$200'],
    jail: ['PRESO NO', 'DETRAN', 'Visitando'],
    free_parking: ['MIRANTE', 'DO VALE'],
    go_to_jail: ['MULTA NA', 'VIA DUTRA'],
  };

  const colors: Record<string, string> = {
    go: '#dcfce7',
    jail: '#fef3c7',
    free_parking: '#dbeafe',
    go_to_jail: '#fee2e2',
  };

  return (
    <div style={{
      background: colors[space.type] ?? '#f9fafb',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      gap: 2,
      position: 'relative',
    }}>
      <span style={{ fontSize: 22 }}>{icons[space.type] ?? '⭐'}</span>
      {(labels[space.type] ?? [space.name]).map((line, i) => (
        <span key={i} style={{
          fontSize: 8,
          fontWeight: i === 0 ? 800 : 600,
          color: '#1f2937',
          textAlign: 'center',
          lineHeight: 1.1,
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
  const tokenSize = size === 'md' ? 18 : 14;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 1,
      justifyContent: 'center',
      padding: 2,
      ...(vertical ? { flexDirection: 'column' } : {}),
    }}>
      {players.map(p => {
        const pawn = getPawn(p.pawnId);
        return (
          <div
            key={p.id}
            title={p.name}
            style={{
              width: tokenSize,
              height: tokenSize,
              borderRadius: '50%',
              background: pawn.color,
              border: '1.5px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size === 'md' ? 11 : 9,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              flexShrink: 0,
              zIndex: 10,
            }}
          >
            {pawn.emoji}
          </div>
        );
      })}
    </div>
  );
}

