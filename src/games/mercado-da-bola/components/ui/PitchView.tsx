import React, { useRef, useEffect, useState } from 'react';
import type { Player } from '../../types';

// ─── Formation layouts ─────────────────────────────────────────────────────────
// Each position: [colPercent, rowPercent] within the pitch

const FORMATION_4_3_3: Record<string, [number, number]> = {
  GK:  [50, 88],
  LB:  [15, 70], CB: [35, 70],
  RB:  [85, 70],
  CDM: [50, 70], // uses the 2nd CB slot
  CM:  [20, 50], CAM: [50, 50], CM2: [80, 50],
  LW:  [15, 25], ST: [50, 20], RW: [85, 25],
};

const POSITIONS_ORDER = ['GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'ST', 'RW', 'CF'];

// Position to grid slot mapping for 4-3-3
function getSlotForPosition(pos: string, slotIndex: number): [number, number] {
  const formations: Record<string, [number, number][]> = {
    GK:  [[50, 88]],
    LB:  [[12, 68]],
    CB:  [[32, 70], [68, 70]],
    RB:  [[88, 68]],
    CDM: [[50, 57]],
    CM:  [[25, 47], [75, 47]],
    CAM: [[50, 38]],
    LW:  [[16, 22]],
    RW:  [[84, 22]],
    ST:  [[50, 18], [35, 18], [65, 18]],
    CF:  [[50, 15], [32, 15], [68, 15]],
  };
  const slots = formations[pos] ?? [[50, 50]];
  return slots[slotIndex % slots.length] ?? [50, 50];
}

// ─── Mood emoji ───────────────────────────────────────────────────────────────

function moodEmoji(mood: string) {
  if (mood === 'motivated') return '😄';
  if (mood === 'happy') return '🙂';
  if (mood === 'neutral') return '😐';
  return '😞';
}

function moodColor(mood: string): string {
  if (mood === 'motivated') return 'var(--ldb-win)';
  if (mood === 'happy') return '#60A5FA';
  if (mood === 'neutral') return 'var(--ldb-text-muted)';
  return 'var(--ldb-loss)';
}

// ─── Player dot ───────────────────────────────────────────────────────────────

interface DotProps {
  player: Player;
  x: number;   // 0-100 percent
  y: number;   // 0-100 percent
  isSelected: boolean;
  onClick: () => void;
  teamColor: string;
}

function PlayerDot({ player, x, y, isSelected, onClick, teamColor }: DotProps) {
  const isLegendary = player.rarity === 'legendary';
  const mc = moodColor(player.mood);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
        zIndex: isSelected ? 10 : 1,
        transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
      title={player.name}
    >
      {/* Dot */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: isLegendary
          ? 'linear-gradient(135deg, #FFD700, #C49A00)'
          : teamColor,
        border: isSelected
          ? '2px solid #fff'
          : isLegendary
            ? '2px solid #FFD700'
            : `2px solid ${mc}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 800,
        color: '#fff',
        boxShadow: isSelected
          ? `0 0 0 2px ${teamColor}, 0 4px 12px rgba(0,0,0,0.5)`
          : isLegendary
            ? '0 0 12px rgba(255,215,0,0.5), 0 2px 8px rgba(0,0,0,0.4)'
            : '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'all 200ms',
        position: 'relative',
        fontFamily: 'var(--ldb-font-display)',
        letterSpacing: '0.02em',
      }}>
        {player.position === 'GK' ? 'GL' : player.stars}
        {/* Mood indicator */}
        <div style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: mc,
          border: '1px solid rgba(0,0,0,0.3)',
        }} />
      </div>

      {/* Name tag */}
      <div style={{
        background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.7)',
        border: isSelected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 4,
        padding: '1px 5px',
        fontSize: 9,
        fontWeight: 700,
        color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
        whiteSpace: 'nowrap',
        maxWidth: 56,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        backdropFilter: 'blur(4px)',
      }}>
        {player.name.split(' ').pop()}
      </div>
    </div>
  );
}

// ─── Pitch field SVG lines ─────────────────────────────────────────────────────

function PitchLines() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Outer border */}
      <rect x="3" y="3" width="94" height="94" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {/* Center line */}
      <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.07)" strokeWidth="0.4" />
      {/* Center circle */}
      <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      {/* Center spot */}
      <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.08)" />
      {/* Top penalty area */}
      <rect x="25" y="3" width="50" height="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      {/* Top goal */}
      <rect x="38" y="3" width="24" height="5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      {/* Bottom penalty area */}
      <rect x="25" y="81" width="50" height="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      {/* Bottom goal */}
      <rect x="38" y="92" width="24" height="5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  squad: Player[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  teamColor: string;
}

export default function PitchView({ squad, selectedId, onSelect, teamColor }: Props) {
  // Group players by position
  const positionGroups: Record<string, Player[]> = {};
  for (const p of squad.slice(0, 11)) {
    if (!positionGroups[p.position]) positionGroups[p.position] = [];
    positionGroups[p.position].push(p);
  }

  // Build dot list with positions
  const dots: { player: Player; x: number; y: number }[] = [];
  for (const [pos, players] of Object.entries(positionGroups)) {
    players.forEach((p, idx) => {
      const [x, y] = getSlotForPosition(pos, idx);
      dots.push({ player: p, x, y });
    });
  }

  return (
    <div className="ldb-pitch-bg" style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '0.75',
      overflow: 'hidden',
      borderRadius: 'var(--ldb-r-lg)',
    }}>
      {/* Field stripes */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(
          180deg,
          transparent,
          transparent 12.5%,
          rgba(0,0,0,0.06) 12.5%,
          rgba(0,0,0,0.06) 25%
        )`,
        pointerEvents: 'none',
      }} />

      <PitchLines />

      {/* Player dots */}
      {dots.map(({ player, x, y }) => (
        <PlayerDot
          key={player.id}
          player={player}
          x={x}
          y={y}
          isSelected={selectedId === player.id}
          onClick={() => onSelect(player.id)}
          teamColor={teamColor}
        />
      ))}

      {/* Empty pitch message */}
      {squad.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.2)',
          fontSize: 13, fontWeight: 600,
        }}>
          Elenco vazio
        </div>
      )}
    </div>
  );
}
