import React from 'react';
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

  // Target selection
  if (!target || trade.status === 'selecting_target') {
    return (
      <div style={S.overlay}>
        <div style={S.modal}>
          <div style={S.header}>
            <div style={S.headerEye}>🤝 Negociação</div>
            <div style={S.headerTitle}>Com quem negociar?</div>
          </div>
          <div style={S.targetBody}>
            {state.players
              .filter(p => p.id !== proposer.id && !p.bankrupt)
              .map(p => {
                const pawn = getPawn(p.pawnId);
                return (
                  <button
                    key={p.id}
                    onClick={() => onUpdate({ ...trade, targetPlayerIndex: state.players.indexOf(p), status: 'configuring' })}
                    style={S.targetBtn}
                  >
                    <div style={{ ...S.targetPawn, background: pawn.color }}>{pawn.emoji}</div>
                    <div>
                      <div style={S.targetName}>{p.name}</div>
                      <div style={S.targetMoney}>R${p.money.toLocaleString('pt-BR')}</div>
                    </div>
                    <span style={S.targetArrow}>→</span>
                  </button>
                );
              })}
            <button onClick={onCancel} style={S.cancelBtn}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  const proposerPawn = getPawn(proposer.pawnId);
  const targetPawn = getPawn(target.pawnId);
  const isAwaiting = trade.status === 'awaiting_response';

  const proposerProps = Object.entries(state.properties)
    .filter(([, ps]) => ps.ownerId === proposer.id).map(([pos]) => Number(pos));
  const targetProps = Object.entries(state.properties)
    .filter(([, ps]) => ps.ownerId === target.id).map(([pos]) => Number(pos));

  function toggleProp(side: 'offer' | 'request', pos: number) {
    if (isAwaiting) return;
    const key = side === 'offer' ? 'offerPositions' : 'requestPositions';
    const current = trade[key];
    onUpdate({ ...trade, [key]: current.includes(pos) ? current.filter(p => p !== pos) : [...current, pos] });
  }

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 540 }}>
        <div style={S.header}>
          <div style={S.headerEye}>🤝 Negociação</div>
          <div style={S.headerTitle}>
            {proposerPawn.emoji} {proposer.name} ↔ {targetPawn.emoji} {target.name}
          </div>
        </div>

        <div style={S.tradeBody}>
          <TradeSide
            label={`${proposerPawn.emoji} ${proposer.name} oferece`}
            color={proposerPawn.color}
            player={proposer}
            ownedPositions={proposerProps}
            selectedPositions={trade.offerPositions}
            money={trade.offerMoney}
            state={state}
            editable={!isAwaiting}
            onToggle={(pos) => toggleProp('offer', pos)}
            onMoneyChange={(v) => onUpdate({ ...trade, offerMoney: v })}
          />

          <div style={S.vsDiv}>↔</div>

          <TradeSide
            label={`${targetPawn.emoji} ${target.name} oferece`}
            color={targetPawn.color}
            player={target}
            ownedPositions={targetProps}
            selectedPositions={trade.requestPositions}
            money={trade.requestMoney}
            state={state}
            editable={!isAwaiting}
            onToggle={(pos) => toggleProp('request', pos)}
            onMoneyChange={(v) => onUpdate({ ...trade, requestMoney: v })}
          />
        </div>

        {isAwaiting ? (
          <div style={S.responseSection}>
            <div style={S.responseTitle}>
              {targetPawn.emoji} <strong>{target.name}</strong>, você aceita esta troca?
            </div>
            <div style={S.responseBtns}>
              <ActionBtn label="✅ ACEITAR" bg="var(--green-grad)" shadow="var(--green-dark)" onClick={onAccept} />
              <ActionBtn label="❌ RECUSAR" bg="var(--red-grad)" shadow="var(--red-dark)" onClick={onCancel} />
            </div>
          </div>
        ) : (
          <div style={S.proposeSection}>
            <ActionBtn
              label="📤 PROPOR TROCA"
              bg="linear-gradient(135deg,#60a5fa,#3b82f6)"
              shadow="#1d4ed8"
              onClick={() => onUpdate({ ...trade, status: 'awaiting_response' })}
            />
            <button onClick={onCancel} style={S.cancelBtn}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function TradeSide({ label, color, player, ownedPositions, selectedPositions, money, state, editable, onToggle, onMoneyChange }: {
  label: string; color: string;
  player: import('../types').Player;
  ownedPositions: number[];
  selectedPositions: number[];
  money: number;
  state: GameState;
  editable: boolean;
  onToggle: (pos: number) => void;
  onMoneyChange: (v: number) => void;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', borderBottom: `3px solid ${color}`, paddingBottom: 4 }}>
        {label}
      </div>

      {/* Money input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mid)' }}>R$</span>
        <input
          type="number"
          min={0}
          max={player.money}
          value={money || ''}
          disabled={!editable}
          onChange={e => onMoneyChange(Math.min(player.money, Math.max(0, parseInt(e.target.value) || 0)))}
          placeholder="0"
          style={{
            width: 80,
            padding: '6px 10px',
            border: '2px solid var(--border-gold)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: 'var(--font-body)',
            background: 'var(--white)',
            color: 'var(--text)',
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>/ R${player.money}</span>
      </div>

      {/* Properties */}
      <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ownedPositions.length === 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-light)', fontStyle: 'italic' }}>Sem propriedades</span>
        )}
        {ownedPositions.map(pos => {
          const space = getSpace(pos);
          const propColor = space.group ? GROUP_COLORS[space.group] : '#999';
          const sel = selectedPositions.includes(pos);
          return (
            <div
              key={pos}
              onClick={() => editable && onToggle(pos)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 8px',
                borderRadius: 8,
                border: `2px solid ${sel ? propColor : 'var(--border)'}`,
                background: sel ? `${propColor}20` : 'var(--card-alt)',
                cursor: editable ? 'pointer' : 'default',
                transition: 'all 0.1s',
              }}
            >
              <div style={{ width: 9, height: 9, borderRadius: 3, background: propColor, flexShrink: 0 }} />
              <span style={{ fontSize: 11, flex: 1, fontWeight: 600, color: 'var(--text)' }}>{space.name}</span>
              {sel && <span style={{ fontSize: 12, color: propColor, fontWeight: 900 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionBtn({ label, bg, shadow, onClick }: { label: string; bg: string; shadow: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px',
        background: bg,
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-title)',
        fontSize: 15,
        letterSpacing: '0.5px',
        cursor: 'pointer',
        boxShadow: `0 4px 0 ${shadow}`,
      }}
    >
      {label}
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    width: '100%', maxWidth: 420,
    boxShadow: 'var(--shadow-lg)',
    border: '3px solid var(--border-gold)',
    animation: 'pop-in 0.25s ease',
  },
  header: {
    padding: '16px 22px',
    background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
    color: '#fff',
  },
  headerEye: { fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: '1px', marginBottom: 4 },
  headerTitle: { fontFamily: 'var(--font-title)', fontSize: 20, lineHeight: 1.2 },

  targetBody: {
    padding: '16px',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  targetBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px',
    background: 'var(--card-alt)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 3px 0 var(--border)',
    transition: 'transform 0.1s',
  },
  targetPawn: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, border: '2px solid rgba(255,255,255,0.4)',
  },
  targetName: { fontWeight: 800, fontSize: 15, color: 'var(--text)' },
  targetMoney: { fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 },
  targetArrow: { marginLeft: 'auto', fontSize: 18, color: 'var(--text-light)' },

  tradeBody: {
    padding: '14px 18px',
    display: 'flex', gap: 14,
  },
  vsDiv: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, color: 'var(--text-light)', fontWeight: 900,
    flexShrink: 0,
  },

  responseSection: {
    padding: '14px 18px',
    borderTop: '2px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  responseTitle: {
    fontSize: 14, fontWeight: 700, color: 'var(--text)',
    textAlign: 'center',
  },
  responseBtns: { display: 'flex', gap: 10 },

  proposeSection: {
    padding: '14px 18px',
    borderTop: '2px solid var(--border)',
    display: 'flex', gap: 10, alignItems: 'center',
  },

  cancelBtn: {
    padding: '10px 18px',
    background: 'var(--card-alt)',
    color: 'var(--text)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 13, fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 3px 0 var(--border)',
  },
};
