import React from 'react';
import { cn } from '../../../../lib/utils';
import { DollarSign } from 'lucide-react';

interface MoneyDisplayProps {
  amount: number;
  showSign?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function MoneyDisplay({ amount, showSign, className, size = 'md', showIcon }: MoneyDisplayProps) {
  const formatted = new Intl.NumberFormat('pt-BR').format(Math.abs(amount));
  const sign = showSign ? (amount >= 0 ? '+' : '-') : '';
  const color = showSign ? (amount >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-amber-400';
  const sizeClass = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl font-black' : 'text-sm font-bold';

  return (
    <span className={cn('inline-flex items-center gap-0.5', sizeClass, color, className)}>
      {showIcon && <DollarSign size={size === 'lg' ? 16 : 12} />}
      {sign}${formatted}k
    </span>
  );
}
