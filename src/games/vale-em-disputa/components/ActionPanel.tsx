// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Action Panel
// Controls for the current player during their turn
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import type { GameState } from '../types';
import { FACTIONS, CITY_REGION } from '../constants';
import { calculateReinforcements, mustTradeCards } from '../logic/gameEngine';

interface Props {
  gameState: GameState;
  playerId: string;
  isMyTurn: boolean;
  selectedCity: string | null;
  attackFrom: string | null;
  moveFrom: string | null;
  reinforcementsLeft: number;
  onReinforce: (city: string, troops: number) => void;
  onStartAttack: (from: string) => void;
  onConfirmAttack: (from: string, to: string) => void;
  onCancelAttack: () => void;
  onStartMove: (from: string) => void;
  onConfirmMove: (from: string, to: string, troops: number) => void;
  onCancelMove: () => void;
  onEndPhase: () => void;
  onSpendGold: (amount: number) => void;
  onUseFactionPower: () => void;
  onOpenCards: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  reinforce: 'Reforço',
  attack: 'Ataque',
  move: 'Reagrupamento',
  end: 'Fim do Turno',
};

const PHASE_COLORS: Record<string, string> = {
  reinforce: '#059669',
  attack: '#dc2626',
  move: '#3b82f6',
  end: '#9333ea',
};

export default function ActionPanel({
  gameState, playerId, isMyTurn, selectedCity, attackFrom, moveFrom,
  reinforcementsLeft, onReinforce, onStartAttack, onConfirmAttack, onCancelAttack,
  onStartMove, onConfirmMove, onCancelMove, onEndPhase, onSpendGold, onUseFactionPower,
  onOpenCards,
}: Props) {
  const [moveTroopCount, setMoveTroopCount] = useState(1);

  const phase = gameState.currentPhase;
  const player = gameState.players[playerId];
  const currentPlayer = gameState.players[gameState.currentTurn];
  const territory = selectedCity ? gameState.territories[selectedCity] : null;
  const attackFromT = attackFrom ? gameState.territories[attackFrom] : null;
  const faction = player ? FACTIONS[player.faction] : null;

  if (!isMyTurn) {
    return (
      <div style={S.panel}>
        <div style={{
          textAlign: 'center', padding: '20px 10px',
          color: '#64748b', fontSize: 13,
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          Aguardando vez de{' '}
          <span style={{ color: '#f1f5f9', fontWeight: 700 }}>
            {currentPlayer?.name ?? '?'}
          </span>
          <div style={{
            marginTop: 8, fontSize: 11,
            color: PHASE_COLORS[phase] ?? '#64748b',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Fase: {PHASE_LABELS[phase]}
          </div>
        </div>
      </div>
    );
  }

  if (!player || !faction) return null;

  const mustTrade = mustTradeCards(gameState, playerId);

  return (
    <div style={S.panel}>
      {/* Phase indicator */}
      <div style={{
        padding: '10px 14px',
        background: `${PHASE_COLORS[phase]}18`,
        borderBottom: `2px solid ${PHASE_COLORS[phase]}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Fase Atual — Turno {gameState.round}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: PHASE_COLORS[phase] }}>
            {PHASE_LABELS[phase]}
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: faction.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {faction.emoji}
        </div>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Mandatory card trade warning */}
        {mustTrade && (
          <div style={{
            background: '#7f1d1d', border: '1px solid #ef4444',
            borderRadius: 8, padding: '8px 12px', fontSize: 12,
            color: '#fca5a5', fontWeight: 700,
          }}>
            Você tem 5 cartas! Troca obrigatória antes de atacar.
            <button
              onClick={onOpenCards}
              style={{
                marginLeft: 8, background: '#dc2626', color: '#fff',
                border: 'none', borderRadius: 6, padding: '2px 8px',
                fontSize: 11, cursor: 'pointer', fontWeight: 700,
              }}
            >
              Trocar Cartas
            </button>
          </div>
        )}

        {/* ── REINFORCE PHASE ── */}
        {phase === 'reinforce' && (
          <div>
            <div style={S.sectionTitle}>
              Tropas disponíveis:{' '}
              <span style={{ color: '#10b981', fontWeight: 900 }}>{reinforcementsLeft}</span>
            </div>

            {selectedCity && territory?.owner === playerId && reinforcementsLeft > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <div style={S.cityInfo}>
                  📍 {selectedCity}
                  <span style={{ color: '#94a3b8' }}> ({territory.troops} tropas)</span>
                  {CITY_REGION[selectedCity] === 1 && player.faction === 'industriais' && (
                    <span style={{ color: '#10b981', fontSize: 10 }}> +1 passivo</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3].map(n => n <= reinforcementsLeft && (
                    <button
                      key={n}
                      onClick={() => onReinforce(selectedCity, n)}
                      style={{ ...S.btn, background: '#059669' }}
                    >
                      +{n}
                    </button>
                  ))}
                  {reinforcementsLeft > 3 && (
                    <button
                      onClick={() => onReinforce(selectedCity, reinforcementsLeft)}
                      style={{ ...S.btn, background: '#065f46' }}
                    >
                      +{reinforcementsLeft} (tudo)
                    </button>
                  )}
                </div>
              </div>
            )}

            {!selectedCity && reinforcementsLeft > 0 && (
              <p style={S.hint}>Clique em uma das suas cidades no mapa para reforçar.</p>
            )}

            {reinforcementsLeft === 0 && (
              <div>
                <p style={{ color: '#64748b', fontSize: 12, margin: '4px 0 10px' }}>
                  Todos os reforços foram colocados.
                </p>
                {/* Gold spend */}
                {player.gold >= 2 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={S.sectionTitle}>Gastar Ouro</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button onClick={() => onSpendGold(2)} style={{ ...S.btn, background: '#b45309' }}>
                        💰 2 ouro → +1 tropa
                      </button>
                      {player.gold >= 4 && (
                        <button onClick={() => onSpendGold(4)} style={{ ...S.btn, background: '#92400e' }}>
                          💰 4 → +2
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <button onClick={onEndPhase} style={{ ...S.btn, background: '#dc2626', width: '100%' }}>
                  Passar para Ataque →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ATTACK PHASE ── */}
        {phase === 'attack' && (
          <div>
            {/* Faction power */}
            {player.pendingPowerAvailable && (
              <button
                onClick={onUseFactionPower}
                style={{ ...S.btn, background: faction.color, width: '100%', marginBottom: 6 }}
              >
                ⭐ Usar Poder: {faction.active}
              </button>
            )}

            {!attackFrom && (
              <>
                {selectedCity && territory?.owner === playerId && territory.troops >= 2 && (
                  <div>
                    <div style={S.cityInfo}>📍 {selectedCity} ({territory.troops} tropas)</div>
                    <button
                      onClick={() => onStartAttack(selectedCity)}
                      style={{ ...S.btn, background: '#dc2626', marginTop: 6 }}
                    >
                      Atacar a partir daqui
                    </button>
                  </div>
                )}
                {(!selectedCity || territory?.owner !== playerId || (territory?.troops ?? 0) < 2) && (
                  <p style={S.hint}>Selecione uma cidade sua com ≥2 tropas para atacar.</p>
                )}
              </>
            )}

            {attackFrom && !selectedCity && (
              <div>
                <div style={S.cityInfo}>
                  ⚔️ Atacando de: <strong>{attackFrom}</strong> ({attackFromT?.troops} tropas)
                </div>
                <p style={S.hint}>Clique em uma cidade inimiga adjacente para atacar.</p>
                <button onClick={onCancelAttack} style={{ ...S.btn, background: '#475569', marginTop: 6 }}>
                  Cancelar
                </button>
              </div>
            )}

            {attackFrom && selectedCity && selectedCity !== attackFrom && territory?.owner !== playerId && (
              <div>
                <div style={S.cityInfo}>
                  ⚔️ {attackFrom} → {selectedCity}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button
                    onClick={() => onConfirmAttack(attackFrom, selectedCity)}
                    style={{ ...S.btn, background: '#dc2626', flex: 1 }}
                  >
                    Atacar!
                  </button>
                  <button onClick={onCancelAttack} style={{ ...S.btn, background: '#475569' }}>
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Gold spend during attack */}
            {player.gold >= 2 && !attackFrom && (
              <div style={{ marginTop: 4 }}>
                <div style={S.sectionTitle}>Gastar Ouro</div>
                <button onClick={() => onSpendGold(2)} style={{ ...S.btn, background: '#b45309', marginTop: 4 }}>
                  💰 2 ouro → +1 tropa
                </button>
              </div>
            )}

            {/* Cards */}
            {player.hand.length > 0 && !mustTrade && (
              <button onClick={onOpenCards} style={{ ...S.btn, background: '#7c3aed', marginTop: 4 }}>
                🃏 Cartas ({player.hand.length})
              </button>
            )}

            <button onClick={onEndPhase} style={{ ...S.btn, background: '#3b82f6', width: '100%', marginTop: 6 }}>
              Passar para Reagrupamento →
            </button>
          </div>
        )}

        {/* ── MOVE PHASE ── */}
        {phase === 'move' && (
          <div>
            {!moveFrom && (
              <>
                {selectedCity && territory?.owner === playerId && territory.troops >= 2 && (
                  <div>
                    <div style={S.cityInfo}>📍 {selectedCity} ({territory.troops} tropas)</div>
                    <button
                      onClick={() => onStartMove(selectedCity)}
                      style={{ ...S.btn, background: '#3b82f6', marginTop: 6 }}
                    >
                      Mover a partir daqui
                    </button>
                  </div>
                )}
                {(!selectedCity || territory?.owner !== playerId || (territory?.troops ?? 0) < 2) && (
                  <p style={S.hint}>Selecione uma cidade sua com ≥2 tropas para mover tropas.</p>
                )}
              </>
            )}

            {moveFrom && !selectedCity && (
              <div>
                <div style={S.cityInfo}>➡️ Movendo de: <strong>{moveFrom}</strong></div>
                <p style={S.hint}>Selecione uma cidade sua adjacente.</p>
                <button onClick={onCancelMove} style={{ ...S.btn, background: '#475569', marginTop: 6 }}>
                  Cancelar
                </button>
              </div>
            )}

            {moveFrom && selectedCity && selectedCity !== moveFrom && territory?.owner === playerId && (
              <div>
                <div style={S.cityInfo}>➡️ {moveFrom} → {selectedCity}</div>
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Tropas a mover: {moveTroopCount}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={(gameState.territories[moveFrom]?.troops ?? 2) - 1}
                    value={moveTroopCount}
                    onChange={e => setMoveTroopCount(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => onConfirmMove(moveFrom, selectedCity, moveTroopCount)}
                    style={{ ...S.btn, background: '#3b82f6', flex: 1 }}
                  >
                    Mover {moveTroopCount}
                  </button>
                  <button onClick={onCancelMove} style={{ ...S.btn, background: '#475569' }}>
                    ✕
                  </button>
                </div>
              </div>
            )}

            <button onClick={onEndPhase} style={{ ...S.btn, background: '#9333ea', width: '100%', marginTop: 10 }}>
              Encerrar Turno →
            </button>
          </div>
        )}

        {/* ── END PHASE ── */}
        {phase === 'end' && (
          <div style={{ textAlign: 'center', padding: 10 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🏁</div>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Turno encerrado. Processando...</p>
          </div>
        )}

        {/* Reinforcement calc info */}
        {phase === 'reinforce' && reinforcementsLeft > 0 && (
          <div style={{
            fontSize: 10, color: '#475569', lineHeight: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 8,
          }}>
            Base: {Math.floor(
              Object.values(gameState.territories).filter(t => t.owner === playerId).length / 3
            )} + bônus de região + ouro
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  panel: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: 11, color: '#94a3b8', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: 4,
  },
  cityInfo: {
    fontSize: 13, color: '#e2e8f0', fontWeight: 600,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 8, padding: '6px 10px',
  },
  hint: {
    fontSize: 12, color: '#64748b', margin: '4px 0', lineHeight: 1.5,
    fontStyle: 'italic',
  },
  btn: {
    padding: '9px 14px',
    border: 'none', borderRadius: 8,
    color: '#fff', fontSize: 12, fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 4, transition: 'opacity 0.15s',
  },
};
