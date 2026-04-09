import React from 'react';
import type { Player } from '../../types';
import { cn } from '../../../../lib/utils';
import { Badge } from '../../../../components/ui/badge';
import RatingBadge from './RatingBadge';
import { Flame, Smile, Frown, Meh, AlertTriangle } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const POSITION_COLORS: Record<string, string> = {
  GK:  '#f59e0b',
  CB: '#3b82f6', LB: '#3b82f6', RB: '#3b82f6',
  CDM: '#10b981', CM: '#10b981', CAM: '#8b5cf6',
  LW:  '#ef4444', RW: '#ef4444', ST: '#ef4444', CF: '#ef4444',
};

export const POSITION_VARIANT: Record<string, 'gk' | 'def' | 'mid' | 'atk'> = {
  GK: 'gk',
  CB: 'def', LB: 'def', RB: 'def',
  CDM: 'mid', CM: 'mid', CAM: 'mid',
  LW: 'atk', RW: 'atk', ST: 'atk', CF: 'atk',
};

function MoodIcon({ mood }: { mood: string }) {
  const props = { size: 12, strokeWidth: 1.5 };
  if (mood === 'motivated') return <Flame {...props} style={{ color: 'var(--ldb-pitch-bright)' }} />;
  if (mood === 'happy')     return <Smile {...props} className="text-sky-400" />;
  if (mood === 'unhappy')   return <Frown {...props} className="text-red-400" />;
  return <Meh {...props} style={{ color: 'var(--ldb-text-gold)' }} />;
}

function MoodBadge({ mood }: { mood: string }) {
  const labels: Record<string, string> = {
    motivated: 'Motivado', happy: 'Feliz', neutral: 'Neutro', unhappy: 'Insatisfeito',
  };
  const variants: Record<string, 'success' | 'default' | 'warning' | 'destructive'> = {
    motivated: 'success', happy: 'default', neutral: 'warning', unhappy: 'destructive',
  };
  return (
    <Badge variant={variants[mood] ?? 'secondary'} className="gap-1">
      <MoodIcon mood={mood} />
      {labels[mood] ?? mood}
    </Badge>
  );
}

function getPlayerInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Props ────────────────────────────────────────────────────────────────────

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

// ─── Compact row ─────────────────────────────────────────────────────────────

function CompactRow({ player, onClick, selected, showPrice, price, actionLabel, onAction, actionDisabled }: Props) {
  const posColor = POSITION_COLORS[player.position] ?? '#94a3b8';
  const posVariant = POSITION_VARIANT[player.position] ?? 'secondary';
  const initials = getPlayerInitials(player.name);
  const isLegendary = player.rarity === 'legendary';

  return (
    <div
      onClick={onClick}
      className={cn(
        'ldb-player-row',
        isLegendary && 'ldb-player-row--legendary',
        selected && 'outline outline-2 outline-[var(--ldb-pitch-bright)]',
      )}
    >
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black"
        style={{ background: posColor + '22', border: `1.5px solid ${posColor}55`, color: posColor }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate text-[13px] font-bold" style={{ color: 'var(--ldb-text)' }}>
            {isLegendary && <span style={{ color: 'var(--ldb-text-gold)' }} className="mr-1">★</span>}
            {player.name}
          </span>
          {player.injured && <AlertTriangle size={11} strokeWidth={1.5} className="text-red-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={posVariant} className="text-[9px] px-1.5 py-0">{player.position}</Badge>
          <RatingBadge rating={player.stars} size={10} />
          <MoodIcon mood={player.mood} />
        </div>
      </div>

      {/* Price */}
      {showPrice && price !== undefined && (
        <span className="shrink-0 text-sm font-bold ldb-money">
          ${new Intl.NumberFormat('pt-BR').format(price)}k
        </span>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <button
          onClick={e => { e.stopPropagation(); onAction(); }}
          disabled={actionDisabled}
          className={cn(
            'shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
            actionDisabled
              ? 'cursor-not-allowed'
              : 'ldb-btn-primary'
          )}
          style={actionDisabled ? { background: 'rgba(255,255,255,0.06)', color: 'var(--ldb-text-muted)' } : {}}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Full card ────────────────────────────────────────────────────────────────

function FullCard({ player, onClick, selected, showPrice, price, actionLabel, onAction, actionDisabled }: Props) {
  const posColor = POSITION_COLORS[player.position] ?? '#94a3b8';
  const posVariant = POSITION_VARIANT[player.position] ?? 'secondary';
  const initials = getPlayerInitials(player.name);
  const isLegendary = player.rarity === 'legendary';

  const attrs = player.attributes;
  const mainAttrs = player.position === 'GK'
    ? [['GK', attrs.goalkeeping ?? 0], ['DEF', attrs.defending], ['FÍS', attrs.physical]]
    : [['PAS', attrs.passing], ['DRI', attrs.dribbling], ['FIN', attrs.shooting], ['VEL', attrs.pace], ['DEF', attrs.defending]];

  function attrColor(v: number) {
    if (v >= 85) return '#00FF87';
    if (v >= 70) return '#D4AF37';
    return '#4A6070';
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden p-4',
        isLegendary ? 'ldb-card-gold' : 'ldb-card',
        selected && 'outline outline-2 outline-[var(--ldb-pitch-bright)]',
      )}
    >
      {isLegendary && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.12), transparent 70%)' }}
        />
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black"
          style={{
            background: isLegendary
              ? 'linear-gradient(135deg, var(--ldb-gold-mid), var(--ldb-gold-deep))'
              : posColor + '22',
            border: `2px solid ${isLegendary ? 'var(--ldb-gold-mid)' : posColor + '55'}`,
            color: isLegendary ? 'var(--ldb-void)' : posColor,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-black" style={{ color: 'var(--ldb-text)' }}>{player.name}</span>
            {isLegendary && <Badge variant="legendary">LENDÁRIO</Badge>}
            {player.injured && <AlertTriangle size={13} strokeWidth={1.5} className="text-red-400" />}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ldb-text-muted)' }}>{player.fullName}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant={posVariant}>{player.position}</Badge>
            <RatingBadge rating={player.stars} size={11} />
            <MoodBadge mood={player.mood} />
          </div>
        </div>
      </div>

      {/* Attributes row */}
      <div
        className="flex justify-around py-2.5 my-2"
        style={{ borderTop: '1px solid var(--ldb-border)', borderBottom: '1px solid var(--ldb-border)' }}
      >
        {(mainAttrs as [string, number][]).map(([lbl, val]) => (
          <div key={lbl} className="flex flex-col items-center gap-0.5">
            <span className="text-[13px] font-black" style={{ color: attrColor(val) }}>{val}</span>
            <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: 'var(--ldb-text-muted)' }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs mt-2" style={{ color: 'var(--ldb-text-muted)' }}>
        <span>{player.nationality} · {player.age} anos</span>
        <span>Nv.{player.level} · {player.xp} XP</span>
      </div>

      {/* Price & action */}
      {(showPrice || actionLabel) && (
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: '1px solid var(--ldb-border)' }}
        >
          {showPrice && (
            <div>
              <div className="text-sm font-black ldb-money">
                ${new Intl.NumberFormat('pt-BR').format(price ?? player.marketValue)}k
              </div>
              <div className="text-[10px]" style={{ color: 'var(--ldb-text-muted)' }}>${player.wage}k/sem</div>
            </div>
          )}
          {actionLabel && onAction && (
            <button
              onClick={e => { e.stopPropagation(); onAction(); }}
              disabled={actionDisabled}
              className={cn(
                'rounded-lg px-4 py-2 text-xs font-bold transition-colors',
                actionDisabled ? 'cursor-not-allowed' : 'ldb-btn-primary'
              )}
              style={actionDisabled ? { background: 'rgba(255,255,255,0.06)', color: 'var(--ldb-text-muted)' } : {}}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function PlayerCard(props: Props) {
  return props.compact ? <CompactRow {...props} /> : <FullCard {...props} />;
}

export { MoodBadge, MoodIcon, getPlayerInitials };
