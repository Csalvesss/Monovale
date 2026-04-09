import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:     'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/25',
        outline:     'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800',
        secondary:   'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
        ghost:       'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
        link:        'text-blue-400 underline-offset-4 hover:underline p-0 h-auto',
        success:     'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25',
        warning:     'bg-amber-500 text-white hover:bg-amber-400 shadow-lg shadow-amber-500/25',
        gold:        'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25',
      },
      size: {
        sm:   'h-8  px-3 text-xs',
        md:   'h-10 px-4 text-sm',
        lg:   'h-12 px-6 text-base',
        xl:   'h-14 px-8 text-lg',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
