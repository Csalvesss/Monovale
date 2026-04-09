import React from 'react';
import type { BoardPlayer } from './types';
import { PLAYER_COLORS } from './types';
import { BOARD_SPACES } from './data';

// ─── Internal coordinate system (600×600) ────────────────────────────────────
// SVG always uses these coordinates; display size is controlled via width/height + viewBox.

const TOTAL  = BOARD_SPACES.length; // 36
const ISIZE  = 600;                 // internal SVG size
const CX     = 300;
const CY     = 300;
const RING_R = 262;   // radius of space centers
const SW     = 44;    // space width
const SH     = 44;    // space height
const SR     = 7;     // space corner radius

function spacePos(id: number) {
  const angle = (2 * Math.PI * id) / TOTAL - Math.PI / 2;
  return { x: CX + RING_R * Math.cos(angle), y: CY + RING_R * Math.sin(angle) };
}

// Precompute all 36 positions
const POSITIONS = BOARD_SPACES.map((_, id) => spacePos(id));

// ─── CircleBoard ──────────────────────────────────────────────────────────────

interface Props {
  players: BoardPlayer[];
  /** Override positions for animation (uid → position index) */
  animPos?: Record<string, number>;
  currentTurnUid: string;
  highlightSpace?: number;
  /** Display size in px — SVG scales via viewBox */
  size?: number;
}

export default function CircleBoard({
  players,
  animPos = {},
  currentTurnUid,
  highlightSpace,
  size = 380,
}: Props) {
  // Group players (or animated positions) by visual position
  const byPos: Record<number, BoardPlayer[]> = {};
  for (const p of players) {
    const pos = animPos[p.uid] ?? p.position;
    if (!byPos[pos]) byPos[pos] = [];
    byPos[pos].push(p);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${ISIZE} ${ISIZE}`}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* ── Dark ring background ── */}
      <circle cx={CX} cy={CY} r={RING_R + SW / 2 + 10}
        fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.06)" strokeWidth={2} />

      {/* ── Spaces ── */}
      {BOARD_SPACES.map((space, id) => {
        const { x, y } = POSITIONS[id];
        const highlighted = highlightSpace === id;
        return (
          <g key={id}>
            {/* Space box */}
            <rect
              x={x - SW / 2} y={y - SH / 2}
              width={SW} height={SH} rx={SR}
              fill={space.color}
              opacity={highlighted ? 1 : 0.9}
              stroke={highlighted ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
              strokeWidth={highlighted ? 2.5 : 0.8}
            />
            {highlighted && (
              <rect
                x={x - SW / 2 - 3} y={y - SH / 2 - 3}
                width={SW + 6} height={SH + 6} rx={SR + 2}
                fill="none" stroke="#fbbf24" strokeWidth={1.5} opacity={0.5}
              />
            )}
            {/* Space number */}
            <text x={x - SW / 2 + 5} y={y - SH / 2 + 9}
              fontSize={8} fontWeight="800" fill="rgba(255,255,255,0.7)"
              fontFamily="Inter,system-ui,sans-serif"
            >
              {id}
            </text>
            {/* Emoji */}
            <text x={x} y={y + 4}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={20}
            >
              {space.emoji}
            </text>
          </g>
        );
      })}

      {/* ── Center field ── */}
      {/* Outer circle */}
      <circle cx={CX} cy={CY} r={160} fill="url(#fieldGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />
      {/* Field lines */}
      <rect x={CX - 96} y={CY - 88} width={192} height={176} rx={6}
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} />
      <line x1={CX - 96} y1={CY} x2={CX + 96} y2={CY}
        stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} />
      <circle cx={CX} cy={CY} r={40}
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} />
      {/* Goal areas */}
      <rect x={CX - 44} y={CY - 88} width={88} height={26} rx={3}
        fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={0.8} />
      <rect x={CX - 44} y={CY + 62} width={88} height={26} rx={3}
        fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={0.8} />
      {/* Center dot */}
      <circle cx={CX} cy={CY} r={4} fill="rgba(255,255,255,0.5)" />
      {/* Logo */}
      <text x={CX} y={CY - 22}
        textAnchor="middle" fontSize={22} fontWeight="900"
        fontFamily="'Bebas Neue',sans-serif" fill="rgba(255,255,255,0.9)"
        letterSpacing="2">
        LENDAS
      </text>
      <text x={CX} y={CY + 2}
        textAnchor="middle" fontSize={22} fontWeight="900"
        fontFamily="'Bebas Neue',sans-serif" fill="rgba(255,255,255,0.9)"
        letterSpacing="2">
        DA BOLA
      </text>
      <text x={CX} y={CY + 28} textAnchor="middle" fontSize={28}>⚽</text>

      {/* ── Player tokens ── */}
      {Object.entries(byPos).map(([posStr, pList]) => {
        const pos = Number(posStr);
        const { x, y } = POSITIONS[pos];
        return pList.map((p, i) => {
          // Offset overlapping tokens in a small arc
          const off = pList.length > 1 ? 14 : 0;
          const offAngle = (2 * Math.PI * i) / pList.length;
          const tx = x + off * Math.cos(offAngle);
          const ty = y + off * Math.sin(offAngle);
          const colors = PLAYER_COLORS[p.color];
          const isCurrentTurn = p.uid === currentTurnUid;
          return (
            <g key={p.uid}>
              {/* Pulse ring for current player */}
              {isCurrentTurn && (
                <circle cx={tx} cy={ty} r={16} fill="none" stroke="#fbbf24" strokeWidth={2} opacity={0.7}>
                  <animate attributeName="r" values="16;22;16" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="1s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Shadow */}
              <circle cx={tx + 1} cy={ty + 2} r={13} fill="rgba(0,0,0,0.4)" />
              {/* Token body */}
              <circle cx={tx} cy={ty} r={13}
                fill={colors.bg} stroke={colors.light} strokeWidth={2.5} />
              {/* Letter */}
              <text x={tx} y={ty}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={11} fontWeight="900" fill="#fff"
                fontFamily="Inter,system-ui,sans-serif"
              >
                {p.name.charAt(0).toUpperCase()}
              </text>
            </g>
          );
        });
      })}

      {/* ── Gradient def ── */}
      <defs>
        <radialGradient id="fieldGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#1d6b33" />
          <stop offset="55%" stopColor="#155228" />
          <stop offset="100%" stopColor="#0d3a1c" />
        </radialGradient>
      </defs>
    </svg>
  );
}
