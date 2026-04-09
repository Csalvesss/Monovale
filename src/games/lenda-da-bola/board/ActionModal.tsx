import React, { useState } from 'react';
import type { ActionResult, BoardPlayer } from './types';
import { PLAYER_COLORS } from './types';
import type { BoardCard } from './cards';
import { CARD_COST, POSITION_LABEL } from './cards';
import { buyCard } from './service';

// ─── Star renderer ─────────────────────────────────────────────────────────────

function Stars({ n, size = 11 }: { n: number; size?: number }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {'★'.repeat(n)}<span style={{ opacity: 0.2 }}>{'★'.repeat(5 - n)}</span>
    </span>
  );
}

// ─── Card tile ────────────────────────────────────────────────────────────────

function CardTile({
  card,
  canAfford,
  bought,
  disabled,
  onBuy,
}: {
  card: BoardCard;
  canAfford: boolean;
  bought: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const cost = CARD_COST[card.stars];
  const posColors: Record<BoardCard['position'], string> = {
    GK: '#7c3aed', DEF: '#2563eb', MID: '#16a34a', ATK: '#dc2626',
  };
  return (
    <button
      onClick={onBuy}
      disabled={disabled || !canAfford || bought}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        borderRadius: 12, border: `1.5px solid ${bought ? 'rgba(34,197,94,0.5)' : canAfford && !disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        background: bought ? 'rgba(22,163,74,0.1)' : 'rgba(255,255,255,0.04)',
        padding: '12px 8px', cursor: canAfford && !disabled ? 'pointer' : 'default',
        opacity: !canAfford && !bought ? 0.45 : 1,
        transition: 'all 0.15s',
        flex: '1',
      }}
    >
      {/* Flag + position badge */}
      <div style={{ position: 'relative' }}>
        <span style={{ fontSize: 28 }}>{card.flag}</span>
        <span style={{
          position: 'absolute', bottom: -4, right: -6,
          fontSize: 8, fontWeight: 800, color: '#fff',
          background: posColors[card.position],
          padding: '1px 3px', borderRadius: 4,
        }}>
          {POSITION_LABEL[card.position]}
        </span>
      </div>
      {/* Stars */}
      <div style={{ color: '#fbbf24' }}>
        <Stars n={card.stars} size={10} />
      </div>
      {/* Name */}
      <p style={{ fontSize: 10, fontWeight: 800, color: '#f1f5f9', textAlign: 'center', lineHeight: 1.2 }}>
        {card.name}
      </p>
      {/* Price / Bought */}
      {bought ? (
        <span style={{ fontSize: 10, fontWeight: 800, color: '#4ade80' }}>✓ Contratado</span>
      ) : (
        <span style={{ fontSize: 10, fontWeight: 700, color: canAfford ? '#fbbf24' : '#ef4444' }}>
          {cost} NIG
        </span>
      )}
    </button>
  );
}

// ─── Header type configs ──────────────────────────────────────────────────────

const TYPE_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  'start':      { color: '#86efac', bg: 'rgba(22,163,74,0.15)',  icon: '🏟️' },
  'match-day':  { color: '#fdba74', bg: 'rgba(234,88,12,0.15)',  icon: '⚽' },
  'transfer':   { color: '#93c5fd', bg: 'rgba(37,99,235,0.15)',  icon: '🔄' },
  'sponsor':    { color: '#fcd34d', bg: 'rgba(180,83,9,0.15)',   icon: '🏆' },
  'legend':     { color: '#fbbf24', bg: 'rgba(146,64,14,0.15)',  icon: '⭐' },
  'rest':       { color: '#94a3b8', bg: 'rgba(71,85,105,0.2)',   icon: '😴' },
  'challenge':  { color: '#c4b5fd', bg: 'rgba(124,58,237,0.15)', icon: '⚡' },
  'bonus':      { color: '#86efac', bg: 'rgba(21,128,61,0.15)',  icon: '💰' },
  'penalty':    { color: '#fca5a5', bg: 'rgba(185,28,28,0.15)',  icon: '📉' },
  'extra-turn': { color: '#67e8f9', bg: 'rgba(8,145,178,0.15)', icon: '🎲' },
};

// ─── ActionModal ─────────────────────────────────────────────────────────────

interface Props {
  action: ActionResult;
  player: BoardPlayer;
  roomCode: string;
  isMyTurn: boolean;
  onConfirm: () => void;
}

export default function ActionModal({ action, player, roomCode, isMyTurn, onConfirm }: Props) {
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState<string | null>(null);

  async function handleBuyCard(card: BoardCard) {
    if (buying || bought) return;
    setBuying(true);
    await buyCard(roomCode, player.uid, card);
    setBought(card.id);
    setBuying(false);
  }

  const cfg = TYPE_CFG[action.spaceType] ?? TYPE_CFG['match-day'];
  const colors = PLAYER_COLORS[player.color];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#1e293b',
        borderTop: `3px solid ${cfg.color}`,
        borderRadius: '24px 24px 0 0',
        animation: 'lenda-slide-up 0.3s var(--ease-out)',
        maxHeight: '88dvh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: cfg.bg, padding: '18px 20px 14px',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
            background: cfg.bg, border: `2px solid ${cfg.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>
            {cfg.icon}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: cfg.color, marginBottom: 2 }}>
              {action.spaceLabel}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: colors.bg, border: `1.5px solid ${colors.light}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900, color: '#fff',
              }}>
                {player.name.charAt(0)}
              </div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>{player.name}</p>
              <span style={{ fontSize: 11, color: '#64748b' }}>· dado: {action.dice}</span>
            </div>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>

          {/* NIG / Points deltas */}
          {(action.nigDelta !== 0 || action.pointsDelta !== 0) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {action.nigDelta !== 0 && (
                <div style={{
                  flex: 1, borderRadius: 10, padding: '10px 12px',
                  background: action.nigDelta > 0 ? 'rgba(22,163,74,0.12)' : 'rgba(185,28,28,0.12)',
                  border: `1px solid ${action.nigDelta > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: action.nigDelta > 0 ? '#4ade80' : '#f87171' }}>
                    {action.nigDelta > 0 ? '+' : ''}{action.nigDelta}
                  </p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em' }}>NIG</p>
                </div>
              )}
              {action.pointsDelta !== 0 && (
                <div style={{
                  flex: 1, borderRadius: 10, padding: '10px 12px',
                  background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>+{action.pointsDelta}</p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em' }}>PONTOS</p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 14 }}>
            {action.description}
          </p>

          {/* Match detail */}
          {action.matchDetail && (
            <div style={{
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', padding: '10px 12px', marginBottom: 14,
            }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
                Detalhes da Partida
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#f8fafc', letterSpacing: '0.06em' }}>
                  {action.matchDetail.homeGoals} × {action.matchDetail.awayGoals}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                  background: action.matchDetail.outcome === 'win' ? 'rgba(22,163,74,0.2)' : action.matchDetail.outcome === 'draw' ? 'rgba(37,99,235,0.2)' : 'rgba(185,28,28,0.2)',
                  color: action.matchDetail.outcome === 'win' ? '#4ade80' : action.matchDetail.outcome === 'draw' ? '#93c5fd' : '#f87171',
                  border: `1px solid ${action.matchDetail.outcome === 'win' ? 'rgba(74,222,128,0.3)' : action.matchDetail.outcome === 'draw' ? 'rgba(147,197,253,0.3)' : 'rgba(248,113,113,0.3)'}`,
                }}>
                  {action.matchDetail.outcome === 'win' ? '✓ VITÓRIA' : action.matchDetail.outcome === 'draw' ? '= EMPATE' : '✗ DERROTA'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {action.matchDetail.events.map((ev, i) => (
                  <p key={i} style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{ev}</p>
                ))}
              </div>
              {/* Defense token info */}
              <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                <p style={{ fontSize: 10, color: '#64748b' }}>
                  Seu elenco: <strong style={{ color: '#f8fafc' }}>{player.cards.length} jogadores</strong>
                  {' · '}Ataque: <strong style={{ color: '#f8fafc' }}>1-{player.attackRange}</strong>
                  {' · '}Fichas de defesa: <strong style={{ color: '#f8fafc' }}>{player.defenseTokens}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Transfer market — card offers */}
          {action.spaceType === 'transfer' && action.marketOffers && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: 10 }}>
                Jogadores disponíveis
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {action.marketOffers.map(card => (
                  <CardTile
                    key={card.id}
                    card={card}
                    canAfford={player.nig >= CARD_COST[card.stars]}
                    bought={bought === card.id}
                    disabled={buying || (!!bought && bought !== card.id) || !isMyTurn}
                    onBuy={() => handleBuyCard(card)}
                  />
                ))}
              </div>
              {!isMyTurn && (
                <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 8 }}>
                  Só {player.name} pode comprar nesta jogada.
                </p>
              )}
            </div>
          )}

          {/* Current stats */}
          <div style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            {[
              { label: 'NIG',     value: Math.max(0, player.nig + action.nigDelta),     icon: '💰' },
              { label: 'PTS',     value: Math.max(0, player.points + action.pointsDelta), icon: '🏆' },
              { label: 'ELENCO',  value: player.cards.length,                             icon: '🃏' },
              { label: 'DEFESA',  value: player.defenseTokens,                            icon: '🛡️' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: '#64748b', marginBottom: 2 }}>
                  {icon} {label}
                </p>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#f8fafc' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {isMyTurn ? (
            <button onClick={onConfirm} className="lenda-btn-gold"
              style={{ width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {action.extraTurn ? '🎲 Rolar Novamente' : 'Próximo →'}
            </button>
          ) : (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              Aguardando {player.name} confirmar…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
