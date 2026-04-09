import type { BoardSpace, PropertyGroup } from '../types';

// Group colors for display
export const GROUP_COLORS: Record<PropertyGroup, string> = {
  purple:    '#7c3aed',
  lightblue: '#0ea5e9',
  pink:      '#ec4899',
  orange:    '#f97316',
  red:       '#ef4444',
  yellow:    '#eab308',
  green:     '#22c55e',
  darkblue:  '#1d4ed8',
  railroad:  '#374151',
  utility:   '#059669',
};

export const GROUP_NAMES: Record<PropertyGroup, string> = {
  purple:    'Roxo',
  lightblue: 'Azul Claro',
  pink:      'Rosa',
  orange:    'Laranja',
  red:       'Vermelho',
  yellow:    'Amarelo',
  green:     'Verde',
  darkblue:  'Azul Escuro',
  railroad:  'Estação',
  utility:   'Empresa',
};

// Board positions for each group
export const GROUP_POSITIONS: Record<PropertyGroup, number[]> = {
  purple:    [1, 3],
  lightblue: [6, 8, 9],
  pink:      [11, 13, 14],
  orange:    [16, 18, 19],
  red:       [21, 23, 24],
  yellow:    [26, 27, 29],
  green:     [31, 32, 34],
  darkblue:  [37, 39],
  railroad:  [5, 15, 25, 35],
  utility:   [12, 28],
};

// 40 board spaces — indexed by position 0-39
export const BOARD_SPACES: BoardSpace[] = [
  // ── CORNER: GO ──────────────────────────────────────────────────────────────
  {
    position: 0,
    name: 'Pedágio da Dutra',
    type: 'go',
    icon: '🛣️',
  },

  // ── BOTTOM ROW (positions 1-9) ───────────────────────────────────────────
  {
    position: 1,
    name: 'Guaratinguetá',
    type: 'property',
    group: 'purple',
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    housePrice: 50,
    icon: '⛪',  // Basílica Santo Antônio / P. Donizetti
  },
  {
    position: 2,
    name: 'Voz do Vale',
    type: 'community_chest',
    icon: '📬',
  },
  {
    position: 3,
    name: 'Lorena',
    type: 'property',
    group: 'purple',
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    housePrice: 50,
    icon: '🎓',  // Faenac / UNISAL — cidade universitária
  },
  {
    position: 4,
    name: 'Imposto de Renda',
    type: 'income_tax',
    taxAmount: 200,
    icon: '💸',
  },
  {
    position: 5,
    name: 'Est. Guaratinguetá',
    type: 'railroad',
    group: 'railroad',
    price: 200,
    icon: '🚂',
  },
  {
    position: 6,
    name: 'Pindamonhangaba',
    type: 'property',
    group: 'lightblue',
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    housePrice: 50,
    icon: '🌾',  // Agropecuária / polo agroindustrial
  },
  {
    position: 7,
    name: 'Bilhete da Fortuna',
    type: 'chance',
    icon: '🎟️',
  },
  {
    position: 8,
    name: 'Tremembé',
    type: 'property',
    group: 'lightblue',
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    housePrice: 50,
    icon: '🌿',  // Cidade verde, área rural
  },
  {
    position: 9,
    name: 'Cachoeira Paulista',
    type: 'property',
    group: 'lightblue',
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    housePrice: 50,
    icon: '🕊️',  // Canção Nova — comunidade religiosa
  },

  // ── CORNER: JAIL ────────────────────────────────────────────────────────────
  {
    position: 10,
    name: 'Preso no DETRAN',
    type: 'jail',
    icon: '🚔',
  },

  // ── LEFT COLUMN (positions 11-19) ────────────────────────────────────────
  {
    position: 11,
    name: 'Aparecida',
    type: 'property',
    group: 'pink',
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    housePrice: 100,
    icon: '🙏',  // Basílica de Nossa Senhora Aparecida
  },
  {
    position: 12,
    name: 'EDP',
    type: 'utility',
    group: 'utility',
    price: 150,
    icon: '⚡',  // Energia elétrica — EDP
  },
  {
    position: 13,
    name: 'Potim',
    type: 'property',
    group: 'pink',
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    housePrice: 100,
    icon: '🏘️',  // Bairro / distrito próximo a Aparecida
  },
  {
    position: 14,
    name: 'Cunha',
    type: 'property',
    group: 'pink',
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    housePrice: 100,
    icon: '🏺',  // Cerâmica artesanal — polo de artes
  },
  {
    position: 15,
    name: 'Est. Taubaté',
    type: 'railroad',
    group: 'railroad',
    price: 200,
    icon: '🚂',
  },
  {
    position: 16,
    name: 'Cruzeiro',
    type: 'property',
    group: 'orange',
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    housePrice: 100,
    icon: '⚙️',  // Polo industrial metalúrgico
  },
  {
    position: 17,
    name: 'Voz do Vale',
    type: 'community_chest',
    icon: '📬',
  },
  {
    position: 18,
    name: 'Lavrinhas',
    type: 'property',
    group: 'orange',
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    housePrice: 100,
    icon: '☕',  // Lavoura de café — interior paulista
  },
  {
    position: 19,
    name: 'Queluz',
    type: 'property',
    group: 'orange',
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    housePrice: 100,
    icon: '🏰',  // Centro histórico colonial
  },

  // ── CORNER: FREE PARKING ─────────────────────────────────────────────────
  {
    position: 20,
    name: 'Mirante do Vale',
    type: 'free_parking',
    icon: '🏔️',
  },

  // ── TOP ROW (positions 21-29) ────────────────────────────────────────────
  {
    position: 21,
    name: 'Resende',
    type: 'property',
    group: 'red',
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    housePrice: 150,
    icon: '🎖️',  // AMAN — Academia Militar das Agulhas Negras
  },
  {
    position: 22,
    name: 'Bilhete da Fortuna',
    type: 'chance',
    icon: '🎟️',
  },
  {
    position: 23,
    name: 'Itatiaia',
    type: 'property',
    group: 'red',
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    housePrice: 150,
    icon: '🏔️',  // Parque Nacional do Itatiaia
  },
  {
    position: 24,
    name: 'Porto Real',
    type: 'property',
    group: 'red',
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    housePrice: 150,
    icon: '🏭',  // Fábrica Peugeot / polo industrial
  },
  {
    position: 25,
    name: 'Est. S.J. dos Campos',
    type: 'railroad',
    group: 'railroad',
    price: 200,
    icon: '🚂',
  },
  {
    position: 26,
    name: 'Barra Mansa',
    type: 'property',
    group: 'yellow',
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    housePrice: 150,
    icon: '🔩',  // Siderurgia / metalurgia
  },
  {
    position: 27,
    name: 'Volta Redonda',
    type: 'property',
    group: 'yellow',
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    housePrice: 150,
    icon: '🏗️',  // CSN — Companhia Siderúrgica Nacional
  },
  {
    position: 28,
    name: 'Sabesp',
    type: 'utility',
    group: 'utility',
    price: 150,
    icon: '💧',  // Água — Sabesp
  },
  {
    position: 29,
    name: 'Pinheiral',
    type: 'property',
    group: 'yellow',
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    housePrice: 150,
    icon: '🌲',  // Pinheiros / natureza
  },

  // ── CORNER: GO TO JAIL ───────────────────────────────────────────────────
  {
    position: 30,
    name: 'Multa na Via Dutra',
    type: 'go_to_jail',
    icon: '🚨',
  },

  // ── RIGHT COLUMN (positions 31-39) ───────────────────────────────────────
  {
    position: 31,
    name: 'Jacareí',
    type: 'property',
    group: 'green',
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    housePrice: 200,
    icon: '🦎',  // Nome vem do tupi "lugar de jacarés"
  },
  {
    position: 32,
    name: 'Caçapava',
    type: 'property',
    group: 'green',
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    housePrice: 200,
    icon: '✈️',  // Base Aérea de Caçapava — FAB
  },
  {
    position: 33,
    name: 'Bilhete da Fortuna',
    type: 'chance',
    icon: '🎟️',
  },
  {
    position: 34,
    name: 'S. José dos Campos',
    type: 'property',
    group: 'green',
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    housePrice: 200,
    icon: '🚀',  // EMBRAER / INPE / tecnologia aeroespacial
  },
  {
    position: 35,
    name: 'Est. Cruzeiro',
    type: 'railroad',
    group: 'railroad',
    price: 200,
    icon: '🚂',
  },
  {
    position: 36,
    name: 'Voz do Vale',
    type: 'community_chest',
    icon: '📬',
  },
  {
    position: 37,
    name: 'Taubaté',
    type: 'property',
    group: 'darkblue',
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    housePrice: 200,
    icon: '📚',  // Monteiro Lobato nasceu em Taubaté
  },
  {
    position: 38,
    name: 'Pedágio Anel Viário',
    type: 'luxury_tax',
    taxAmount: 100,
    icon: '🛣️',
  },
  {
    position: 39,
    name: 'S. Luís do Paraitinga',
    type: 'property',
    group: 'darkblue',
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    housePrice: 200,
    icon: '🎭',  // Carnaval histórico / cidade colonial
  },
];

export const getSpace = (position: number): BoardSpace =>
  BOARD_SPACES[position] ?? BOARD_SPACES[0];

// Map grid [row][col] (1-indexed, 11×11) → board position
export function positionToGrid(pos: number): { row: number; col: number } {
  if (pos === 0)  return { row: 11, col: 11 }; // GO — bottom-right
  if (pos === 10) return { row: 11, col: 1 };  // Jail — bottom-left
  if (pos === 20) return { row: 1,  col: 1 };  // Free Parking — top-left
  if (pos === 30) return { row: 1,  col: 11 }; // Go to Jail — top-right

  if (pos >= 1  && pos <= 9)  return { row: 11, col: 11 - pos };      // bottom row (right→left)
  if (pos >= 11 && pos <= 19) return { row: 11 - (pos - 10), col: 1 };// left col (bottom→top)
  if (pos >= 21 && pos <= 29) return { row: 1, col: pos - 19 };       // top row (left→right)
  if (pos >= 31 && pos <= 39) return { row: pos - 29, col: 11 };      // right col (top→bottom)

  return { row: 11, col: 11 };
}

// Which side of the board is this position on?
export type BoardSide = 'bottom' | 'left' | 'top' | 'right' | 'corner';
export function getBoardSide(pos: number): BoardSide {
  if ([0, 10, 20, 30].includes(pos)) return 'corner';
  if (pos >= 1  && pos <= 9)  return 'bottom';
  if (pos >= 11 && pos <= 19) return 'left';
  if (pos >= 21 && pos <= 29) return 'top';
  if (pos >= 31 && pos <= 39) return 'right';
  return 'corner';
}
