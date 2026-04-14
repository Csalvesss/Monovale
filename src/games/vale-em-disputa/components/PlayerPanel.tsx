// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Player Panel
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import type { GameState } from '../types';
import { FACTIONS, TERRITORY_CARD_SYMBOL, REGIONS, CITY_REGION } from '../constants';

interface Props {
  gameState: GameState;
  currentPlayerId: string; // the local viewer's player ID
}

const SYMBOL_ICONS: Record<string, string> = {
  square: '■',
  triangle: '▲',
  circle: '●',
};

const SYMBOL_COLORS: Record<string, string> = {
  square: '#3b82f6',
  triangle: '#f59e0b',
  circle: '#ec4899',
};

export default function PlayerPanel({ gameState, currentPlayerId }: Props) {
  const [showMission, setShowMission] = useState(false);
  const { players, territories, currentTurn, playerOrder } = gameState;

  const myPlayer = players[currentPlayerId];

  // Calculate territories per player
  function countCities(pid: string) {
    return Object.values(territories).filter(t => t.owner === pid).length;
  }

  // Count complete regions per player
  function countRegionBonuses(pid: string): number {
    let count = 0;
    for (const region of REGIONS) {
      if (region.cities.every(c => territories[c]?.owner === pid)) count++;
    }
    return count;
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      height: '100%', overflowY: 'auto',
      padding: '4px 2px',
    }}>

      {/* My mission card */}
      {myPlayer && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Minha Missão Secreta
            </span>
            <button
              onClick={() => setShowMission(v => !v)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: 6, padding: '2px 8px', cursor: 'pointer',
                fontSize: 10, color: '#94a3b8',
              }}
            >
              {showMission ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          {showMission && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fcd34d', marginBottom: 4 }}>
                {myPlayer.mission.title}
              </div>
              <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.5 }}>
                {myPlayer.mission.description}
                {myPlayer.mission.targetPlayerId && (
                  <span style={{ color: '#fca5a5', fontWeight: 700 }}>
                    {' '}Alvo: {players[myPlayer.mission.targetPlayerId]?.name ?? '?'}
                  </span>
                )}
              </div>
            </div>
          )}
          {!showMission && (
            <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
              Clique em "Ver" para revelar sua missão
            </div>
          )}

          {/* Territory cards in hand */}
          {myPlayer.hand.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>
                CARTAS NA MÃO ({myPlayer.hand.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {myPlayer.hand.map(city => {
                  const sym = TERRITORY_CARD_SYMBOL[city];
                  return (
                    <div key={city} style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: `1px solid ${SYMBOL_COLORS[sym]}55`,
                      borderRadius: 6,
                      padding: '3px 7px',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ color: SYMBOL_COLORS[sym], fontSize: 10 }}>{SYMBOL_ICONS[sym]}</span>
                      <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 600 }}>
                        {city.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All players list */}
      {playerOrder.map(pid => {
        const player = players[pid];
        if (!player) return null;
        const faction = FACTIONS[player.faction];
        const isCurrentTurn = pid === currentTurn;
        const cityCount = countCities(pid);
        const regionCount = countRegionBonuses(pid);
        const isMe = pid === currentPlayerId;

        return (
          <div
            key={pid}
            style={{
              background: isCurrentTurn
                ? 'linear-gradient(135deg, #1e3a5f, #0f172a)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isCurrentTurn ? faction.color + '66' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 12,
              padding: '12px 14px',
              opacity: player.eliminated ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: faction.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {faction.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 800,
                    color: isCurrentTurn ? '#f1f5f9' : '#cbd5e1',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {player.name}
                  </span>
                  {isMe && (
                    <span style={{
                      fontSize: 9, background: '#059669', color: '#fff',
                      borderRadius: 4, padding: '1px 5px', fontWeight: 700,
                    }}>EU</span>
                  )}
                  {isCurrentTurn && (
                    <span style={{
                      fontSize: 9, background: faction.color, color: '#fff',
                      borderRadius: 4, padding: '1px 5px', fontWeight: 700,
                    }}>VEZ</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                  {faction.name}
                </div>
              </div>
              {player.eliminated && (
                <span style={{ fontSize: 12, opacity: 0.7 }}>💀</span>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatChip label="Cidades" value={cityCount} icon="🏙️" />
              <StatChip label="Ouro" value={player.gold} icon="💰" />
              <StatChip label="Regiões" value={regionCount} icon="🗺️" />
              <StatChip label="Vitórias" value={player.combatWins} icon="⚔️" />
            </div>

            {/* Faction power progress */}
            {!player.eliminated && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>Poder Ativo</span>
                  <span style={{ fontSize: 9, color: player.pendingPowerAvailable ? '#10b981' : '#64748b', fontWeight: 700 }}>
                    {player.pendingPowerAvailable ? 'DISPONÍVEL!' : `${Math.min(player.combatWins, 3)}/3`}
                  </span>
                </div>
                <div style={{
                  height: 3, background: 'rgba(255,255,255,0.1)',
                  borderRadius: 99, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (player.combatWins / 3) * 100)}%`,
                    background: player.pendingPowerAvailable ? '#10b981' : faction.color,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatChip({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3,
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 6, padding: '3px 7px',
    }}>
      <span style={{ fontSize: 10 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{value}</span>
      <span style={{ fontSize: 9, color: '#64748b' }}>{label}</span>
    </div>
  );
}
