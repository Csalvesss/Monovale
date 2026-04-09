import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value = 0, onValueChange, label, minLabel, maxLabel, ...props }, ref) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        {label && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{label}</span>
            <span className="text-sm font-bold text-amber-400">${value}k</span>
          </div>
        )}
        <div className="relative h-2 w-full">
          <div className="absolute inset-0 rounded-full bg-slate-700" />
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onValueChange?.(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-blue-500 bg-slate-900 shadow-md transition-all"
            style={{ left: `${pct}%` }}
          />
        </div>
        {(minLabel || maxLabel) && (
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
