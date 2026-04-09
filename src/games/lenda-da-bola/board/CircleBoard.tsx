import React, { useMemo } from 'react';
import type { BoardPlayer } from './types';
import { PLAYER_COLORS } from './types';
import { BOARD_SPACES } from './data';

// ─── Geometry helpers ─────────────────────────────────────────────────────────

const TOTAL = BOARD_SPACES.length; // 36
const CX = 155;
const CY = 155;
const OUTER_R = 138;   // space center radius
const SPACE_SIZE = 28; // space box size
const SVG_SIZE = 310;

function spacePos(id: number): { x: number; y: number } {
  const angle = (2 * Math.PI * id) / TOTAL - Math.PI / 2;
  return {
    x: CX + OUTER_R * Math.cos(angle),
    y: CY + OUTER_R * Math.sin(angle),
  };
}

// ─── CircleBoard ─────────────────────────────────────────────────────────────

interface Props {
  players: BoardPlayer[];
  currentTurnUid: string;
  highlightSpace?: number;
}

export default function CircleBoard({ players, currentTurnUid, highlightSpace }: Props) {
  const positions = useMemo(() => BOARD_SPACES.map((_, id) => spacePos(id)), []);

  // Group players by position
  const playersByPosition: Record<number, BoardPlayer[]> = {};
  for (const p of players) {
    if (!playersByPosition[p.position]) playersByPosition[p.position] = [];
    playersByPosition[p.position].push(p);
  }

  return (
    <div style={{ position: 'relative', width: SVG_SIZE, height: SVG_SIZE }}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* ── Board ring background ── */}
        <circle cx={CX} cy={CY} r={OUTER_R + SPACE_SIZE / 2 + 4}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SPACE_SIZE + 8} />

        {/* ── Spaces ── */}
        {BOARD_SPACES.map((space, id) => {
          const { x, y } = positions[id];
          const isHighlighted = highlightSpace === id;
          const sz = SPACE_SIZE;
          const rx = x - sz / 2;
          const ry = y - sz / 2;
          return (
            <g key={id}>
              <rect
                x={rx} y={ry} width={sz} height={sz}
                rx={6}
                fill={space.color}
                opacity={isHighlighted ? 1 : 0.88}
                stroke={isHighlighted ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isHighlighted ? 2 : 0.8}
              />
              {/* Space id */}
              <text
                x={x} y={y - 5}
                textAnchor="middle" dominantBaseline="middle"
                fill="rgba(255,255,255,0.6)" fontSize={7} fontWeight="700"
              >
                {id}
              </text>
              {/* Emoji */}
              <text
                x={x} y={y + 6}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={13}
              >
                {space.emoji}
              </text>
            </g>
          );
        })}

        {/* ── Player tokens ── */}
        {Object.entries(playersByPosition).map(([pos, pList]) =>
          pList.map((p, i) => {
            const { x, y } = positions[Number(pos)];
            // Offset multiple tokens so they don't overlap
            const offsetAngle = (2 * Math.PI * i) / Math.max(pList.length, 1);
            const offsetR = pList.length > 1 ? 8 : 0;
            const tx = x + offsetR * Math.cos(offsetAngle);
            const ty = y + offsetR * Math.sin(offsetAngle);
            const colors = PLAYER_COLORS[p.color];
            const isCurrentTurn = p.uid === currentTurnUid;
            return (
              <g key={p.uid}>
                {isCurrentTurn && (
                  <circle cx={tx} cy={ty} r={9}
                    fill="none" stroke="#fbbf24" strokeWidth={1.5} opacity={0.8}>
                    <animate attributeName="r" values="9;12;9" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={tx} cy={ty} r={7}
                  fill={colors.bg}
                  stroke={colors.light}
                  strokeWidth={1.5}
                />
                <text x={tx} y={ty}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={7} fontWeight="900">
                  {p.name.charAt(0).toUpperCase()}
                </text>
              </g>
            );
          })
        )}
      </svg>

      {/* ── Center field ── */}
      <div style={{
        position: 'absolute',
        left: CX - 76, top: CY - 76,
        width: 152, height: 152,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #1a5c2a 60%, #0d3d1a)',
        border: '2px solid rgba(255,255,255,0.12)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 4,
        overflow: 'hidden',
      }}>
        {/* Field lines */}
        <svg width={130} height={120} style={{ position: 'absolute' }}>
          {/* Outer boundary */}
          <rect x={8} y={8} width={114} height={104} rx={4}
            fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
          {/* Center circle */}
          <circle cx={65} cy={60} r={24}
            fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
          {/* Center line */}
          <line x1={8} y1={60} x2={122} y2={60}
            stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
          {/* Penalty areas */}
          <rect x={38} y={8} width={54} height={22} rx={2}
            fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.8} />
          <rect x={38} y={90} width={54} height={22} rx={2}
            fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.8} />
          {/* Center dot */}
          <circle cx={65} cy={60} r={2.5} fill="rgba(255,255,255,0.4)" />
        </svg>

        {/* Logo text */}
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 12,
          letterSpacing: '0.08em', color: 'rgba(255,255,255,0.9)',
          textAlign: 'center', zIndex: 1, lineHeight: 1.2,
          textShadow: '0 1px 6px rgba(0,0,0,0.6)',
        }}>
          LENDAS<br />DA BOLA
        </div>
        <div style={{ fontSize: 16, zIndex: 1 }}>⚽</div>
      </div>
    </div>
  );
}
