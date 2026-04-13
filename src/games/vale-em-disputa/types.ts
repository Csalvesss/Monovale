// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

export type FactionId =
  | 'industriais'   // Industriais de São José dos Campos
  | 'serranos'      // Serranos de Taubaté
  | 'historicos'    // Históricos de Guaratinguetá
  | 'fronteiristas' // Fronteiristas de Cruzeiro
  | 'litoraneos';   // Litorâneos de Ubatuba

export type TerritorySymbol = 'square' | 'triangle' | 'circle';

export type GamePhase = 'reinforce' | 'attack' | 'move' | 'end';

export type GameStatus = 'lobby' | 'playing' | 'finished';

export type MissionId =
  | 'control_r1_r5'
  | 'eliminate_player'
  | 'control_18_cities'
  | 'control_r3_r4'
  | 'control_12_with_3'
  | 'accumulate_gold';

export interface Mission {
  id: MissionId;
  title: string;
  description: string;
  targetPlayerId?: string; // for 'eliminate_player' mission
}

export interface ActiveEffect {
  id: string;
  type: string;
  targetPlayerId?: string;
  targetCity?: string;
  data?: Record<string, unknown>;
  expiresAfterTurn: number; // turn number when this expires
  expiresPhase?: GamePhase;
}

export interface Player {
  id: string;
  name: string;
  faction: FactionId;
  gold: number;
  combatWins: number;     // counter for faction active power (resets on use)
  hand: string[];         // territory card city names
  mission: Mission;
  eliminated: boolean;
  factionPowerUsed: boolean; // whether active power was used this game (temp tracking)
  pendingPowerAvailable: boolean; // true when combatWins >= 3
}

export interface Territory {
  owner: string | null; // playerId or null
  troops: number;
  frozen?: boolean;     // cannot be attacked
}

export interface CombatResult {
  attackerDice: number[];
  defenderDice: number[];
  attackerLosses: number;
  defenderLosses: number;
  conquered: boolean;
}

export interface LogEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'combat' | 'reinforce' | 'move' | 'card' | 'system' | 'gold' | 'faction';
}

export interface TradeTerritoryCards {
  cards: string[]; // city names
  bonus: number;
}

export interface PendingAttack {
  fromCity: string;
  toCity: string;
}

export interface PendingMove {
  fromCity: string;
  toCity: string;
  troops: number;
}

export interface EventCardChoice {
  cardIds: [string, string];
  // stored in game state when player must pick
}

export interface GameState {
  id: string;
  code: string; // 6-letter room code
  status: GameStatus;
  currentTurn: string;         // playerId
  currentPhase: GamePhase;
  round: number;
  playerOrder: string[];       // ordered player IDs

  players: Record<string, Player>;
  territories: Record<string, Territory>;

  eventDeck: string[];         // shuffled event card IDs
  territoryDeck: string[];     // shuffled territory cards (city names)
  usedTerritoryCards: string[]; // discarded territory cards
  tradeCount: number;          // how many trades happened (for progressive table)

  activeEffects: ActiveEffect[];

  pendingEventChoice: EventCardChoice | null; // when player must pick event card
  conqueredThisTurn: boolean;  // did current player conquer at least 1 city

  log: LogEntry[];

  winner: string | null;       // playerId or null
  winReason: string | null;
}

export interface RoomPlayer {
  id: string;
  name: string;
  faction: FactionId | null;
  ready: boolean;
  isHost: boolean;
}

export interface RoomState {
  code: string;
  status: 'lobby' | 'starting' | 'playing';
  players: Record<string, RoomPlayer>;
  gameId: string | null;
  hostId: string;
}

// UI state (not persisted in Firestore)
export interface LocalUIState {
  selectedCity: string | null;
  attackFrom: string | null;
  moveFrom: string | null;
  pendingAttack: PendingAttack | null;
  diceResult: CombatResult | null;
  showDice: boolean;
  showEventModal: boolean;
  showTerritoryModal: boolean;
  showMissionModal: boolean;
  reinforcementsLeft: number;
  movingTroops: number;
}
