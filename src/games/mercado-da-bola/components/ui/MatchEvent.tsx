import React from 'react';
import { Trophy, Shield, XCircle, Swords, Target } from 'lucide-react';
import { cn } from '../../../../lib/utils';

type EventType = 'goal' | 'defense' | 'blocked' | 'opponent_goal' | 'attack' | 'info';

interface MatchEventProps {
  type: EventType;
  text: string;
  delay?: number;
  className?: string;
}

const EVENT_CONFIG: Record<EventType, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  goal:          { icon: Trophy,  color: 'text-emerald-400', bg: 'bg-emerald-600/20 border-emerald-600/30' },
  defense:       { icon: Shield,  color: 'text-blue-400',    bg: 'bg-blue-600/20 border-blue-600/30' },
  blocked:       { icon: Shield,  color: 'text-amber-400',   bg: 'bg-amber-500/20 border-amber-500/30' },
  opponent_goal: { icon: XCircle, color: 'text-red-400',     bg: 'bg-red-600/20 border-red-600/30' },
  attack:        { icon: Target,  color: 'text-purple-400',  bg: 'bg-purple-600/20 border-purple-600/30' },
  info:          { icon: Swords,  color: 'text-slate-400',   bg: 'bg-slate-700/50 border-slate-700' },
};

export default function MatchEvent({ type, text, delay = 0, className }: MatchEventProps) {
  const config = EVENT_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 animate-event-in',
        config.bg,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn('mt-0.5 shrink-0', config.color)}>
        <Icon size={14} />
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

export type { EventType };
