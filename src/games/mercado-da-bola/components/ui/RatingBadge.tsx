import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface RatingBadgeProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

export default function RatingBadge({ rating, max = 5, size = 12, className }: RatingBadgeProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-600'}
        />
      ))}
    </div>
  );
}
