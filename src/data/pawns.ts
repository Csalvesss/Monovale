import type { Pawn } from '../types';

export const PAWNS: Pawn[] = [
  { id: 'car',        emoji: '🚗', name: 'Carro Vermelho',  color: '#ef4444', bgColor: '#fef2f2' },
  { id: 'taxi',       emoji: '🚕', name: 'Táxi Amarelo',    color: '#eab308', bgColor: '#fefce8' },
  { id: 'moto',       emoji: '🛵', name: 'Moto Verde',      color: '#22c55e', bgColor: '#f0fdf4' },
  { id: 'bus',        emoji: '🚌', name: 'Ônibus Azul',     color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'bike',       emoji: '🚲', name: 'Bicicleta Lilás', color: '#a855f7', bgColor: '#faf5ff' },
  { id: 'rickshaw',   emoji: '🛺', name: 'Riquixá Laranja', color: '#f97316', bgColor: '#fff7ed' },
  { id: 'boat',       emoji: '⛵', name: 'Barco Ciano',     color: '#06b6d4', bgColor: '#ecfeff' },
  { id: 'helicopter', emoji: '🚁', name: 'Helicóptero Rosa',color: '#ec4899', bgColor: '#fdf2f8' },
];

export const getPawn = (id: string): Pawn =>
  PAWNS.find(p => p.id === id) ?? PAWNS[0];
