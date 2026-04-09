import React, { useState } from 'react';
import type { GameState } from '../types';
import { getPawn } from '../data/pawns';
import { getSpace, GROUP_COLORS, GROUP_POSITIONS } from '../data/properties';
import DiceRoller from './DiceRoller';
import PropertyCard from './PropertyCard';

interface Props {
  state: GameState;
  onRoll: () => void;
  onBuy: () => void;
  onAuction: () => void;
  onEndTurn: () => void;
  onResolveCard: () => void;
  onPayJail: () => void;
  onUseJailCard: () => void;
  onProposeTrade: (targetIndex: number) => void;
  onBuildHouse: (pos: number) => void;
  onSellHouse: (pos: number) => void;
  onMortgage: (pos: number) => void;
  onUnmortgage: (pos: number) => void;
}

export default function ActionPanel(props: Props) {
  const { state } = props;
  const [showManage, setShowManage] = useState(false);
  const [selectedProp, setSelectedProp] = useState<number | null>(null);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const pawn = getPawn(currentPlayer.pawnId);
  const currentSpace = state.spaces[currentPlayer.position];

  const isJail = currentPlayer.jailTurns > 0;
  const canRoll = state.turnPhase === 'pre_roll';
  const canBuy = state.turnPhase === 'buy_decision';
  const awaitingCard = state.turnPhase === 'card_drawn';
  const canEndTurn = state.turnPhase === 'turn_complete';
  const hasRolled = !!state.dice && state.turnPhase !== 'pre_roll';

  // Get current player owned properties
  const ownedPositions = Object.entries(state.properties)
    .filter(([, ps]) => ps.ownerId === currentPlayer.id)
    .map(([pos]) => Number(pos));

  return (
    <div style={styles.panel}>
      {/* Current player header */}
      <div style={styles.playerHeader}>
        <div style={{ ...styles.pawnBig, background: pawn.color }}>
          {pawn.emoji}
        </div>
        <div>
          <div style={styles.playerName}>{currentPlayer.name}</div>
          <div style={styles.playerMeta}>
            <span style={styles.moneyBig}>R${currentPlayer.money.toLocaleString('pt-BR')}</span>
            {isJail && <span style={styles.jailBadge}>🚔 No DETRAN (turno {currentPlayer.jailTurns}/3)</span>}
          </div>
          <div style={styles.positionInfo}>
            📍 {currentSpace.name}
          </div>
        </div>
        <DiceRoller dice={state.dice} />
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        {/* Jail actions */}
        {isJail && canRoll && (
          <div style={styles.jailActions}>
            <div style={styles.jailTitle}>Opções no DETRAN:</div>
            <div style={styles.btnRow}>
              <button
                onClick={props.onPayJail}
                disabled={currentPlayer.money < 50}
                style={{
                  ...styles.btn,
                  ...styles.btnYellow,
                  ...(currentPlayer.money < 50 ? styles.btnDisabled : {}),
                }}
              >
                💸 Pagar Fiança (R$50)
              </button>
              {currentPlayer.getOutOfJailCards > 0 && (
                <button onClick={props.onUseJailCard} style={{ ...styles.btn, ...styles.btnGreen }}>
                  🎫 Usar Cartão ({currentPlayer.getOutOfJailCards})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Roll dice */}
        {canRoll && (
          <button onClick={props.onRoll} style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnLarge }}>
            🎲 Rolar os Dados
          </button>
        )}

        {/* Buy decision */}
        {canBuy && state.pendingPropertyPosition !== null && (
          <div style={styles.buyDecision}>
            <div style={styles.buyTitle}>💡 Você pode comprar:</div>
            <PropertyCard
              position={state.pendingPropertyPosition}
              state={state}
              showActions
              mode="buy_decision"
              onBuy={props.onBuy}
              onDecline={props.onAuction}
            />
          </div>
        )}

        {/* Card resolution */}
        {awaitingCard && state.pendingCard && (
          <div style={styles.cardSection}>
            <div style={styles.cardHeader}>
              {state.pendingCard.deck === 'chance' ? '🎟️ Bilhete da Fortuna' : '📬 Voz do Vale'}
            </div>
            <div style={styles.cardText}>{state.pendingCard.text}</div>
            <button onClick={props.onResolveCard} style={{ ...styles.btn, ...styles.btnPrimary }}>
              ✅ Confirmar
            </button>
          </div>
        )}

        {/* End turn / roll again */}
        {canEndTurn && (
          <button onClick={props.onEndTurn} style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnLarge }}>
            ➡️ Encerrar Turno
          </button>
        )}

        {/* Property management (during turn before rolling or after) */}
        {!canBuy && !awaitingCard && ownedPositions.length > 0 && (
          <div style={styles.manageSection}>
            <button
              onClick={() => setShowManage(!showManage)}
              style={{ ...styles.btn, ...styles.btnGhost }}
            >
              🏘️ Gerenciar Propriedades {showManage ? '▲' : '▼'}
            </button>
            {showManage && (
              <ManageProperties
                state={state}
                ownedPositions={ownedPositions}
                selectedProp={selectedProp}
                onSelectProp={setSelectedProp}
                onBuildHouse={props.onBuildHouse}
                onSellHouse={props.onSellHouse}
                onMortgage={props.onMortgage}
                onUnmortgage={props.onUnmortgage}
              />
            )}
          </div>
        )}

        {/* Trade */}
        {!canBuy && !awaitingCard && state.phase === 'playing' && (
          <button
            onClick={() => {
              const targets = state.players.filter(p => p.id !== currentPlayer.id && !p.bankrupt);
              if (targets.length === 1) {
                props.onProposeTrade(state.players.indexOf(targets[0]));
              } else {
                props.onProposeTrade(-1); // will show target selector
              }
            }}
            style={{ ...styles.btn, ...styles.btnBlue }}
          >
            🤝 Propor Negociação
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Property Management Sub-component ──────────────────────────────────────

function ManageProperties({
  state, ownedPositions, selectedProp, onSelectProp,
  onBuildHouse, onSellHouse, onMortgage, onUnmortgage,
}: {
  state: GameState;
  ownedPositions: number[];
  selectedProp: number | null;
  onSelectProp: (pos: number | null) => void;
  onBuildHouse: (pos: number) => void;
  onSellHouse: (pos: number) => void;
  onMortgage: (pos: number) => void;
  onUnmortgage: (pos: number) => void;
}) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <div style={styles.propManageList}>
      {ownedPositions.map(pos => {
        const space = getSpace(pos);
        const ps = state.properties[pos];
        const color = space.group ? GROUP_COLORS[space.group] : '#6b7280';
        const isSelected = selectedProp === pos;

        // Can build? check monopoly
        const groupPositions = space.group ? (GROUP_POSITIONS[space.group] ?? []) : [];
        const hasMonopoly = groupPositions.length > 0 && groupPositions.every(p =>
          state.properties[p]?.ownerId === currentPlayer.id
        );
        const canBuild = hasMonopoly &&
          space.type === 'property' &&
          !ps.mortgaged &&
          !ps.hotel &&
          currentPlayer.money >= (space.housePrice ?? Infinity);

        const canSell = ps.houses > 0 || ps.hotel;
        const canMortgage = !ps.mortgaged && ps.houses === 0 && !ps.hotel;
        const canUnmortgage = ps.mortgaged &&
          currentPlayer.money >= Math.floor((space.price ?? 0) * 0.55);

        return (
          <div key={pos}>
            <div
              onClick={() => onSelectProp(isSelected ? null : pos)}
              style={{
                ...styles.propManageRow,
                border: `1px solid ${isSelected ? color : '#e5e7eb'}`,
                background: isSelected ? `${color}15` : '#fff',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12 }}>{space.name}</span>
              {ps.hotel && <span>🏨</span>}
              {ps.houses > 0 && <span style={{ fontSize: 11 }}>{'🏠'.repeat(ps.houses)}</span>}
              {ps.mortgaged && <span style={{ fontSize: 10, color: '#9ca3af' }}>HIPOT</span>}
              <span style={{ fontSize: 11, color: '#9ca3af' }}>▼</span>
            </div>
            {isSelected && (
              <div style={styles.propActions}>
                {canBuild && (
                  <button onClick={() => onBuildHouse(pos)} style={{ ...styles.btnSmall, ...styles.btnGreen }}>
                    🏗️ Construir (R${space.housePrice})
                  </button>
                )}
                {canSell && (
                  <button onClick={() => onSellHouse(pos)} style={{ ...styles.btnSmall, ...styles.btnYellow }}>
                    🏚️ Vender Casa (R${Math.floor((space.housePrice ?? 0) / 2)})
                  </button>
                )}
                {canMortgage && (
                  <button onClick={() => onMortgage(pos)} style={{ ...styles.btnSmall, ...styles.btnOrange }}>
                    📝 Hipotecar (R${Math.floor((space.price ?? 0) / 2)})
                  </button>
                )}
                {canUnmortgage && (
                  <button onClick={() => onUnmortgage(pos)} style={{ ...styles.btnSmall, ...styles.btnGreen }}>
                    🔓 Resgatar (R${Math.floor((space.price ?? 0) * 0.55)})
                  </button>
                )}
                {!canBuild && !canSell && !canMortgage && !canUnmortgage && (
                  <span style={{ fontSize: 11, color: '#9ca3af', padding: '4px 8px' }}>
                    Nenhuma ação disponível
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: 'rgba(15, 36, 24, 0.97)',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'rgba(212,175,55,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexWrap: 'wrap',
  },
  pawnBig: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.3)',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 800,
    color: '#f9fafb',
  },
  playerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  moneyBig: {
    fontSize: 18,
    fontWeight: 800,
    color: '#d4af37',
  },
  jailBadge: {
    fontSize: 11,
    color: '#fca5a5',
    background: 'rgba(239,68,68,0.15)',
    padding: '2px 8px',
    borderRadius: 20,
    border: '1px solid rgba(239,68,68,0.3)',
  },
  positionInfo: {
    fontSize: 12,
    color: '#86efac',
    marginTop: 2,
  },
  actions: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 340,
    overflowY: 'auto',
  },
  jailActions: {
    padding: '8px 10px',
    background: 'rgba(239,68,68,0.1)',
    borderRadius: 8,
    border: '1px solid rgba(239,68,68,0.2)',
  },
  jailTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fca5a5',
    marginBottom: 6,
  },
  btnRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  btn: {
    padding: '10px 14px',
    border: 'none',
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'filter 0.1s, transform 0.1s',
    textAlign: 'center' as const,
  },
  btnLarge: {
    padding: '13px 14px',
    fontSize: 15,
  },
  btnPrimary: {
    background: '#16a34a',
    color: '#fff',
  },
  btnSecondary: {
    background: '#2563eb',
    color: '#fff',
  },
  btnBlue: {
    background: 'rgba(37,99,235,0.2)',
    color: '#93c5fd',
    border: '1px solid rgba(37,99,235,0.3)',
  },
  btnGreen: {
    background: '#16a34a',
    color: '#fff',
  },
  btnYellow: {
    background: '#d97706',
    color: '#fff',
  },
  btnOrange: {
    background: '#ea580c',
    color: '#fff',
  },
  btnGhost: {
    background: 'rgba(255,255,255,0.06)',
    color: '#d1d5db',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  btnDisabled: {
    background: '#4b5563',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  buyDecision: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  buyTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#d4af37',
  },
  cardSection: {
    padding: '12px',
    background: 'rgba(168,85,247,0.1)',
    borderRadius: 10,
    border: '1px solid rgba(168,85,247,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: 700,
    color: '#c4b5fd',
  },
  cardText: {
    fontSize: 13,
    color: '#e9d5ff',
    lineHeight: 1.5,
  },
  manageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  propManageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    maxHeight: 200,
    overflowY: 'auto',
  },
  propManageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    background: '#fff',
    transition: 'background 0.1s',
  },
  propActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '0 0 6px 6px',
    marginTop: -4,
  },
  btnSmall: {
    padding: '5px 8px',
    border: 'none',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
