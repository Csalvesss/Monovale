import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-blue-600/20 text-blue-400 border border-blue-600/30',
        secondary:   'bg-slate-700 text-slate-300 border border-slate-600',
        destructive: 'bg-red-600/20 text-red-400 border border-red-600/30',
        outline:     'border border-slate-600 text-slate-300',
        success:     'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
        warning:     'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        purple:      'bg-purple-600/20 text-purple-400 border border-purple-600/30',
        // Position-specific
        gk:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        def: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
        mid: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
        atk: 'bg-red-600/20 text-red-400 border border-red-600/30',
        // Result
        win:  'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
        draw: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        loss: 'bg-red-600/20 text-red-400 border border-red-600/30',
        // Legendary
        legendary: 'bg-amber-600 text-white border-0',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
