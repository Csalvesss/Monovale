import React, { useState } from 'react';
import type { GameState, TradeState } from '../types';
import { getSpace, GROUP_COLORS } from '../data/properties';
import { getPawn } from '../data/pawns';

interface Props {
  state: GameState;
  onUpdate: (trade: TradeState) => void;
  onAccept: () => void;
  onCancel: () => void;
}

export default function TradeModal({ state, onUpdate, onAccept, onCancel }: Props) {
  const trade = state.trade;
  if (!trade) return null;

  const proposer = state.players[trade.proposingPlayerIndex];
  const target = trade.targetPlayerIndex !== null ? state.players[trade.targetPlayerIndex] : null;

  // Target selection screen
  if (trade.status === 'selecting_target' || trade.targetPlayerIndex === null) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <div style={styles.headerTitle}>🤝 Negociação</div>
            <div style={styles.headerSub}>Com quem quer negociar?</div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.players
              .filter(p => p.id !== proposer.id && !p.bankrupt)
              .map(p => {
                const pawn = getPawn(p.pawnId);
                return (
                  <button
                    key={p.id}
                    onClick={() => onUpdate({
                      ...trade,
                      targetPlayerIndex: state.players.indexOf(p),
                      status: 'configuring',
                    })}
                    style={styles.targetBtn}
                  >
                    <span style={{ fontSize: 20 }}>{pawn.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>R${p.money}</div>
                    </div>
                  </button>
                );
              })}
            <button onClick={onCancel} style={styles.btnCancel}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  if (!target) return null;

  const proposerPawn = getPawn(proposer.pawnId);
  const targetPawn = getPawn(target.pawnId);

  const proposerProps = Object.entries(state.properties)
    .filter(([, ps]) => ps.ownerId === proposer.id)
    .map(([pos]) => Number(pos));

  const targetProps = Object.entries(state.properties)
    .filter(([, ps]) => ps.ownerId === target.id)
    .map(([pos]) => Number(pos));

  function toggleOfferProp(pos: number) {
    const current = trade!.offerPositions;
    onUpdate({
      ...trade!,
      offerPositions: current.includes(pos)
        ? current.filter(p => p !== pos)
        : [...current, pos],
    });
  }

  function toggleRequestProp(pos: number) {
    const current = trade!.requestPositions;
    onUpdate({
      ...trade!,
      requestPositions: current.includes(pos)
        ? current.filter(p => p !== pos)
        : [...current, pos],
    });
  }

  const isAwaiting = trade.status === 'awaiting_response';

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, maxWidth: 520 }}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>🤝 Negociação</div>
          <div style={styles.headerSub}>
            {proposerPawn.emoji} {proposer.name} ↔ {targetPawn.emoji} {target.name}
          </div>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', gap: 12 }}>
          {/* Proposer side */}
          <TradeSide
            label={`${proposerPawn.emoji} ${proposer.name} oferece`}
            player={proposer}
            ownedPositions={proposerProps}
            selectedPositions={trade.offerPositions}
            money={trade.offerMoney}
            state={state}
            onToggleProp={isAwaiting ? undefined : toggleOfferProp}
            onMoneyChange={isAwaiting ? undefined : (v) => onUpdate({ ...trade!, offerMoney: v })}
          />

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: '#9ca3af' }}>↔</div>

          {/* Target side */}
          <TradeSide
            label={`${targetPawn.emoji} ${target.name} oferece`}
            player={target}
            ownedPositions={targetProps}
            selectedPositions={trade.requestPositions}
            money={trade.requestMoney}
            state={state}
            onToggleProp={isAwaiting ? undefined : toggleRequestProp}
            onMoneyChange={isAwaiting ? undefined : (v) => onUpdate({ ...trade!, requestMoney: v })}
          />
        </div>

        {isAwaiting ? (
          /* Awaiting response — show to target player */
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 12, textAlign: 'center' }}>
              {targetPawn.emoji} <strong>{target.name}</strong>, você aceita esta troca?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onAccept} style={styles.btnAccept}>✅ Aceitar</button>
              <button onClick={onCancel} style={styles.btnDecline}>❌ Recusar</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 16px', display: 'flex', gap: 8, borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => onUpdate({ ...trade, status: 'awaiting_response' })}
              style={styles.btnPropose}
            >
              📤 Propor Troca
            </button>
            <button onClick={onCancel} style={styles.btnCancel}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function TradeSide({
  label, player, ownedPositions, selectedPositions, money, state,
  onToggleProp, onMoneyChange,
}: {
  label: string;
  player: import('../types').Player;
  ownedPositions: number[];
  selectedPositions: number[];
  money: number;
  state: GameState;
  onToggleProp?: (pos: number) => void;
  onMoneyChange?: (v: number) => void;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{label}</div>

      {/* Money */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>R$</span>
        <input
          type="number"
          min={0}
          max={player.money}
          value={money || ''}
          disabled={!onMoneyChange}
          onChange={e => onMoneyChange?.(Math.min(player.money, Math.max(0, parseInt(e.target.value) || 0)))}
          placeholder="0"
          style={{
            width: 80,
            padding: '5px 8px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        />
        <span style={{ fontSize: 11, color: '#9ca3af' }}>/ R${player.money}</span>
      </div>

      {/* Properties */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 180, overflowY: 'auto' }}>
        {ownedPositions.length === 0 && (
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Sem propriedades</span>
        )}
        {ownedPositions.map(pos => {
          const space = getSpace(pos);
          const color = space.group ? GROUP_COLORS[space.group] : '#6b7280';
          const selected = selectedPositions.includes(pos);
          return (
            <div
              key={pos}
              onClick={() => onToggleProp?.(pos)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 8px',
                borderRadius: 6,
                border: `1px solid ${selected ? color : '#e5e7eb'}`,
                background: selected ? `${color}20` : '#f9fafb',
                cursor: onToggleProp ? 'pointer' : 'default',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, flex: 1 }}>{space.name}</span>
              {selected && <span style={{ fontSize: 10 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
    color: '#fff',
  },
  headerTitle: { fontSize: 13, fontWeight: 700, opacity: 0.9, marginBottom: 2 },
  headerSub: { fontSize: 17, fontWeight: 800, lineHeight: 1.2 },
  targetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'background 0.1s',
    width: '100%',
  },
  btnPropose: {
    flex: 1,
    padding: '10px',
    background: '#1d4ed8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnCancel: {
    padding: '10px 16px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnAccept: {
    flex: 1,
    padding: '10px',
    background: '#166534',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnDecline: {
    flex: 1,
    padding: '10px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
