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
        <span style={S.panelHeaderIcon}>👥</span>
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
                    {player.jailTurns > 0 && ' 🚔'}
                    {player.getOutOfJailCards > 0 && ' 🎫'}
                  </div>
                  <div style={{
                    ...S.money,
                    color: player.bankrupt ? 'var(--red)' : (player.money < 150 ? 'var(--red)' : 'var(--green-dark)'),
                  }}>
                    {player.bankrupt ? '💀 FALIDO' : `R$${player.money.toLocaleString('pt-BR')}`}
                  </div>
                </div>

                <div style={S.badges}>
                  {isActive && !player.bankrupt && (
                    <div style={S.turnBadge}>VEZ</div>
                  )}
                  {ownedPositions.length > 0 && !player.bankrupt && (
                    <div style={S.propBadge}>🏠 {ownedPositions.length}</div>
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
                        {ps.hotel && <span>🏨</span>}
                        {ps.houses > 0 && <span style={{ fontSize: 9 }}>{'🏠'.repeat(ps.houses)}</span>}
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
    border: '2px solid var(--border-gold)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    height: '100%',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'var(--gold-grad)',
    flexShrink: 0,
  },
  panelHeaderIcon: { fontSize: 18 },
  panelHeaderTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 17,
    color: 'var(--text)',
    letterSpacing: '1px',
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
    border: '2px solid var(--border)',
    overflow: 'hidden',
    transition: 'transform 0.1s, box-shadow 0.1s',
    boxShadow: '0 3px 0 var(--border)',
  },
  cardActive: {
    background: '#fef9e7',
    border: '2px solid var(--gold)',
    boxShadow: '0 3px 0 var(--gold-dark)',
    transform: 'translateY(-1px)',
  },
  cardBankrupt: {
    opacity: 0.55,
    background: '#fef2f2',
    border: '2px solid #fecaca',
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
    width: 4,
    background: 'var(--gold)',
    borderRadius: '0 4px 4px 0',
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },

  info: { flex: 1, minWidth: 0 },

  playerName: {
    fontSize: 13,
    fontWeight: 800,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    background: 'var(--gold-grad)',
    color: 'var(--text)',
    borderRadius: 99,
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: '1px',
    boxShadow: '0 2px 0 var(--gold-dark)',
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
    padding: '0 10px 8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    borderTop: '2px solid var(--border)',
    paddingTop: 6,
  },
  noProps: { fontSize: 11, color: 'var(--text-light)', fontStyle: 'italic' },
  propItem: { display: 'flex', alignItems: 'center', gap: 5 },
  propName: { fontSize: 10, color: 'var(--text-mid)', flex: 1, fontWeight: 600 },
};
