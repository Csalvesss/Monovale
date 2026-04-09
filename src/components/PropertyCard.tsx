import React from 'react';
import type { GameState } from '../types';
import { getSpace, GROUP_COLORS, GROUP_NAMES } from '../data/properties';
import { getPawn } from '../data/pawns';

interface Props {
  position: number;
  state: GameState;
  onBuy?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
  mode?: 'buy_decision' | 'info';
}

export default function PropertyCard({ position, state, onBuy, onDecline, showActions, mode = 'info' }: Props) {
  const space = getSpace(position);
  const propState = state.properties[position];
  const player = state.players[state.currentPlayerIndex];

  if (!space) return null;

  const color = space.group ? GROUP_COLORS[space.group] : '#6b7280';
  const groupName = space.group ? GROUP_NAMES[space.group] : '';
  const owner = propState?.ownerId ? state.players.find(p => p.id === propState.ownerId) : null;
  const ownerPawn = owner ? getPawn(owner.pawnId) : null;
  const mortgageValue = Math.floor((space.price ?? 0) / 2);
  const unmortgageCost = Math.floor((space.price ?? 0) * 0.55);
  const canAfford = player.money >= (space.price ?? 0);

  return (
    <div style={S.card}>
      {/* Header */}
      <div style={{ ...S.header, background: color }}>
        {groupName && <div style={S.groupLabel}>{groupName.toUpperCase()}</div>}
        <div style={S.spaceName}>{space.name}</div>
        {space.price !== undefined && <div style={S.priceLabel}>R${space.price}</div>}
      </div>

      <div style={S.body}>
        {/* Rent table */}
        {space.type === 'property' && space.rent && (
          <div style={S.rentTable}>
            <div style={S.tableTitle}>TABELA DE ALUGUEL</div>
            {['Sem casa', '1 Casa', '2 Casas', '3 Casas', '4 Casas', 'Hotel'].map((label, i) => {
              const isCurrent = propState
                ? (!propState.hotel && propState.houses === i && i <= 4) ||
                  (propState.hotel && i === 5)
                : false;
              return (
                <div key={i} style={{ ...S.rentRow, ...(isCurrent ? S.rentRowActive : {}) }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 800 }}>R${space.rent![i]}</span>
                </div>
              );
            })}
            {space.housePrice && (
              <div style={S.houseNote}>Casa/Hotel: R${space.housePrice}</div>
            )}
          </div>
        )}

        {space.type === 'railroad' && (
          <div style={S.rentTable}>
            <div style={S.tableTitle}>ALUGUEL POR ESTAÇÕES</div>
            {[[1,25],[2,50],[3,100],[4,200]].map(([n, r]) => (
              <div key={n} style={S.rentRow}>
                <span>{n} {n > 1 ? 'Estações' : 'Estação'}</span>
                <span style={{ fontWeight: 800 }}>R${r}</span>
              </div>
            ))}
          </div>
        )}

        {space.type === 'utility' && (
          <div style={S.rentTable}>
            <div style={S.tableTitle}>ALUGUEL POR EMPRESAS</div>
            <div style={S.rentRow}><span>1 Empresa</span><span style={{ fontWeight: 800 }}>4× dados</span></div>
            <div style={S.rentRow}><span>2 Empresas</span><span style={{ fontWeight: 800 }}>10× dados</span></div>
          </div>
        )}

        {/* Owner */}
        {owner && ownerPawn && (
          <div style={S.ownerRow}>
            <div style={{ ...S.ownerToken, background: ownerPawn.color }}>{ownerPawn.emoji}</div>
            <span style={S.ownerName}>Dono: <strong>{owner.name}</strong></span>
            {propState?.mortgaged && <span style={S.mortgagedTag}>HIPOTECADA</span>}
          </div>
        )}

        {space.price && (
          <div style={S.mortInfo}>
            <span>Hipoteca: R${mortgageValue}</span>
            <span>Resgatar: R${unmortgageCost}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && mode === 'buy_decision' && (
        <div style={S.actions}>
          <button
            onClick={onBuy}
            disabled={!canAfford}
            style={{
              ...S.btnBuy,
              ...(!canAfford ? S.btnDisabled : {}),
            }}
          >
            Comprar R${space.price}
          </button>
          <button onClick={onDecline} style={S.btnAuction}>
            Leiloar
          </button>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--white)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '2px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
    maxWidth: 240,
    width: '100%',
  },
  header: {
    padding: '12px 14px',
    color: '#fff',
    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  groupLabel: {
    fontFamily: 'var(--font-title)',
    fontSize: 10,
    opacity: 0.9,
    letterSpacing: '2px',
    marginBottom: 2,
  },
  spaceName: {
    fontFamily: 'var(--font-title)',
    fontSize: 18,
    lineHeight: 1.2,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: 700,
    opacity: 0.95,
    marginTop: 4,
  },
  body: { padding: '10px 14px' },
  rentTable: { marginBottom: 10 },
  tableTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 10,
    color: 'var(--text-mid)',
    letterSpacing: '1px',
    marginBottom: 5,
  },
  rentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: 'var(--text)',
    padding: '3px 0',
    borderBottom: '1px solid var(--border)',
  },
  rentRowActive: {
    color: 'var(--green-dark)',
    fontWeight: 800,
    background: '#f0fdf4',
    borderRadius: 4,
    padding: '3px 6px',
  },
  houseNote: { fontSize: 10, color: 'var(--text-light)', marginTop: 4, fontStyle: 'italic' },
  ownerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 0',
    borderTop: '1px solid var(--border)',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  ownerToken: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    border: '2px solid rgba(255,255,255,0.5)',
  },
  ownerName: { fontSize: 12, color: 'var(--text)' },
  mortgagedTag: {
    fontSize: 9,
    fontWeight: 900,
    color: '#fff',
    background: '#9ca3af',
    padding: '1px 5px',
    borderRadius: 4,
    letterSpacing: '0.5px',
  },
  mortInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: 'var(--text-light)',
  },
  actions: {
    padding: '10px 14px',
    display: 'flex',
    gap: 8,
    borderTop: '2px solid var(--border)',
  },
  btnBuy: {
    flex: 1,
    padding: '9px',
    background: 'var(--green)',
    color: '#fff',
    border: '1px solid var(--green-dark)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: 'none',
  },
  btnAuction: {
    flex: 1,
    padding: '9px',
    background: '#f3f4f6',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: 'none',
  },
  btnDisabled: {
    background: '#e5e7eb',
    border: '1px solid #d1d5db',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
};
