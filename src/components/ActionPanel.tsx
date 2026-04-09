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

  return (
    <div style={S.panel}>
      {/* ── Player strip ── */}
      <div style={{ ...S.strip, background: `linear-gradient(135deg, ${pawn.color}22, ${pawn.color}44)`, borderColor: pawn.color + '55' }}>
        <div style={{ ...S.pawnCircle, background: pawn.color }}>
          {pawn.emoji}
        </div>
        <div style={S.playerInfo}>
          <span style={S.playerName}>{player.name}</span>
          <span style={{ ...S.money, color: player.money < 200 ? 'var(--red)' : 'var(--green-dark)' }}>
            R${player.money.toLocaleString('pt-BR')}
          </span>
          <span style={S.position}>📍 {currentSpace.name}</span>
        </div>

        {/* Dice & status */}
        <div style={S.diceArea}>
          <DiceRoller dice={state.dice} />
          {isJail && (
            <div style={S.jailIndicator}>🚔 Turno {player.jailTurns}/3</div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={S.actions}>

        {/* Jail options */}
        {isJail && canRoll && (
          <div style={S.jailBox}>
            <div style={S.jailTitle}>⚠️ Opções no DETRAN</div>
            <div style={S.btnGroup}>
              <Btn
                label={`💸 Pagar fiança R$50`}
                color="yellow"
                disabled={player.money < 50}
                onClick={props.onPayJail}
              />
              {player.getOutOfJailCards > 0 && (
                <Btn
                  label={`🎫 Usar cartão (${player.getOutOfJailCards})`}
                  color="green"
                  onClick={props.onUseJailCard}
                />
              )}
            </div>
          </div>
        )}

        {/* Roll */}
        {canRoll && (
          <Btn label="🎲 ROLAR OS DADOS" color="green" size="lg" onClick={props.onRoll} />
        )}

        {/* Buy decision */}
        {canBuy && state.pendingPropertyPosition !== null && (
          <div style={S.buyBox}>
            <div style={S.buyTitle}>🏠 Comprar esta propriedade?</div>
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
              {state.pendingCard.deck === 'chance' ? '🎟️ Bilhete da Fortuna' : '📬 Voz do Vale'}
            </div>
            <p style={S.cardText}>{state.pendingCard.text}</p>
            <Btn label="✅ Confirmar" color="green" onClick={props.onResolveCard} />
          </div>
        )}

        {/* End turn */}
        {canEnd && (
          <Btn label="➡️ ENCERRAR TURNO" color="blue" size="lg" onClick={props.onEndTurn} />
        )}

        {/* Manage + Trade (horizontal row) */}
        {!canBuy && !awaitingCard && state.phase === 'playing' && (
          <div style={S.btnGroup}>
            {ownedPositions.length > 0 && (
              <Btn
                label={`🏘️ Gerenciar${showManage ? ' ▲' : ' ▼'}`}
                color="gold"
                onClick={() => setShowManage(!showManage)}
              />
            )}
            <Btn
              label="🤝 Negociar"
              color="purple"
              onClick={() => props.onProposeTrade(-1)}
            />
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

// ─── Btn helper ──────────────────────────────────────────────────────────────

function Btn({ label, color, size = 'md', disabled, onClick }: {
  label: string;
  color: 'green' | 'blue' | 'gold' | 'red' | 'yellow' | 'purple';
  size?: 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}) {
  const colors: Record<string, { bg: string; shadow: string; text: string }> = {
    green:  { bg: 'var(--green-grad)',  shadow: 'var(--green-dark)', text: '#fff' },
    blue:   { bg: 'linear-gradient(135deg,#60a5fa,#3b82f6)', shadow: '#1d4ed8', text: '#fff' },
    gold:   { bg: 'var(--gold-grad)',   shadow: 'var(--gold-dark)',  text: 'var(--text)' },
    red:    { bg: 'var(--red-grad)',    shadow: 'var(--red-dark)',   text: '#fff' },
    yellow: { bg: 'var(--yellow-grad)', shadow: 'var(--yellow-dark)', text: 'var(--text)' },
    purple: { bg: 'linear-gradient(135deg,#c084fc,#a855f7)', shadow: '#7e22ce', text: '#fff' },
  };
  const c = disabled
    ? { bg: 'linear-gradient(135deg,#d1d5db,#9ca3af)', shadow: '#6b7280', text: '#fff' }
    : colors[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: size === 'lg' ? '14px 18px' : '10px 14px',
        background: c.bg,
        color: c.text,
        border: 'none',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-title)',
        fontSize: size === 'lg' ? 20 : 15,
        letterSpacing: '0.5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: `0 4px 0 ${c.shadow}`,
        transition: 'transform 0.1s, box-shadow 0.1s',
        width: size === 'lg' ? '100%' : undefined,
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
                borderLeft: `4px solid ${color}`,
                background: isSelected ? `${color}18` : 'var(--card-alt)',
              }}
            >
              <span style={M.rowName}>{space.name}</span>
              {ps.hotel && <span>🏨</span>}
              {ps.houses > 0 && <span style={{ fontSize: 10 }}>{'🏠'.repeat(ps.houses)}</span>}
              {ps.mortgaged && <span style={M.hipTag}>HIPOT.</span>}
              <span style={{ color: 'var(--text-light)', fontSize: 12 }}>{isSelected ? '▲' : '▼'}</span>
            </div>

            {isSelected && (
              <div style={M.actions}>
                {canBuild && (
                  <MiniBtn
                    label={`🏗️ Construir R$${space.housePrice}`}
                    bg="var(--green)"
                    onClick={() => onBuildHouse(pos)}
                  />
                )}
                {canSell && (
                  <MiniBtn
                    label={`🏚️ Vender R$${Math.floor((space.housePrice ?? 0) / 2)}`}
                    bg="var(--yellow-dark)"
                    onClick={() => onSellHouse(pos)}
                  />
                )}
                {canMortgage && (
                  <MiniBtn
                    label={`📝 Hipotecar R$${Math.floor((space.price ?? 0) / 2)}`}
                    bg="#ea580c"
                    onClick={() => onMortgage(pos)}
                  />
                )}
                {canUnmort && (
                  <MiniBtn
                    label={`🔓 Resgatar R$${Math.floor((space.price ?? 0) * 0.55)}`}
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
        padding: '6px 10px',
        background: bg,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
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
    border: '2px solid var(--border-gold)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
  },
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '2px solid',
    flexWrap: 'wrap',
  },
  pawnCircle: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.5)',
    boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
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
    fontSize: 18,
    color: 'var(--text)',
    letterSpacing: '0.3px',
  },
  money: {
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    fontWeight: 900,
  },
  position: {
    fontSize: 11,
    color: 'var(--text-mid)',
    fontWeight: 600,
  },
  diceArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  jailIndicator: {
    fontSize: 11,
    fontWeight: 700,
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
    border: '2px solid #fecaca',
    padding: '10px 12px',
  },
  jailTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: 'var(--red)',
    marginBottom: 8,
  },

  btnGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  buyBox: { display: 'flex', flexDirection: 'column', gap: 8 },
  buyTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    color: 'var(--text)',
    letterSpacing: '0.5px',
  },

  cardBox: {
    background: '#faf5ff',
    borderRadius: 'var(--radius)',
    border: '2px solid #e9d5ff',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardHeader: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    color: '#7e22ce',
    letterSpacing: '0.5px',
  },
  cardText: {
    fontSize: 13,
    color: '#4c1d95',
    lineHeight: 1.5,
    fontWeight: 600,
    margin: 0,
  },
};

const M: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--card-alt)',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    overflow: 'hidden',
    maxHeight: 220,
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 10px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
    background: 'var(--card-alt)',
    transition: 'background 0.1s',
  },
  rowName: {
    flex: 1,
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text)',
  },
  hipTag: {
    fontSize: 8,
    fontWeight: 900,
    color: 'var(--text-light)',
    background: 'var(--border)',
    padding: '1px 4px',
    borderRadius: 4,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    padding: '8px 10px',
    background: '#f5f0e0',
    borderBottom: '1px solid var(--border)',
  },
};
