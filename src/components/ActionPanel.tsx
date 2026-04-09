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

  const player = state.players[state.currentPlayerIndex];
  const pawn = getPawn(player.pawnId);
  const currentSpace = state.spaces[player.position];

  const isJail = player.jailTurns > 0;
  const canRoll = state.turnPhase === 'pre_roll';
  const canBuy = state.turnPhase === 'buy_decision';
  const awaitingCard = state.turnPhase === 'card_drawn';
  const canEnd = state.turnPhase === 'turn_complete';

  const ownedPositions = Object.entries(state.properties)
    .filter(([, ps]) => ps.ownerId === player.id)
    .map(([pos]) => Number(pos));

  const otherPlayersWithProps = state.players.filter(p =>
    p.id !== player.id &&
    !p.bankrupt &&
    Object.values(state.properties).some(ps => ps.ownerId === p.id)
  );
  const canTrade = otherPlayersWithProps.length > 0;

  return (
    <div style={S.panel}>
      {/* ── Player strip ── */}
      <div style={{ ...S.strip, borderLeftColor: pawn.color }}>
        <div style={{ ...S.pawnCircle, background: pawn.color }}>
          {pawn.emoji}
        </div>
        <div style={S.playerInfo}>
          <span style={S.playerName}>{player.name}</span>
          <span style={{ ...S.money, color: player.money < 200 ? 'var(--red)' : 'var(--green-dark)' }}>
            R${player.money.toLocaleString('pt-BR')}
          </span>
          <span style={S.position}>{currentSpace.name}</span>
        </div>

        <div style={S.diceArea}>
          <DiceRoller dice={state.dice} />
          {isJail && (
            <div style={S.jailIndicator}>Preso · Turno {player.jailTurns}/3</div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={S.actions}>

        {/* Jail options */}
        {isJail && canRoll && (
          <div style={S.jailBox}>
            <div style={S.jailTitle}>Opções no DETRAN</div>
            <div style={S.btnGroup}>
              <Btn
                label={`Pagar fiança R$50`}
                color="yellow"
                disabled={player.money < 50}
                onClick={props.onPayJail}
              />
              {player.getOutOfJailCards > 0 && (
                <Btn
                  label={`Usar cartão (${player.getOutOfJailCards})`}
                  color="green"
                  onClick={props.onUseJailCard}
                />
              )}
            </div>
          </div>
        )}

        {/* Roll */}
        {canRoll && (
          <Btn label="Rolar os dados" color="green" size="lg" onClick={props.onRoll} />
        )}

        {/* Buy decision */}
        {canBuy && state.pendingPropertyPosition !== null && (
          <div style={S.buyBox}>
            <div style={S.buyTitle}>Comprar esta propriedade?</div>
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

        {/* Card drawn */}
        {awaitingCard && state.pendingCard && (
          <div style={S.cardBox}>
            <div style={S.cardHeader}>
              {state.pendingCard.deck === 'chance' ? 'Bilhete da Fortuna' : 'Voz do Vale'}
            </div>
            <p style={S.cardText}>{state.pendingCard.text}</p>
            <Btn label="Confirmar" color="green" onClick={props.onResolveCard} />
          </div>
        )}

        {/* End turn */}
        {canEnd && (
          <Btn label="Encerrar turno" color="blue" size="lg" onClick={props.onEndTurn} />
        )}

        {/* Manage + Trade */}
        {!canBuy && !awaitingCard && state.phase === 'playing' && (
          <div style={S.btnGroup}>
            {ownedPositions.length > 0 && (
              <Btn
                label={`Gerenciar${showManage ? ' ▲' : ' ▼'}`}
                color="gold"
                onClick={() => setShowManage(!showManage)}
              />
            )}
            {canTrade && (
              <Btn
                label="Negociar"
                color="purple"
                onClick={() => props.onProposeTrade(-1)}
              />
            )}
          </div>
        )}

        {/* Manage panel */}
        {showManage && ownedPositions.length > 0 && (
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
    </div>
  );
}

// ─── Btn ─────────────────────────────────────────────────────────────────────

function Btn({ label, color, size = 'md', disabled, onClick }: {
  label: string;
  color: 'green' | 'blue' | 'gold' | 'red' | 'yellow' | 'purple';
  size?: 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    green:  { bg: 'var(--green)',  text: '#fff', border: 'var(--green-dark)' },
    blue:   { bg: '#3b82f6',       text: '#fff', border: '#2563eb' },
    gold:   { bg: '#f59e0b',       text: '#fff', border: '#d97706' },
    red:    { bg: 'var(--red)',    text: '#fff', border: 'var(--red-dark)' },
    yellow: { bg: '#fbbf24',       text: '#1f2937', border: '#d97706' },
    purple: { bg: '#8b5cf6',       text: '#fff', border: '#7c3aed' },
  };
  const c = disabled
    ? { bg: 'var(--card-alt)', text: 'var(--text-light)', border: 'var(--border)' }
    : colors[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: size === 'lg' ? '13px 18px' : '9px 14px',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-body)',
        fontSize: size === 'lg' ? 15 : 13,
        fontWeight: 600,
        letterSpacing: '0.2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s, filter 0.15s',
        width: size === 'lg' ? '100%' : undefined,
        boxShadow: 'none',
      }}
    >
      {label}
    </button>
  );
}

// ─── ManageProperties ────────────────────────────────────────────────────────

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
  const player = state.players[state.currentPlayerIndex];

  return (
    <div style={M.wrap}>
      {ownedPositions.map(pos => {
        const space = getSpace(pos);
        const ps = state.properties[pos];
        const color = space.group ? GROUP_COLORS[space.group] : '#999';
        const isSelected = selectedProp === pos;

        const groupPos = space.group ? (GROUP_POSITIONS[space.group] ?? []) : [];
        const hasMonopoly = groupPos.length > 0 &&
          groupPos.every(p => state.properties[p]?.ownerId === player.id);
        const canBuild = hasMonopoly && space.type === 'property' &&
          !ps.mortgaged && !ps.hotel && player.money >= (space.housePrice ?? Infinity);
        const canSell = ps.houses > 0 || ps.hotel;
        const canMortgage = !ps.mortgaged && ps.houses === 0 && !ps.hotel;
        const canUnmort = ps.mortgaged && player.money >= Math.floor((space.price ?? 0) * 0.55);

        return (
          <div key={pos}>
            <div
              onClick={() => onSelectProp(isSelected ? null : pos)}
              style={{
                ...M.row,
                borderLeft: `3px solid ${color}`,
                background: isSelected ? `${color}12` : 'transparent',
              }}
            >
              <span style={M.rowName}>{space.name}</span>
              {ps.hotel && <span style={M.buildTag}>Hotel</span>}
              {ps.houses > 0 && <span style={M.buildTag}>{ps.houses} casa{ps.houses > 1 ? 's' : ''}</span>}
              {ps.mortgaged && <span style={M.hipTag}>Hipotecada</span>}
              <span style={{ color: 'var(--text-light)', fontSize: 11 }}>{isSelected ? '▲' : '▼'}</span>
            </div>

            {isSelected && (
              <div style={M.actions}>
                {canBuild && (
                  <MiniBtn
                    label={`Construir R$${space.housePrice}`}
                    bg="var(--green)"
                    onClick={() => onBuildHouse(pos)}
                  />
                )}
                {canSell && (
                  <MiniBtn
                    label={`Vender R$${Math.floor((space.housePrice ?? 0) / 2)}`}
                    bg="#d97706"
                    onClick={() => onSellHouse(pos)}
                  />
                )}
                {canMortgage && (
                  <MiniBtn
                    label={`Hipotecar R$${Math.floor((space.price ?? 0) / 2)}`}
                    bg="#ea580c"
                    onClick={() => onMortgage(pos)}
                  />
                )}
                {canUnmort && (
                  <MiniBtn
                    label={`Resgatar R$${Math.floor((space.price ?? 0) * 0.55)}`}
                    bg="var(--green-dark)"
                    onClick={() => onUnmortgage(pos)}
                  />
                )}
                {!canBuild && !canSell && !canMortgage && !canUnmort && (
                  <span style={{ fontSize: 11, color: 'var(--text-light)', padding: '4px 8px', fontStyle: 'italic' }}>
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

function MiniBtn({ label, bg, onClick }: { label: string; bg: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px',
        background: bg,
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      {label}
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  panel: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
  },
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    borderLeft: '4px solid transparent',
    flexWrap: 'wrap',
    background: 'var(--card-alt)',
  },
  pawnCircle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.6)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  },
  playerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 120,
  },
  playerName: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text)',
  },
  money: {
    fontFamily: 'var(--font-title)',
    fontSize: 18,
    fontWeight: 800,
  },
  position: {
    fontSize: 11,
    color: 'var(--text-mid)',
    fontWeight: 500,
  },
  diceArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  jailIndicator: {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--red)',
    background: '#fef2f2',
    padding: '2px 8px',
    borderRadius: 99,
    border: '1px solid #fecaca',
  },

  actions: {
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 340,
    overflowY: 'auto',
  },

  jailBox: {
    background: '#fef2f2',
    borderRadius: 'var(--radius)',
    border: '1px solid #fecaca',
    padding: '10px 12px',
  },
  jailTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--red)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  btnGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  buyBox: { display: 'flex', flexDirection: 'column', gap: 8 },
  buyTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-mid)',
  },

  cardBox: {
    background: '#faf5ff',
    borderRadius: 'var(--radius)',
    border: '1px solid #e9d5ff',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: 700,
    color: '#7e22ce',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardText: {
    fontSize: 13,
    color: '#4c1d95',
    lineHeight: 1.5,
    fontWeight: 500,
    margin: 0,
  },
};

const M: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    maxHeight: 220,
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.1s',
  },
  rowName: {
    flex: 1,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text)',
  },
  buildTag: {
    fontSize: 9,
    fontWeight: 700,
    color: 'var(--green-dark)',
    background: '#dcfce7',
    padding: '1px 6px',
    borderRadius: 99,
    border: '1px solid #bbf7d0',
  },
  hipTag: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--text-light)',
    background: 'var(--border)',
    padding: '1px 6px',
    borderRadius: 99,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    padding: '8px 12px',
    background: 'var(--card)',
    borderBottom: '1px solid var(--border)',
  },
};
