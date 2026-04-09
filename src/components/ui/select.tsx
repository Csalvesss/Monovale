import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => (
    <div className="relative w-full">
      {label && <div className="mb-1 text-xs font-semibold text-slate-400">{label}</div>}
      <select
        ref={ref}
        className={cn(
          'h-10 w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 pl-3 pr-8 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
);
Select.displayName = 'Select';

export { Select };
