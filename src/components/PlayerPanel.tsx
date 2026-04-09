import React, { useState } from 'react';
import type { GameState } from '../types';
import { getPawn } from '../data/pawns';
import { getSpace, GROUP_COLORS } from '../data/properties';

interface Props {
  state: GameState;
}

export default function PlayerPanel({ state }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={S.panel}>
      <div style={S.panelHeader}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span style={S.panelHeaderTitle}>JOGADORES</span>
      </div>

      <div style={S.list}>
        {state.players.map((player, index) => {
          const pawn = getPawn(player.pawnId);
          const isActive = index === state.currentPlayerIndex && state.phase === 'playing';
          const isExpanded = expandedId === player.id;

          const ownedPositions = Object.entries(state.properties)
            .filter(([, ps]) => ps.ownerId === player.id)
            .map(([pos]) => Number(pos));

          return (
            <div
              key={player.id}
              style={{
                ...S.card,
                ...(isActive ? S.cardActive : {}),
                ...(player.bankrupt ? S.cardBankrupt : {}),
              }}
            >
              <div
                style={S.cardMain}
                onClick={() => !player.bankrupt && setExpandedId(isExpanded ? null : player.id)}
              >
                {/* Active stripe */}
                {isActive && <div style={S.activeStripe} />}

                {/* Pawn */}
                <div style={{
                  ...S.pawnToken,
                  background: pawn.color,
                  opacity: player.bankrupt ? 0.4 : 1,
                }}>
                  {pawn.emoji}
                </div>

                <div style={S.info}>
                  <div style={{
                    ...S.playerName,
                    textDecoration: player.bankrupt ? 'line-through' : 'none',
                  }}>
                    {player.name}
                    {player.jailTurns > 0 && (
                      <span style={S.jailTag}>Preso</span>
                    )}
                    {player.getOutOfJailCards > 0 && (
                      <span style={S.cardTag}>{player.getOutOfJailCards} carta{player.getOutOfJailCards > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div style={{
                    ...S.money,
                    color: player.bankrupt ? 'var(--red)' : (player.money < 150 ? 'var(--red)' : 'var(--green-dark)'),
                  }}>
                    {player.bankrupt ? 'FALIDO' : `R$${player.money.toLocaleString('pt-BR')}`}
                  </div>
                </div>

                <div style={S.badges}>
                  {isActive && !player.bankrupt && (
                    <div style={S.turnBadge}>VEZ</div>
                  )}
                  {ownedPositions.length > 0 && !player.bankrupt && (
                    <div style={S.propBadge}>{ownedPositions.length} prop.</div>
                  )}
                </div>
              </div>

              {isExpanded && !player.bankrupt && (
                <div style={S.propList}>
                  {ownedPositions.length === 0 ? (
                    <span style={S.noProps}>Sem propriedades</span>
                  ) : ownedPositions.map(pos => {
                    const space = getSpace(pos);
                    const ps = state.properties[pos];
                    const color = space.group ? GROUP_COLORS[space.group] : '#999';
                    const buildingLabel = ps.hotel
                      ? 'Hotel'
                      : ps.houses > 0
                      ? `${ps.houses} casa${ps.houses > 1 ? 's' : ''}`
                      : null;
                    return (
                      <div key={pos} style={S.propItem}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{
                          ...S.propName,
                          textDecoration: ps.mortgaged ? 'line-through' : 'none',
                          opacity: ps.mortgaged ? 0.5 : 1,
                        }}>
                          {space.name}
                        </span>
                        {buildingLabel && (
                          <span style={S.buildingLabel}>{buildingLabel}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    height: '100%',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 14px',
    background: 'linear-gradient(90deg, #065F46, #059669)',
    flexShrink: 0,
  },
  panelHeaderTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    color: '#fff',
    letterSpacing: '1.5px',
    fontWeight: 700,
  },

  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  card: {
    borderRadius: 'var(--radius)',
    background: 'var(--card-alt)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    transition: 'border-color 0.15s',
  },
  cardActive: {
    background: '#f0fdf4',
    border: '1.5px solid var(--green)',
  },
  cardBankrupt: {
    opacity: 0.55,
    background: '#fef2f2',
    border: '1px solid #fecaca',
  },

  cardMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 10px',
    cursor: 'pointer',
    position: 'relative',
    minWidth: 0,
  },

  activeStripe: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    width: 3,
    background: 'var(--green)',
    borderRadius: '0 3px 3px 0',
  },

  pawnToken: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.6)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },

  info: { flex: 1, minWidth: 0 },

  playerName: {
    fontSize: 13,
    fontWeight: 800,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  jailTag: {
    fontSize: 9,
    fontWeight: 700,
    color: '#dc2626',
    background: '#fee2e2',
    padding: '1px 5px',
    borderRadius: 4,
    letterSpacing: '0.3px',
    flexShrink: 0,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: 700,
    color: '#7c3aed',
    background: '#f5f3ff',
    padding: '1px 5px',
    borderRadius: 4,
    letterSpacing: '0.3px',
    flexShrink: 0,
  },
  money: {
    fontSize: 12,
    fontWeight: 700,
  },

  badges: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },
  turnBadge: {
    padding: '2px 7px',
    background: 'var(--green)',
    color: '#fff',
    borderRadius: 99,
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: '1px',
    fontFamily: 'var(--font-title)',
  },
  propBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--green-dark)',
    background: '#dcfce7',
    padding: '1px 6px',
    borderRadius: 99,
    border: '1px solid #bbf7d0',
  },

  propList: {
    padding: '6px 10px 8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    borderTop: '1px solid var(--border)',
  },
  noProps: { fontSize: 11, color: 'var(--text-light)', fontStyle: 'italic' },
  propItem: { display: 'flex', alignItems: 'center', gap: 5 },
  propName: { fontSize: 10, color: 'var(--text-mid)', flex: 1, fontWeight: 600 },
  buildingLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: 'var(--green-dark)',
    background: '#dcfce7',
    padding: '1px 5px',
    borderRadius: 4,
    flexShrink: 0,
  },
};
