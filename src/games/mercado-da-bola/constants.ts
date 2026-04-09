import type { League } from './types';

// ─── Board game rules ─────────────────────────────────────────────────────────

/** Fichas de defesa baseadas na pontuação total de estrelas do elenco */
export const DEFENSE_TOKEN_TABLE: { min: number; max: number; tokens: number }[] = [
  { min: 0,  max: 11,  tokens: 4 },
  { min: 12, max: 22,  tokens: 6 },
  { min: 23, max: 33,  tokens: 8 },
  { min: 34, max: 44,  tokens: 10 },
  { min: 45, max: 55,  tokens: 12 },
];

/** Máximo de jogadores por nível de estrela */
export const STAR_LIMITS: Record<number, number> = {
  5: 11,
  4: 11,
  3: 22,
  2: 33,
  1: 33,
};

/** Ataques por partida para cada time */
export const ATTACKS_PER_MATCH = 3;

/** Posições possíveis no gol (1–16) */
export const GOAL_POSITIONS = 16;

// ─── Cotas de patrocínio padrão ───────────────────────────────────────────────

export const DEFAULT_WIN_FEE  = 50;   // $50k por vitória
export const DEFAULT_DRAW_FEE = 25;   // $25k por empate
export const DEFAULT_LOSS_FEE = 0;    // $0k por derrota

// ─── Sistema de satisfação ────────────────────────────────────────────────────

export const MOOD_PLAY_BONUS      = 5;
export const MOOD_BENCH_PENALTY   = -15;  // 3+ rodadas sem jogar
export const MOOD_WAGE_BONUS      = 2;
export const MOOD_WAGE_LATE       = -20;
export const MOOD_TEAM_BAD        = -5;   // time nas últimas 3 posições
export const MOOD_CHAMPION        = 30;
export const MOOD_LIFESTYLE_FAIL  = -10;  // estilo de vida insustentável
export const MOOD_LEVEL_UP        = 15;

// ─── Multiplicadores de atributos por mood ────────────────────────────────────

export const MOOD_MULTIPLIER: Record<string, number> = {
  motivated: 1.10,
  happy:     1.05,
  neutral:   1.00,
  unhappy:   0.85,
};

// ─── XP por evento ────────────────────────────────────────────────────────────

export const XP_PLAY_MATCH   = 100;
export const XP_GOAL_SCORER  = 50;
export const XP_CLEAN_SHEET  = 75;
export const XP_WIN          = 30;
export const XP_HARD_MATCH   = 20;
export const XP_PER_LEVEL    = 500; // XP para subir um nível

// ─── Carta lendária ───────────────────────────────────────────────────────────

export const LEGENDARY_BASE_CHANCE   = 0.001; // 0.1%
export const LEGENDARY_CHAMPION_BONUS = 0.005; // +0.5%
export const LEGENDARY_BUDGET_BONUS   = 0.001; // +0.1% se budget > 10M
export const LEGENDARY_SEASON_BONUS   = 0.001; // +0.1% se 3+ temporadas
export const LEGENDARY_MAX_CHANCE     = 0.02;  // 2% máximo

// ─── Estilo de vida (custo mensal $k) ────────────────────────────────────────

export const LIFESTYLE_COSTS: Record<string, number> = {
  poor:       0,
  modest:     10,
  comfortable:50,
  luxury:     150,
  superstar:  500,
};

// ─── Estádio ──────────────────────────────────────────────────────────────────

export const STADIUM_UPGRADE_COSTS: Record<string, number[]> = {
  // custo de cada nível 1→2→3→4→5
  capacity: [200,  400,  800,  1600, 3000],
  vip:      [150,  300,  600,  1200, 2500],
  training: [100,  200,  400,   800, 1500],
  academy:  [250,  500, 1000,  2000, 4000],
  media:    [80,   160,  320,   640, 1200],
};

export const BASE_TICKET_REVENUE = 0.5; // $k por fã (metade da capacidade média)

// ─── Ligas ────────────────────────────────────────────────────────────────────

export const LEAGUES: League[] = [
  { id: 'brasileirao', name: 'Brasileirão Série A', country: 'Brasil',    flag: '🇧🇷' },
  { id: 'premier',     name: 'Premier League',      country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'laliga',      name: 'La Liga',             country: 'Espanha',   flag: '🇪🇸' },
  { id: 'seriea',      name: 'Serie A',             country: 'Itália',    flag: '🇮🇹' },
  { id: 'bundesliga',  name: 'Bundesliga',          country: 'Alemanha',  flag: '🇩🇪' },
  { id: 'ligue1',      name: 'Ligue 1',             country: 'França',    flag: '🇫🇷' },
];

// ─── Social ───────────────────────────────────────────────────────────────────

export const SOCIAL_ACCOUNTS = [
  '@gazetaesportiva',
  '@esporte_interativo',
  '@TNT_Sports_BR',
  '@SporTV',
  '@goal_br',
  '@ESPN_BR',
  '@UOLEsporte',
  '@transfermarktBR',
];

// ─── Save key ─────────────────────────────────────────────────────────────────

export const SAVE_KEY = 'mercado-da-bola-save';
