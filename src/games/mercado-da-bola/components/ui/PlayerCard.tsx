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
  const props = { size: 12 };
  if (mood === 'motivated') return <Flame {...props} className="text-emerald-400" />;
  if (mood === 'happy')     return <Smile {...props} className="text-sky-400" />;
  if (mood === 'unhappy')   return <Frown {...props} className="text-red-400" />;
  return <Meh {...props} className="text-amber-400" />;
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
        'flex items-center gap-3 rounded-xl border p-3 transition-all duration-150',
        isLegendary
          ? 'border-amber-600/50 bg-gradient-to-r from-amber-950/50 to-slate-800'
          : 'border-slate-700 bg-slate-800 hover:bg-slate-750',
        onClick && 'cursor-pointer hover:border-slate-600',
        selected && 'outline outline-2 outline-blue-500',
      )}
    >
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black"
        style={{ background: posColor + '22', border: `1.5px solid ${posColor}44`, color: posColor }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate text-[13px] font-bold text-slate-100">
            {isLegendary && <span className="text-amber-400 mr-1">★</span>}
            {player.name}
          </span>
          {player.injured && <AlertTriangle size={11} className="text-red-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={posVariant} className="text-[9px] px-1.5 py-0">{player.position}</Badge>
          <RatingBadge rating={player.stars} size={10} />
          <MoodIcon mood={player.mood} />
        </div>
      </div>

      {/* Price */}
      {showPrice && price !== undefined && (
        <span className="shrink-0 text-sm font-bold text-emerald-400">
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
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          )}
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
    if (v >= 85) return '#4ade80';
    if (v >= 70) return '#fbbf24';
    return '#94a3b8';
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 transition-all duration-150',
        isLegendary
          ? 'border-amber-600/50 bg-gradient-to-br from-amber-950/60 to-slate-800'
          : 'border-slate-700 bg-slate-800',
        onClick && 'cursor-pointer hover:border-slate-600',
        selected && 'outline outline-2 outline-blue-500',
      )}
    >
      {isLegendary && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black"
          style={{
            background: isLegendary ? 'linear-gradient(135deg, #d97706, #92400e)' : posColor + '22',
            border: `2px solid ${isLegendary ? '#d97706' : posColor + '44'}`,
            color: isLegendary ? '#fff' : posColor,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-black text-slate-100">{player.name}</span>
            {isLegendary && <Badge variant="legendary">LENDÁRIO</Badge>}
            {player.injured && <AlertTriangle size={13} className="text-red-400" />}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{player.fullName}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant={posVariant}>{player.position}</Badge>
            <RatingBadge rating={player.stars} size={11} />
            <MoodBadge mood={player.mood} />
          </div>
        </div>
      </div>

      {/* Attributes row */}
      <div className="flex justify-around border-t border-b border-slate-700 py-2.5 my-2">
        {(mainAttrs as [string, number][]).map(([lbl, val]) => (
          <div key={lbl} className="flex flex-col items-center gap-0.5">
            <span className="text-[13px] font-black" style={{ color: attrColor(val) }}>{val}</span>
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{lbl}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
        <span>{player.nationality} · {player.age} anos</span>
        <span>Nv.{player.level} · {player.xp} XP</span>
      </div>

      {/* Price & action */}
      {(showPrice || actionLabel) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
          {showPrice && (
            <div>
              <div className="text-sm font-black text-amber-400">
                ${new Intl.NumberFormat('pt-BR').format(price ?? player.marketValue)}k
              </div>
              <div className="text-[10px] text-slate-500">${player.wage}k/sem</div>
            </div>
          )}
          {actionLabel && onAction && (
            <button
              onClick={e => { e.stopPropagation(); onAction(); }}
              disabled={actionDisabled}
              className={cn(
                'rounded-lg px-4 py-2 text-xs font-bold transition-colors',
                actionDisabled
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              )}
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
