import React, { useState } from 'react';
import type { GameState } from '../types';
import { getPawn } from '../data/pawns';
import { getSpace, GROUP_COLORS } from '../data/properties';

interface Props {
  state: GameState;
  onViewProperties?: (playerId: string) => void;
}

export default function PlayerPanel({ state, onViewProperties }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>👥</span> Jogadores
      </div>
      <div style={styles.list}>
        {state.players.map((player, index) => {
          const pawn = getPawn(player.pawnId);
          const isActive = index === state.currentPlayerIndex && state.phase === 'playing';
          const isExpanded = expandedId === player.id;

          // Get owned properties
          const ownedPositions = Object.entries(state.properties)
            .filter(([, ps]) => ps.ownerId === player.id)
            .map(([pos]) => Number(pos));

          return (
            <div
              key={player.id}
              style={{
                ...styles.playerCard,
                ...(isActive ? styles.playerCardActive : {}),
                ...(player.bankrupt ? styles.playerCardBankrupt : {}),
              }}
            >
              <div
                style={styles.playerMain}
                onClick={() => setExpandedId(isExpanded ? null : player.id)}
              >
                {/* Active indicator */}
                {isActive && <div style={styles.activeDot} />}

                {/* Pawn token */}
                <div style={{
                  ...styles.pawnToken,
                  background: pawn.color,
                  opacity: player.bankrupt ? 0.4 : 1,
                }}>
                  {pawn.emoji}
                </div>

                {/* Name & money */}
                <div style={styles.playerInfo}>
                  <div style={{
                    ...styles.playerName,
                    textDecoration: player.bankrupt ? 'line-through' : 'none',
                    opacity: player.bankrupt ? 0.5 : 1,
                  }}>
                    {player.name}
                    {player.bankrupt && ' 💀'}
                    {player.jailTurns > 0 && ' 🚔'}
                    {player.getOutOfJailCards > 0 && ' 🎫'}
                  </div>
                  <div style={{
                    ...styles.playerMoney,
                    color: player.money < 100 ? '#dc2626' : '#16a34a',
                  }}>
                    {player.bankrupt ? 'FALIDO' : `R$${player.money.toLocaleString('pt-BR')}`}
                  </div>
                </div>

                {/* Turn indicator */}
                {isActive && !player.bankrupt && (
                  <div style={styles.turnBadge}>VEZ</div>
                )}

                {/* Property count */}
                {!player.bankrupt && ownedPositions.length > 0 && (
                  <div style={styles.propCount}>
                    🏠{ownedPositions.length}
                  </div>
                )}
              </div>

              {/* Expanded property list */}
              {isExpanded && !player.bankrupt && ownedPositions.length > 0 && (
                <div style={styles.propList}>
                  {ownedPositions.map(pos => {
                    const space = getSpace(pos);
                    const ps = state.properties[pos];
                    const color = space.group ? GROUP_COLORS[space.group] : '#6b7280';
                    return (
                      <div key={pos} style={styles.propItem}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: color,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          ...styles.propName,
                          textDecoration: ps.mortgaged ? 'line-through' : 'none',
                          opacity: ps.mortgaged ? 0.6 : 1,
                        }}>
                          {space.name}
                        </span>
                        {ps.hotel && <span style={{ fontSize: 9 }}>🏨</span>}
                        {ps.houses > 0 && (
                          <span style={{ fontSize: 9 }}>
                            {'🏠'.repeat(ps.houses)}
                          </span>
                        )}
                        {ps.mortgaged && (
                          <span style={{ fontSize: 8, color: '#9ca3af' }}>H</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && !player.bankrupt && ownedPositions.length === 0 && (
                <div style={{ padding: '6px 10px', fontSize: 11, color: '#9ca3af' }}>
                  Nenhuma propriedade ainda.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(15, 36, 24, 0.95)',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    fontWeight: 700,
    fontSize: 13,
    color: '#d4af37',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  playerCard: {
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    transition: 'background 0.15s',
  },
  playerCardActive: {
    background: 'rgba(212,175,55,0.15)',
    border: '1px solid rgba(212,175,55,0.4)',
    boxShadow: '0 0 12px rgba(212,175,55,0.2)',
  },
  playerCardBankrupt: {
    opacity: 0.5,
    background: 'rgba(255,0,0,0.05)',
  },
  playerMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    cursor: 'pointer',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: '70%',
    background: '#d4af37',
    borderRadius: '0 2px 2px 0',
  },
  pawnToken: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.3)',
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#f9fafb',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playerMoney: {
    fontSize: 12,
    fontWeight: 700,
  },
  turnBadge: {
    padding: '2px 6px',
    background: '#d4af37',
    color: '#1a1a1a',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  propCount: {
    fontSize: 11,
    color: '#86efac',
    fontWeight: 600,
    flexShrink: 0,
  },
  propList: {
    padding: '0 10px 8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    borderTop: '1px solid rgba(255,255,255,0.07)',
    paddingTop: 6,
  },
  propItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  propName: {
    fontSize: 10,
    color: '#d1d5db',
    flex: 1,
  },
};
