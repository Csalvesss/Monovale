// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Interactive SVG Map
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CITY_POSITIONS, ADJACENCIES, CITY_REGION, REGIONS, FACTIONS } from '../constants';
import type { GameState, FactionId } from '../types';

interface Props {
  gameState: GameState;
  currentPlayerId: string;
  selectedCity: string | null;
  attackFrom: string | null;
  moveFrom: string | null;
  phase: string;
  onCityClick: (city: string) => void;
}

const REGION_COLORS: Record<number, string> = {
  1: '#bbf7d0',
  2: '#bfdbfe',
  3: '#fef08a',
  4: '#fecaca',
  5: '#bae6fd',
};

function getFactionColor(faction: FactionId | null | undefined): string {
  if (!faction) return '#94a3b8';
  return FACTIONS[faction]?.color ?? '#94a3b8';
}

// Draw adjacency lines
function AdjacencyLines() {
  const lines: React.ReactNode[] = [];
  const drawn = new Set<string>();

  for (const [city, neighbors] of Object.entries(ADJACENCIES)) {
    const posA = CITY_POSITIONS[city];
    if (!posA) continue;
    for (const neighbor of neighbors) {
      const key = [city, neighbor].sort().join('|');
      if (drawn.has(key)) continue;
      drawn.add(key);
      const posB = CITY_POSITIONS[neighbor];
      if (!posB) continue;
      lines.push(
        <line
          key={key}
          x1={posA.x} y1={posA.y}
          x2={posB.x} y2={posB.y}
          stroke="#94a3b8"
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={0.5}
        />
      );
    }
  }
  return <>{lines}</>;
}

// Region label positions (approximate center)
const REGION_LABEL_POS: Record<number, { x: number; y: number }> = {
  1: { x: 200, y: 178 },
  2: { x: 415, y: 178 },
  3: { x: 590, y: 225 },
  4: { x: 735, y: 236 },
  5: { x: 270, y: 438 },
};

export default function MapSVG({
  gameState, currentPlayerId, selectedCity, attackFrom, moveFrom, phase, onCityClick,
}: Props) {
  const { territories, players } = gameState;

  function getCityState(city: string) {
    const t = territories[city];
    const owner = t?.owner;
    const faction = owner ? players[owner]?.faction : null;
    const isSelected = city === selectedCity || city === attackFrom || city === moveFrom;
    const isCurrentPlayer = owner === currentPlayerId;
    const isFrozen = gameState.activeEffects.some(
      e => (e.type === 'fortaleza_jacarei' || e.type === 'pico_mantiqueira' || e.type === 'faction_freeze')
        && e.targetCity === city
    );

    return { t, owner, faction, isSelected, isCurrentPlayer, isFrozen };
  }

  const viewBox = '0 0 900 560';

  return (
    <svg
      viewBox={viewBox}
      style={{ width: '100%', height: '100%', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Region background blobs */}
      {REGIONS.map(r => (
        <g key={r.id}>
          {r.cities.map(city => {
            const pos = CITY_POSITIONS[city];
            if (!pos) return null;
            return (
              <circle
                key={city}
                cx={pos.x} cy={pos.y}
                r={32}
                fill={REGION_COLORS[r.id]}
                opacity={0.35}
              />
            );
          })}
        </g>
      ))}

      {/* Region labels */}
      {REGIONS.map(r => {
        const lp = REGION_LABEL_POS[r.id];
        if (!lp) return null;
        return (
          <text
            key={r.id}
            x={lp.x} y={lp.y}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="#475569"
            opacity={0.6}
            style={{ userSelect: 'none', letterSpacing: '0.5px', textTransform: 'uppercase' }}
          >
            R{r.id}: {r.name}
          </text>
        );
      })}

      {/* Adjacency lines */}
      <AdjacencyLines />

      {/* City nodes */}
      {Object.entries(CITY_POSITIONS).map(([city, pos]) => {
        const { t, faction, isSelected, isCurrentPlayer, isFrozen } = getCityState(city);
        if (!t) return null;

        const factionColor = getFactionColor(faction);
        const troops = t.troops;
        const region = CITY_REGION[city];

        // Determine if this city is attackable / selectable in current context
        const isAttackable =
          (phase === 'attack' && attackFrom &&
            ADJACENCIES[attackFrom]?.includes(city) &&
            t.owner !== currentPlayerId);

        const isMoveable =
          (phase === 'move' && moveFrom &&
            ADJACENCIES[moveFrom]?.includes(city) &&
            t.owner === currentPlayerId);

        const isSource = city === attackFrom || city === moveFrom;

        let ringColor = 'transparent';
        let ringWidth = 0;
        if (isSelected && !isSource) {
          ringColor = '#f59e0b';
          ringWidth = 3;
        } else if (isSource) {
          ringColor = '#10b981';
          ringWidth = 3;
        } else if (isAttackable) {
          ringColor = '#ef4444';
          ringWidth = 2;
        } else if (isMoveable) {
          ringColor = '#3b82f6';
          ringWidth = 2;
        } else if (isCurrentPlayer && phase !== 'end') {
          ringColor = '#10b981';
          ringWidth = 1.5;
        }

        void region;

        return (
          <g
            key={city}
            onClick={() => onCityClick(city)}
            style={{ cursor: 'pointer' }}
            transform={`translate(${pos.x},${pos.y})`}
          >
            {/* Frozen indicator */}
            {isFrozen && (
              <circle r={20} fill="#bae6fd" opacity={0.6} />
            )}

            {/* Main circle */}
            <circle
              r={16}
              fill={factionColor}
              stroke={ringColor}
              strokeWidth={ringWidth}
              opacity={t.owner ? 1 : 0.6}
            />

            {/* Neutral (no owner) indicator */}
            {!t.owner && (
              <circle r={16} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
            )}

            {/* Troop count */}
            <text
              textAnchor="middle"
              dy="0.35em"
              fontSize={troops >= 10 ? 9 : 11}
              fontWeight={800}
              fill="#fff"
              style={{ userSelect: 'none' }}
            >
              {troops}
            </text>

            {/* City label */}
            <text
              y={23}
              textAnchor="middle"
              fontSize={7.5}
              fontWeight={600}
              fill="#1e293b"
              stroke="#fff"
              strokeWidth={2.5}
              paintOrder="stroke"
              style={{ userSelect: 'none' }}
            >
              {city.length > 14 ? city.replace(' do ', ' ').replace(' da ', ' ').replace(' de ', ' ') : city}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
