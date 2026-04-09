import React from 'react';
import type { Player } from '../../types';

interface Props {
  player: Player;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
  showPrice?: boolean;
  price?: number;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

const POSITION_COLORS: Record<string, string> = {
  GK: '#f59e0b', CB: '#3b82f6', LB: '#3b82f6', RB: '#3b82f6',
  CDM: '#10b981', CM: '#10b981', CAM: '#8b5cf6',
  LW: '#ef4444', RW: '#ef4444', ST: '#ef4444', CF: '#ef4444',
};

const MOOD_EMOJI: Record<string, string> = {
  motivated: '🔥', happy: '😊', neutral: '😐', unhappy: '😤',
};

const RARITY_STYLE: Record<string, React.CSSProperties> = {
  normal: { background: '#1e293b', border: '1px solid #334155' },
  legendary: {
    background: 'linear-gradient(135deg, #78350f, #451a03)',
    border: '1px solid #d97706',
    boxShadow: '0 0 12px rgba(217,119,6,0.4)',
  },
};

function Stars({ count }: { count: number }) {
  return (
    <span style={{ fontSize: 10, letterSpacing: 1 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}

function RatingBadge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 8, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

export default function PlayerCard({ player, onClick, selected, compact, showPrice, price, actionLabel, onAction, actionDisabled }: Props) {
  const posColor = POSITION_COLORS[player.position] ?? '#94a3b8';
  const cardStyle = RARITY_STYLE[player.rarity];
  const moodEmoji = MOOD_EMOJI[player.mood] ?? '😐';

  if (compact) {
    return (
      <div
        onClick={onClick}
        style={{
          ...cardStyle,
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: onClick ? 'pointer' : 'default',
          outline: selected ? '2px solid #3b82f6' : undefined,
          transition: 'all 0.1s',
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 8, background: posColor + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: posColor }}>{player.position}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {player.rarity === 'legendary' && '⭐ '}{player.name}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#fbbf24' }}><Stars count={player.stars} /></span>
            <span>{player.flag} {player.nationality}</span>
            <span>{moodEmoji}</span>
            {player.injured && <span>🚑</span>}
          </div>
        </div>
        {showPrice && price !== undefined && (
          <div style={{ fontSize: 12, fontWeight: 800, color: '#fde68a', flexShrink: 0 }}>
            ${price.toLocaleString('pt-BR')}k
          </div>
        )}
      </div>
    );
  }

  const attrs = player.attributes;
  const mainAttrs = player.position === 'GK'
    ? [['GK', attrs.goalkeeping ?? 0], ['DEF', attrs.defending], ['FÍS', attrs.physical]]
    : [['PAS', attrs.passing], ['DRI', attrs.dribbling], ['FIN', attrs.shooting], ['VEL', attrs.pace], ['DEF', attrs.defending]];

  return (
    <div
      onClick={onClick}
      style={{
        ...cardStyle,
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: onClick ? 'pointer' : 'default',
        outline: selected ? '2px solid #3b82f6' : undefined,
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Legendary glow */}
      {player.rarity === 'legendary' && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.2), transparent 70%)', pointerEvents: 'none' }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: player.rarity === 'legendary' ? 'linear-gradient(135deg, #d97706, #92400e)' : posColor + '33',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, border: player.rarity === 'legendary' ? '1.5px solid #d97706' : 'none',
        }}>
          {player.rarity === 'legendary' ? '⭐' : player.flag}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>{player.name}</span>
            {player.rarity === 'legendary' && (
              <span style={{ fontSize: 9, fontWeight: 800, background: '#d97706', color: '#fff', padding: '1px 6px', borderRadius: 99 }}>LENDÁRIO</span>
            )}
            {player.injured && <span style={{ fontSize: 10 }}>🚑</span>}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{player.fullName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, background: posColor + '33', color: posColor,
              padding: '2px 6px', borderRadius: 6,
            }}>{player.position}</span>
            <span style={{ color: '#fbbf24', fontSize: 10 }}><Stars count={player.stars} /></span>
            <span style={{ fontSize: 11 }}>{moodEmoji}</span>
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155' }}>
        {(mainAttrs as [string, number][]).map(([lbl, val]) => (
          <RatingBadge key={lbl} value={val} label={lbl} color={val >= 85 ? '#4ade80' : val >= 70 ? '#facc15' : '#94a3b8'} />
        ))}
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
        <span>{player.flag} {player.nationality} · {player.age} anos</span>
        <span>Nv.{player.level} · XP {player.xp}</span>
      </div>

      {/* Price & action */}
      {(showPrice || actionLabel) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          {showPrice && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fde68a' }}>${price?.toLocaleString('pt-BR') ?? player.marketValue.toLocaleString('pt-BR')}k</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>${player.wage}k/sem</div>
            </div>
          )}
          {actionLabel && onAction && (
            <button
              onClick={e => { e.stopPropagation(); onAction(); }}
              disabled={actionDisabled}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: actionDisabled ? '#374151' : '#2563eb',
                color: actionDisabled ? '#6b7280' : '#fff',
                fontWeight: 700, fontSize: 12, cursor: actionDisabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
