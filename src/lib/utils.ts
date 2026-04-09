import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number): string {
  return n.toLocaleString('pt-BR');
}

export function fmtMoney(n: number): string {
  return `$${fmt(n)}k`;
}
