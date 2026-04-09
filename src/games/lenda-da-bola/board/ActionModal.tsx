import React, { useState } from 'react';
import type { ActionResult, BoardPlayer } from './types';
import { PLAYER_COLORS } from './types';
import { TRANSFER_UPGRADES } from './data';
import { buyUpgrade } from './service';

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

  async function handleBuy(upgradeId: 'attack' | 'defense') {
    setBuying(true);
    await buyUpgrade(roomCode, player.uid, upgradeId, 300);
    setBought(upgradeId);
    setBuying(false);
  }

  const typeConfig: Record<string, { headerColor: string; headerBg: string; icon: string }> = {
    'start':      { headerColor: '#86efac', headerBg: 'rgba(22,163,74,0.15)',  icon: '🏟️' },
    'match-day':  { headerColor: '#fdba74', headerBg: 'rgba(234,88,12,0.15)',  icon: '⚽' },
    'transfer':   { headerColor: '#93c5fd', headerBg: 'rgba(37,99,235,0.15)',  icon: '🔄' },
    'sponsor':    { headerColor: '#fcd34d', headerBg: 'rgba(180,83,9,0.15)',   icon: '🏆' },
    'legend':     { headerColor: '#fbbf24', headerBg: 'rgba(146,64,14,0.15)',  icon: '⭐' },
    'rest':       { headerColor: '#94a3b8', headerBg: 'rgba(71,85,105,0.2)',   icon: '😴' },
    'challenge':  { headerColor: '#c4b5fd', headerBg: 'rgba(124,58,237,0.15)', icon: '⚡' },
    'bonus':      { headerColor: '#86efac', headerBg: 'rgba(21,128,61,0.15)',  icon: '💰' },
    'penalty':    { headerColor: '#fca5a5', headerBg: 'rgba(185,28,28,0.15)',  icon: '📉' },
    'extra-turn': { headerColor: '#67e8f9', headerBg: 'rgba(8,145,178,0.15)', icon: '🎲' },
  };

  const cfg = typeConfig[action.spaceType] ?? typeConfig['match-day'];
  const colors = PLAYER_COLORS[player.color];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#1e293b',
        borderTop: `3px solid ${cfg.headerColor}`,
        borderRadius: '24px 24px 0 0',
        animation: 'lenda-slide-up 0.3s var(--ease-out)',
        overflow: 'hidden',
        maxHeight: '85dvh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: cfg.headerBg,
          padding: '20px 20px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: cfg.headerBg,
            border: `2px solid ${cfg.headerColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>
            {cfg.icon}
          </div>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: cfg.headerColor, marginBottom: 2,
            }}>
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
              <p style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
                {player.name}
              </p>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                · dados: {action.dice}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>

          {/* Deltas */}
          {(action.nigDelta !== 0 || action.pointsDelta !== 0) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {action.nigDelta !== 0 && (
                <div style={{
                  flex: 1, borderRadius: 10, padding: '10px 12px',
                  background: action.nigDelta > 0 ? 'rgba(22,163,74,0.12)' : 'rgba(185,28,28,0.12)',
                  border: `1px solid ${action.nigDelta > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: 20, fontWeight: 900, color: action.nigDelta > 0 ? '#4ade80' : '#f87171' }}>
                    {action.nigDelta > 0 ? '+' : ''}{action.nigDelta}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em' }}>NIG</p>
                </div>
              )}
              {action.pointsDelta !== 0 && (
                <div style={{
                  flex: 1, borderRadius: 10, padding: '10px 12px',
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>
                    +{action.pointsDelta}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em' }}>PONTOS</p>
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
              background: 'rgba(255,255,255,0.04)',
              padding: '10px 12px', marginBottom: 14,
            }}>
              <p className="lenda-label" style={{ marginBottom: 8 }}>Detalhes da Partida</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#f8fafc', letterSpacing: '0.06em' }}>
                  {action.matchDetail.homeGoals} × {action.matchDetail.awayGoals}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                  background: action.matchDetail.outcome === 'win' ? 'rgba(22,163,74,0.2)' :
                               action.matchDetail.outcome === 'draw' ? 'rgba(37,99,235,0.2)' : 'rgba(185,28,28,0.2)',
                  color: action.matchDetail.outcome === 'win' ? '#4ade80' :
                         action.matchDetail.outcome === 'draw' ? '#93c5fd' : '#f87171',
                  border: `1px solid ${action.matchDetail.outcome === 'win' ? 'rgba(74,222,128,0.3)' :
                                        action.matchDetail.outcome === 'draw' ? 'rgba(147,197,253,0.3)' : 'rgba(248,113,113,0.3)'}`,
                }}>
                  {action.matchDetail.outcome === 'win' ? '✓ VITÓRIA' :
                   action.matchDetail.outcome === 'draw' ? '= EMPATE' : '✗ DERROTA'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {action.matchDetail.events.map((ev, i) => (
                  <p key={i} style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{ev}</p>
                ))}
              </div>
            </div>
          )}

          {/* Transfer market upgrade options */}
          {action.spaceType === 'transfer' && isMyTurn && (
            <div style={{ marginBottom: 14 }}>
              <p className="lenda-label" style={{ marginBottom: 8 }}>Comprar melhoria</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TRANSFER_UPGRADES.map(upg => {
                  const isBought = bought === upg.id;
                  const canAfford = player.nig >= upg.cost;
                  return (
                    <button
                      key={upg.id}
                      onClick={() => handleBuy(upg.id)}
                      disabled={buying || !!bought || !canAfford}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        borderRadius: 10, border: `1px solid ${isBought ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
                        background: isBought ? 'rgba(22,163,74,0.1)' : 'rgba(255,255,255,0.04)',
                        padding: '10px 12px', cursor: canAfford && !bought ? 'pointer' : 'default',
                        opacity: !canAfford && !isBought ? 0.4 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{upg.emoji}</span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>{upg.label}</p>
                        <p style={{ fontSize: 10, color: '#64748b' }}>
                          {canAfford ? `Custo: ${upg.cost} NIG` : `Sem NIG (custo: ${upg.cost})`}
                        </p>
                      </div>
                      {isBought && <span style={{ fontSize: 14, color: '#4ade80' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats after action */}
          <div style={{
            display: 'flex', gap: 8,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 12, marginTop: 4,
          }}>
            {[
              { label: 'NIG', value: Math.max(0, player.nig + action.nigDelta), icon: '💰' },
              { label: 'PONTOS', value: Math.max(0, player.points + action.pointsDelta), icon: '🏆' },
              { label: 'ATAQUE', value: player.attackRange, icon: '⚔️' },
              { label: 'DEFESA', value: player.defenseTokens, icon: '🛡️' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#64748b', marginBottom: 2 }}>
                  {icon} {label}
                </p>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#f8fafc' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {isMyTurn ? (
            <button
              onClick={onConfirm}
              className="lenda-btn-gold"
              style={{
                width: '100%', padding: 14, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
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
