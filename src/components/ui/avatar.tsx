import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, initials, color = '#2563eb', size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl font-bold text-white',
        sizeMap[size],
        className
      )}
      style={{ background: color + '33', border: `2px solid ${color}55`, color }}
      {...props}
    >
      {initials}
    </div>
  )
);
Avatar.displayName = 'Avatar';

export { Avatar };
