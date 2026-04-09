// ─── Space Types ────────────────────────────────────────────────────────────

export type SpaceType =
  | 'property' | 'railroad' | 'utility'
  | 'go' | 'jail' | 'free_parking' | 'go_to_jail'
  | 'chance' | 'community_chest'
  | 'income_tax' | 'luxury_tax';

export type PropertyGroup =
  | 'purple' | 'lightblue' | 'pink' | 'orange'
  | 'red' | 'yellow' | 'green' | 'darkblue'
  | 'railroad' | 'utility';

// ─── Static Board Data ───────────────────────────────────────────────────────

export interface BoardSpace {
  position: number;
  name: string;
  type: SpaceType;
  group?: PropertyGroup;
  price?: number;
  rent?: number[];
  housePrice?: number;
  taxAmount?: number;
  icon?: string;
}

// ─── Dynamic Property State ──────────────────────────────────────────────────

export interface PropertyState {
  position: number;
  ownerId: string | null;
  houses: number;
  hotel: boolean;
  mortgaged: boolean;
}

// ─── Players ─────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  pawnId: string;
  uid: string | null;       // Firebase uid (null = guest)
  position: number;
  money: number;
  jailTurns: number;
  bankrupt: boolean;
  getOutOfJailCards: number;
}

// ─── Pawn ────────────────────────────────────────────────────────────────────

export interface Pawn {
  id: string;
  emoji: string;
  name: string;
  color: string;
  bgColor: string;
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export type CardAction =
  | { type: 'collect'; amount: number }
  | { type: 'pay'; amount: number }
  | { type: 'collect_from_each'; amount: number }
  | { type: 'pay_to_each'; amount: number }
  | { type: 'advance_to'; position: number; collectGoBonus: boolean }
  | { type: 'advance_to_railroad'; doubleRent: boolean }
  | { type: 'go_to_jail' }
  | { type: 'get_out_of_jail_free' }
  | { type: 'move_back'; spaces: number }
  | { type: 'repairs'; perHouse: number; perHotel: number };

export interface Card {
  id: string;
  deck: 'chance' | 'community';
  text: string;
  action: CardAction;
}

// ─── Auction ─────────────────────────────────────────────────────────────────

export interface AuctionState {
  propertyPosition: number;
  highestBid: number;
  highestBidderIndex: number | null;
  activeBidderIndex: number;
  passedPlayerIds: string[];
  activePlayerIds: string[];
  startingPlayerIndex: number;
}

// ─── Trade ───────────────────────────────────────────────────────────────────

export interface TradeState {
  proposingPlayerIndex: number;
  targetPlayerIndex: number | null;
  offerMoney: number;
  offerPositions: number[];
  requestMoney: number;
  requestPositions: number[];
  status: 'selecting_target' | 'configuring' | 'awaiting_response';
}

// ─── Log ─────────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'bank' | 'trade' | 'auction' | 'jail' | 'card' | 'bankrupt';
  timestamp: number;
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type GamePhase = 'lobby' | 'playing' | 'ended';

export type TurnPhase =
  | 'pre_roll'
  | 'buy_decision'
  | 'card_drawn'
  | 'auction'
  | 'trade'
  | 'turn_complete';

export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  players: Player[];
  currentPlayerIndex: number;
  spaces: BoardSpace[];
  properties: Record<number, PropertyState>;
  chanceCards: Card[];
  communityCards: Card[];
  dice: [number, number] | null;
  doubleCount: number;
  pendingPropertyPosition: number | null;
  pendingCard: Card | null;
  auction: AuctionState | null;
  trade: TradeState | null;
  log: LogEntry[];
  winner: string | null;
  gameId: string | null;   // Firestore doc id
}

// ─── Lobby Config ────────────────────────────────────────────────────────────

export interface LobbyPlayerConfig {
  name: string;
  pawnId: string;
  uid: string | null;     // Firebase uid
}

export interface LobbyConfig {
  playerCount: number;
  players: LobbyPlayerConfig[];
  randomOrder: boolean;
}

// ─── Firebase user profile ───────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  pawnId: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalNetWorth: number;
    bankruptcies: number;
  };
  createdAt: number;
}

// ─── Game result (saved to Firestore on game end) ────────────────────────────

export interface GameResult {
  gameId: string;
  playerIds: (string | null)[];
  rankings: {
    rank: number;
    uid: string | null;
    displayName: string;
    netWorth: number;
    winner: boolean;
    bankrupt: boolean;
  }[];
  completedAt: number;
}
