import React from 'react';
import { cn } from '../../../../lib/utils';

interface StatBarProps {
  label: string;
  fullLabel?: string;
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

export default function StatBar({ label, fullLabel, value, max = 99, color = '#3b82f6', className }: StatBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const displayLabel = fullLabel ?? label;

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="w-[60px] shrink-0 text-right text-[11px] font-semibold text-slate-400" title={displayLabel}>
        {displayLabel}
      </div>
      <div className="relative flex-1 h-2 rounded-full overflow-hidden bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div
        className="w-8 shrink-0 text-right text-xs font-bold"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
