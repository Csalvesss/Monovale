import React from 'react';
import type { GameState } from '../types';
import { getSpace, GROUP_COLORS, GROUP_NAMES } from '../data/properties';
import { getPawn } from '../data/pawns';

interface Props {
  position: number;
  state: GameState;
  onBuy?: () => void;
  onDecline?: () => void;
  onMortgage?: (pos: number) => void;
  onUnmortgage?: (pos: number) => void;
  onBuildHouse?: (pos: number) => void;
  onSellHouse?: (pos: number) => void;
  showActions?: boolean;
  mode?: 'buy_decision' | 'info';
}

export default function PropertyCard({
  position,
  state,
  onBuy,
  onDecline,
  onMortgage,
  onUnmortgage,
  onBuildHouse,
  onSellHouse,
  showActions,
  mode = 'info',
}: Props) {
  const space = getSpace(position);
  const propState = state.properties[position];
  const currentPlayer = state.players[state.currentPlayerIndex];

  if (!space) return null;

  const color = space.group ? GROUP_COLORS[space.group] : '#6b7280';
  const groupName = space.group ? GROUP_NAMES[space.group] : '';
  const owner = propState?.ownerId ? state.players.find(p => p.id === propState.ownerId) : null;
  const ownerPawn = owner ? getPawn(owner.pawnId) : null;
  const mortgageValue = Math.floor((space.price ?? 0) / 2);
  const unmortgageCost = Math.floor((space.price ?? 0) * 0.55);

  const canAfford = currentPlayer.money >= (space.price ?? 0);
  const isOwned = !!propState?.ownerId;
  const isMine = propState?.ownerId === currentPlayer.id;

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={{ ...styles.header, background: color }}>
        {space.group && <div style={styles.groupName}>{groupName}</div>}
        <div style={styles.spaceName}>{space.name}</div>
        {space.price !== undefined && (
          <div style={styles.price}>R${space.price}</div>
        )}
      </div>

      <div style={styles.body}>
        {/* Rent table for properties */}
        {space.type === 'property' && space.rent && (
          <div style={styles.rentTable}>
            <div style={styles.rentTitle}>Tabela de Aluguel</div>
            {[
              ['Sem casa', space.rent[0]],
              ['1 Casa', space.rent[1]],
              ['2 Casas', space.rent[2]],
              ['3 Casas', space.rent[3]],
              ['4 Casas', space.rent[4]],
              ['Hotel', space.rent[5]],
            ].map(([label, value], i) => {
              const isCurrent = propState
                ? (!propState.hotel && propState.houses === i && i <= 4) ||
                  (propState.hotel && i === 5)
                : false;
              return (
                <div key={i} style={{
                  ...styles.rentRow,
                  ...(isCurrent ? styles.rentRowActive : {}),
                }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 700 }}>R${value}</span>
                </div>
              );
            })}
            {space.housePrice && (
              <div style={styles.housePriceRow}>
                Casa/Hotel: R${space.housePrice}
              </div>
            )}
          </div>
        )}

        {/* Railroad */}
        {space.type === 'railroad' && (
          <div style={styles.rentTable}>
            <div style={styles.rentTitle}>Aluguel por Estações Possuídas</div>
            {[[1, 25], [2, 50], [3, 100], [4, 200]].map(([count, rent]) => (
              <div key={count} style={styles.rentRow}>
                <span>{count} Estação{count > 1 ? 'ões' : ''}</span>
                <span style={{ fontWeight: 700 }}>R${rent}</span>
              </div>
            ))}
          </div>
        )}

        {/* Utility */}
        {space.type === 'utility' && (
          <div style={styles.rentTable}>
            <div style={styles.rentTitle}>Aluguel por Empresas Possuídas</div>
            <div style={styles.rentRow}>
              <span>1 Empresa</span>
              <span style={{ fontWeight: 700 }}>4× dados</span>
            </div>
            <div style={styles.rentRow}>
              <span>2 Empresas</span>
              <span style={{ fontWeight: 700 }}>10× dados</span>
            </div>
          </div>
        )}

        {/* Owner info */}
        {owner && ownerPawn && (
          <div style={styles.ownerRow}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: ownerPawn.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12,
            }}>{ownerPawn.emoji}</div>
            <span style={{ fontSize: 12, color: '#4b5563' }}>
              Dono: <strong>{owner.name}</strong>
              {propState?.mortgaged && ' (Hipotecada)'}
            </span>
          </div>
        )}

        {/* Mortgage value */}
        {space.price && (
          <div style={styles.mortgageInfo}>
            <span>Hipoteca: R${mortgageValue}</span>
            <span>Resgatar: R${unmortgageCost}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && mode === 'buy_decision' && (
        <div style={styles.actions}>
          <button
            onClick={onBuy}
            disabled={!canAfford}
            style={{
              ...styles.btnPrimary,
              ...(!canAfford ? styles.btnDisabled : {}),
            }}
          >
            🏠 Comprar — R${space.price}
          </button>
          <button onClick={onDecline} style={styles.btnSecondary}>
            🏦 Leiloar
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: 200,
    maxWidth: 240,
  },
  header: {
    padding: '12px 14px',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  groupName: {
    fontSize: 10,
    fontWeight: 700,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 2,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  price: {
    fontSize: 13,
    fontWeight: 600,
    marginTop: 4,
    opacity: 0.95,
  },
  body: {
    padding: '10px 14px',
  },
  rentTable: {
    marginBottom: 10,
  },
  rentTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  rentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#374151',
    padding: '2px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  rentRowActive: {
    color: '#166534',
    fontWeight: 700,
    background: '#f0fdf4',
    borderRadius: 3,
    padding: '2px 4px',
  },
  housePriceRow: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  ownerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 0',
    borderTop: '1px solid #f3f4f6',
    marginBottom: 6,
  },
  mortgageInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#9ca3af',
  },
  actions: {
    padding: '10px 14px',
    display: 'flex',
    gap: 8,
    borderTop: '1px solid #f3f4f6',
  },
  btnPrimary: {
    flex: 1,
    padding: '8px',
    background: '#166534',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnSecondary: {
    flex: 1,
    padding: '8px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },
};
