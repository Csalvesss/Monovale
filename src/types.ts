// ─── Space Types ────────────────────────────────────────────────────────────

export type SpaceType =
  | 'property'
  | 'railroad'
  | 'utility'
  | 'go'
  | 'jail'
  | 'free_parking'
  | 'go_to_jail'
  | 'chance'
  | 'community_chest'
  | 'income_tax'
  | 'luxury_tax';

export type PropertyGroup =
  | 'purple'
  | 'lightblue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkblue'
  | 'railroad'
  | 'utility';

// ─── Static Board Data ───────────────────────────────────────────────────────

export interface BoardSpace {
  position: number;
  name: string;
  type: SpaceType;
  group?: PropertyGroup;
  price?: number;
  // rent[0]=no house, [1]=1h, [2]=2h, [3]=3h, [4]=4h, [5]=hotel
  rent?: number[];
  housePrice?: number;
  taxAmount?: number; // for income_tax / luxury_tax
  icon?: string;
}

// ─── Dynamic Property State ──────────────────────────────────────────────────

export interface PropertyState {
  position: number;
  ownerId: string | null;
  houses: number; // 0-4
  hotel: boolean;
  mortgaged: boolean;
}

// ─── Players ─────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  pawnId: string;
  position: number;
  money: number;
  jailTurns: number; // 0 = not in jail; 1-3 = turns spent in jail
  bankrupt: boolean;
  getOutOfJailCards: number;
}

// ─── Pawn Definition ─────────────────────────────────────────────────────────

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

// ─── Auction State ───────────────────────────────────────────────────────────

export interface AuctionState {
  propertyPosition: number;
  highestBid: number;
  highestBidderIndex: number | null;
  activeBidderIndex: number; // index into activePlayers
  passedPlayerIds: string[];
  activePlayerIds: string[]; // players still bidding (in order)
  startingPlayerIndex: number; // original turn player
}

// ─── Trade State ─────────────────────────────────────────────────────────────

export interface TradeState {
  proposingPlayerIndex: number;
  targetPlayerIndex: number | null;
  offerMoney: number;
  offerPositions: number[];     // property positions offered
  requestMoney: number;
  requestPositions: number[];   // property positions requested
  status: 'selecting_target' | 'configuring' | 'awaiting_response';
}

// ─── Log Entry ───────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'bank' | 'trade' | 'auction' | 'jail' | 'card' | 'bankrupt';
  timestamp: number;
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type GamePhase = 'lobby' | 'playing' | 'ended';

export type TurnPhase =
  | 'pre_roll'         // waiting for player to roll
  | 'buy_decision'     // player can buy or auction the landed property
  | 'card_drawn'       // a card was drawn, showing its text
  | 'auction'          // auction in progress
  | 'trade'            // trade in progress
  | 'turn_complete';   // player finished, ready for next

export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  players: Player[];
  currentPlayerIndex: number;
  spaces: BoardSpace[];
  properties: Record<number, PropertyState>; // keyed by position
  chanceCards: Card[];
  communityCards: Card[];
  dice: [number, number] | null;
  doubleCount: number;
  pendingPropertyPosition: number | null; // property being decided on
  pendingCard: Card | null;
  auction: AuctionState | null;
  trade: TradeState | null;
  log: LogEntry[];
  winner: string | null;
}

// ─── Lobby Config ────────────────────────────────────────────────────────────

export interface LobbyPlayerConfig {
  name: string;
  pawnId: string;
}

export interface LobbyConfig {
  playerCount: number;
  players: LobbyPlayerConfig[];
  randomOrder: boolean;
}
