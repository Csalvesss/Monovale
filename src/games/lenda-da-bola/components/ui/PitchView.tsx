import React from 'react';
import type { Player } from '../../types/game';

// 4-3-3 formation positions (x%, y% from top-left of pitch)
const FORMATION_433: { slot: number; x: number; y: number; label: string }[] = [
  { slot: 0,  x: 50, y: 85, label: 'GK' },
  { slot: 1,  x: 20, y: 65, label: 'LB' },
  { slot: 2,  x: 40, y: 70, label: 'CB' },
  { slot: 3,  x: 60, y: 70, label: 'CB' },
  { slot: 4,  x: 80, y: 65, label: 'RB' },
  { slot: 5,  x: 30, y: 45, label: 'CM' },
  { slot: 6,  x: 50, y: 50, label: 'CM' },
  { slot: 7,  x: 70, y: 45, label: 'CM' },
  { slot: 8,  x: 20, y: 25, label: 'LW' },
  { slot: 9,  x: 50, y: 20, label: 'ST' },
  { slot: 10, x: 80, y: 25, label: 'RW' },
];

interface Props {
  lineupIds: string[];
  players: Record<string, Player>;
  selectedId?: string | null;
  onPlayerClick?: (id: string) => void;
}

function PlayerDot({ player, x, y, label, selected, onClick }: {
  player: Player | undefined;
  x: number; y: number; label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const isLegendary = player?.rarity === 'legendary';
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
        gap: 3,
        cursor: onClick ? 'pointer' : 'default',
        zIndex: 2,
      }}
    >
      {/* Circle avatar */}
      <div style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        border: selected
          ? '2px solid var(--wc-gold)'
          : isLegendary
          ? '2px solid var(--wc-gold)'
          : '2px solid rgba(255,255,255,0.3)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        boxShadow: selected
          ? '0 0 12px rgba(251,191,36,0.6)'
          : isLegendary
          ? '0 0 8px rgba(251,191,36,0.4)'
          : '0 2px 8px rgba(0,0,0,0.5)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        flexShrink: 0,
      }}>
        {player ? (
          <img
            src={player.photo}
            alt={player.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.name}&background=1e293b&color=fbbf24`; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 10, fontWeight: 700,
          }}>
            {label}
          </div>
        )}
      </div>

      {/* Name tag */}
      <div style={{
        background: player ? (isLegendary ? 'var(--wc-gold)' : 'rgba(0,0,0,0.8)') : 'rgba(0,0,0,0.5)',
        color: player ? (isLegendary ? '#000' : 'var(--text-primary)') : 'var(--text-muted)',
        fontSize: 9,
        fontWeight: 700,
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.05em',
        padding: '2px 6px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
        maxWidth: 64,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>
        {player ? player.name.split(' ').pop() : label}
      </div>
    </div>
  );
}

export default function PitchView({ lineupIds, players, selectedId, onPlayerClick }: Props) {
  return (
    <div
      className="lenda-pitch"
      style={{ width: '100%', paddingBottom: '140%', position: 'relative' }}
    >
      {/* Pitch content wrapper */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* SVG pitch markings */}
        <svg
          viewBox="0 0 100 140"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          {/* Outer border */}
          <rect x="2" y="2" width="96" height="136" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
          {/* Center line */}
          <line x1="2" y1="70" x2="98" y2="70" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
          {/* Center circle */}
          <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
          <circle cx="50" cy="70" r="0.8" fill="rgba(255,255,255,0.3)" />
          {/* Top penalty box */}
          <rect x="22" y="2" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <rect x="36" y="2" width="28" height="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Bottom penalty box */}
          <rect x="22" y="116" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <rect x="36" y="128" width="28" height="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Corners */}
          <path d="M2,6 Q2,2 6,2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <path d="M94,2 Q98,2 98,6" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <path d="M2,134 Q2,138 6,138" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <path d="M94,138 Q98,138 98,134" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Stripe pattern */}
          {[14, 28, 42, 56, 70, 84, 98, 112, 126].map(y => (
            <rect key={y} x="2" y={y} width="96" height="14" fill="rgba(0,0,0,0.04)" />
          ))}
        </svg>

        {/* Player dots */}
        {FORMATION_433.map((pos) => {
          const pid = lineupIds[pos.slot];
          const player = pid ? players[pid] : undefined;
          return (
            <PlayerDot
              key={pos.slot}
              player={player}
              x={pos.x}
              y={pos.y}
              label={pos.label}
              selected={pid === selectedId}
              onClick={pid && onPlayerClick ? () => onPlayerClick(pid) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
