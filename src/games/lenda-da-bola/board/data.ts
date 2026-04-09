import type { BoardSpace } from './types';

// ─── 36-space circular board ──────────────────────────────────────────────────
// Layout inspired by the physical Mercado da Bola board.
// Colors follow the game's design language.

export const BOARD_SPACES: BoardSpace[] = [
  // ── Quadrant 1 (0–8) ──
  { id:  0, type: 'start',     label: 'INÍCIO',       color: '#16a34a', emoji: '🏟️'          },
  { id:  1, type: 'match-day', label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'           },
  { id:  2, type: 'transfer',  label: 'MERCADO',       color: '#2563eb', emoji: '🔄'          },
  { id:  3, type: 'bonus',     label: '+200 NIG',      color: '#15803d', emoji: '💰', value: 200 },
  { id:  4, type: 'match-day', label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'           },
  { id:  5, type: 'sponsor',   label: 'PATROCÍNIO',   color: '#b45309', emoji: '🏆'           },
  { id:  6, type: 'rest',      label: 'DESCANSO',     color: '#475569', emoji: '😴'           },
  { id:  7, type: 'match-day', label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'           },
  { id:  8, type: 'legend',    label: 'LENDA',        color: '#92400e', emoji: '⭐'           },

  // ── Quadrant 2 (9–17) ──
  { id:  9, type: 'challenge',   label: 'DESAFIO',      color: '#7c3aed', emoji: '⚡'         },
  { id: 10, type: 'transfer',    label: 'MERCADO',      color: '#2563eb', emoji: '🔄'         },
  { id: 11, type: 'match-day',   label: 'DIA DE JOGO', color: '#ea580c', emoji: '⚽'          },
  { id: 12, type: 'bonus',       label: '+300 NIG',    color: '#15803d', emoji: '💰', value: 300 },
  { id: 13, type: 'sponsor',     label: 'PATROCÍNIO',  color: '#b45309', emoji: '🏆'          },
  { id: 14, type: 'match-day',   label: 'DIA DE JOGO', color: '#ea580c', emoji: '⚽'          },
  { id: 15, type: 'extra-turn',  label: 'TURNO EXTRA', color: '#0891b2', emoji: '🎲'          },
  { id: 16, type: 'match-day',   label: 'DIA DE JOGO', color: '#ea580c', emoji: '⚽'          },
  { id: 17, type: 'penalty',     label: '-200 NIG',    color: '#b91c1c', emoji: '📉', value: 200 },

  // ── Quadrant 3 (18–26) ──
  { id: 18, type: 'transfer',  label: 'MERCADO',       color: '#2563eb', emoji: '🔄'          },
  { id: 19, type: 'match-day', label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'           },
  { id: 20, type: 'legend',    label: 'LENDA',        color: '#92400e', emoji: '⭐'           },
  { id: 21, type: 'challenge', label: 'DESAFIO',      color: '#7c3aed', emoji: '⚡'           },
  { id: 22, type: 'sponsor',   label: 'PATROCÍNIO',   color: '#b45309', emoji: '🏆'           },
  { id: 23, type: 'rest',      label: 'DESCANSO',     color: '#475569', emoji: '😴'           },
  { id: 24, type: 'match-day', label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'           },
  { id: 25, type: 'bonus',     label: '+500 NIG',     color: '#15803d', emoji: '💰', value: 500 },
  { id: 26, type: 'match-day', label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'           },

  // ── Quadrant 4 (27–35) ──
  { id: 27, type: 'transfer',   label: 'MERCADO',       color: '#2563eb', emoji: '🔄'         },
  { id: 28, type: 'penalty',    label: '-300 NIG',     color: '#b91c1c', emoji: '📉', value: 300 },
  { id: 29, type: 'match-day',  label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'          },
  { id: 30, type: 'legend',     label: 'LENDA',        color: '#92400e', emoji: '⭐'          },
  { id: 31, type: 'sponsor',    label: 'PATROCÍNIO',   color: '#b45309', emoji: '🏆'          },
  { id: 32, type: 'match-day',  label: 'DIA DE JOGO',  color: '#ea580c', emoji: '⚽'          },
  { id: 33, type: 'extra-turn', label: 'TURNO EXTRA',  color: '#0891b2', emoji: '🎲'          },
  { id: 34, type: 'challenge',  label: 'DESAFIO',      color: '#7c3aed', emoji: '⚡'          },
  { id: 35, type: 'transfer',   label: 'MERCADO',       color: '#2563eb', emoji: '🔄'         },
];

export const TOTAL_SPACES = BOARD_SPACES.length; // 36

// Passing start earns this bonus
export const PASS_GO_BONUS = 200;

// Defense token table (Mercado da Bola rule)
// Stars represent combined team strength (1-55)
export const DEFENSE_TABLE: { min: number; max: number; tokens: number }[] = [
  { min:  1, max: 10, tokens: 10 },
  { min: 11, max: 20, tokens: 30 },
  { min: 21, max: 30, tokens: 40 },
  { min: 31, max: 44, tokens: 49 },
  { min: 45, max: 99, tokens: 55 },
];

export const TRANSFER_UPGRADES = [
  { id: 'attack',  label: 'Ataque +2',          cost: 300, emoji: '⚔️'  },
  { id: 'defense', label: 'Defesa +5 fichas',   cost: 300, emoji: '🛡️' },
] as const;

export type UpgradeId = typeof TRANSFER_UPGRADES[number]['id'];
