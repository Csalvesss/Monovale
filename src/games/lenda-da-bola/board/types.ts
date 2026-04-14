// ─── Board Space ──────────────────────────────────────────────────────────────

export type SpaceType =
  | 'start'
  | 'match-day'
  | 'transfer'
  | 'sponsor'
  | 'legend'
  | 'rest'
  | 'challenge'
  | 'bonus'
  | 'penalty'
  | 'extra-turn';

export interface BoardSpace {
  id: number;
  type: SpaceType;
  label: string;
  color: string;
  emoji: string;
  value?: number; // NIG amount for bonus/penalty
}

// ─── Player ───────────────────────────────────────────────────────────────────

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export const PLAYER_COLORS: Record<PlayerColor, { bg: string; light: string; border: string }> = {
  red:    { bg: '#dc2626', light: '#fca5a5', border: '#ef4444' },
  blue:   { bg: '#2563eb', light: '#93c5fd', border: '#3b82f6' },
  green:  { bg: '#16a34a', light: '#86efac', border: '#22c55e' },
  yellow: { bg: '#b45309', light: '#fcd34d', border: '#f59e0b' },
  purple: { bg: '#7c3aed', light: '#c4b5fd', border: '#a855f7' },
  orange: { bg: '#c2410c', light: '#fdba74', border: '#f97316' },
};

export const ALL_PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export interface BoardPlayer {
  uid: string;
  name: string;
  color: PlayerColor;
  position: number;      // 0 .. TOTAL_SPACES-1
  nig: number;           // coins (starts at 1000)
  points: number;        // match points + sponsor + legend bonuses
  defenseTokens: number; // computed from cards (never set manually)
  attackRange: number;   // computed from cards (never set manually)
  skipsNext: boolean;
  legendCards: number;
  laps: number;          // completed full laps (for pass-GO bonus)
  cards: import('./cards').BoardCard[]; // player's card collection (cartelas)
}

// ─── Action Result ────────────────────────────────────────────────────────────

export interface ActionResult {
  playerUid: string;
  spaceId: number;
  spaceType: SpaceType;
  spaceLabel: string;
  dice: number;
  nigDelta: number;
  pointsDelta: number;
  description: string;
  extraTurn: boolean;
  matchDetail?: {
    homeGoals: number;
    awayGoals: number;
    events: string[];
    outcome: 'win' | 'draw' | 'loss';
  };
  /** Market card offers — only present for 'transfer' spaces */
  marketOffers?: import('./cards').BoardCard[];
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type GamePhase = 'roll' | 'action';

export interface RoomDoc {
  code: string;
  hostUid: string;
  status: RoomStatus;
  players: BoardPlayer[];
  turnOrder: string[];         // uids in turn order
  currentTurnIndex: number;
  round: number;               // increments every full lap of all players
  maxRounds: number;           // game ends after this many rounds
  phase: GamePhase;
  lastAction: ActionResult | null;
  lastDice: number | null;
  log: string[];               // last N game events (capped at 20)
  winner: string | null;
}
