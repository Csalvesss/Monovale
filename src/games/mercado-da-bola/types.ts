// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST' | 'CF';

// ─── Manager Profile ──────────────────────────────────────────────────────────

export type ManagerStyle = 'attacking' | 'balanced' | 'defensive' | 'counter' | 'possession';

export interface ManagerProfile {
  name: string;
  nationality: string;
  nationalityFlag: string;
  nickname: string;
  style: ManagerStyle;
  avatarIndex: number;
}

// ─── Player Message ───────────────────────────────────────────────────────────

export type PlayerMessageType =
  | 'bench_streak'
  | 'goal_streak'
  | 'injury_return'
  | 'contract_expiring'
  | 'transfer_interest'
  | 'general'
  | 'squad_unhappy';

export type PlayerMessageMood = 'muito_feliz' | 'feliz' | 'normal' | 'insatisfeito' | 'triste' | 'com_raiva';

export interface PlayerMessageResponse {
  text: string;
  moralDelta: number;
  loyaltyDelta: number;
  pressureDelta?: number;
}

export interface PlayerMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerFlag: string;
  content: string;
  mood: PlayerMessageMood;
  type: PlayerMessageType;
  read: boolean;
  round: number;
  timestamp: number;
  responses: PlayerMessageResponse[];
  responded?: boolean;
}

// ─── Round Result Summary ─────────────────────────────────────────────────────

export interface RoundFixtureResult {
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
}

export interface RoundResultSummary {
  round: number;
  fixtures: RoundFixtureResult[];
}
export type StarRating = 1 | 2 | 3 | 4 | 5;
export type PlayerRarity = 'normal' | 'legendary';
export type LifestyleLevel = 'poor' | 'modest' | 'comfortable' | 'luxury' | 'superstar';
export type MoodLevel = 'unhappy' | 'neutral' | 'happy' | 'motivated';
export type LeagueId = 'brasileirao' | 'premier' | 'laliga' | 'seriea' | 'bundesliga' | 'ligue1';

// ─── Player ───────────────────────────────────────────────────────────────────

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  goalkeeping?: number;
}

export interface LegendaryCard {
  visual: 'gold' | 'platinum' | 'ruby' | 'sapphire';
  boostMultiplier: number;
  lore: string;
  era: string;
}

export interface Player {
  id: string;
  name: string;
  fullName: string;
  position: Position;
  stars: StarRating;
  age: number;
  nationality: string;
  flag: string;
  currentTeamId: string;
  marketValue: number;   // em milhares ($k)
  wage: number;          // salário semanal em $k
  contractExpiresIn: number; // temporadas restantes
  attributes: PlayerAttributes;

  // Satisfação
  mood: MoodLevel;
  moodPoints: number;    // 0–100
  lifestyle: LifestyleLevel;
  lifestyleExpenses: number; // custo mensal $k

  // Evolução
  xp: number;
  level: number;         // 1–10
  potentialBoost: number;

  // Raridade
  rarity: PlayerRarity;
  legendaryCard?: LegendaryCard;

  // Defesa (calculado internamente)
  defenseTokens: number;

  // Status
  injured: boolean;
  injuredForRounds: number;
  suspended: boolean;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  shortName: string;
  leagueId: LeagueId;
  country: string;
  badge: string;
  logoUrl?: string;      // URL do escudo real (CDN)
  primaryColor: string;
  secondaryColor: string;
  reputation: number;    // 1–100
  stadiumName: string;
  stadiumCapacity: number;
}

// ─── League ───────────────────────────────────────────────────────────────────

export interface League {
  id: LeagueId;
  name: string;
  country: string;
  flag: string;
}

// ─── Sponsor ──────────────────────────────────────────────────────────────────

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  industry: string;
  winFee: number;
  drawFee: number;
  lossFee: number;
  bonusFee: number;      // ao cair na casa de patrocínio
  tier: 1 | 2 | 3;
  minReputation: number;
}

// ─── Stadium ──────────────────────────────────────────────────────────────────

export type StadiumUpgrade = 'capacity' | 'vip' | 'training' | 'academy' | 'media';

export interface StadiumLevel {
  upgrade: StadiumUpgrade;
  level: number;         // 1–5
  cost: number;
}

export interface Stadium {
  name: string;
  capacity: number;
  vipSections: number;   // 0–5
  trainingLevel: number; // 0–5 → bônus XP
  academyLevel: number;  // 0–5 → base players quality
  mediaLevel: number;    // 0–5 → seguidores sociais
  ticketPrice: number;   // preço médio do ingresso $k
}

// ─── Match ────────────────────────────────────────────────────────────────────

export interface AttackPhase {
  round: number;
  attackerId: string;
  defenderPositions: number[];
  attackerNumber: number;
  isGoal: boolean;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  winner: 'home' | 'away' | 'draw';
  sponsorEarned: number;
  xpEarned: Record<string, number>; // playerId → xp
  ticketRevenue: number;
}

export interface MatchFixture {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  result?: MatchResult;
  played: boolean;
}

// ─── Social / News ────────────────────────────────────────────────────────────

export type NewsType = 'transfer' | 'match' | 'sponsor' | 'player' | 'legendary' | 'stadium' | 'general';

export interface NewsPost {
  id: string;
  type: NewsType;
  platform: 'instagram' | 'twitter' | 'report';
  author: string;
  authorHandle?: string;
  content: string;
  imageEmoji?: string;
  likes: number;
  comments: number;
  timestamp: number;
  isMyTeam: boolean;
}

// ─── Standing ─────────────────────────────────────────────────────────────────

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

// ─── Transfer ─────────────────────────────────────────────────────────────────

export interface TransferOffer {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  offerAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  round: number;
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export interface FinancialRecord {
  round: number;
  description: string;
  amount: number;        // positivo = receita, negativo = despesa
  category: 'wage' | 'transfer' | 'sponsor' | 'ticket' | 'training' | 'stadium' | 'other';
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type MBScreen =
  | 'team-select'
  | 'onboarding'
  | 'home'
  | 'squad'
  | 'market'
  | 'match'
  | 'sponsor'
  | 'standings'
  | 'social'
  | 'stadium'
  | 'player-detail'
  | 'turn-handoff'
  | 'online-lobby'
  | 'inbox';

// ─── Multiplayer ──────────────────────────────────────────────────────────────

export interface PlayerProfile {
  name: string;
  teamId: string;
  squad: Player[];
  budget: number;
  stadium: Stadium;
  sponsorId: string | null;
  sponsorPoints: number;
  legendaryCardsOwned: string[];
  legendaryChanceBonus: number;
  pendingOffers: TransferOffer[];
  finances: FinancialRecord[];
  fixtures: MatchFixture[];
  currentRound: number;
  currentSeason: number;
  seasonHistory: { season: number; position: number; budget: number }[];
  totalRoundsPlayed: number;
}

export interface GameSave {
  version: '1.0';
  timestamp: number;
  myTeamId: string;
  budget: number;
  currentSeason: number;
  currentRound: number;
  mySquad: Player[];
  allPlayers: Player[];                   // todos os jogadores no mercado
  fixtures: MatchFixture[];
  standings: Standing[];
  sponsorId: string | null;
  sponsorPoints: number;
  stadium: Stadium;
  finances: FinancialRecord[];
  newsFeed: NewsPost[];
  legendaryCardsOwned: string[];
  legendaryChanceBonus: number;           // % extra acumulada
  pendingOffers: TransferOffer[];
  seasonHistory: { season: number; position: number; budget: number }[];
  totalRoundsPlayed: number;
  // Multiplayer extensions
  mode: 'solo' | 'local-multi' | 'online';
  currentTurn: 1 | 2;
  playerProfiles: [PlayerProfile, PlayerProfile] | null;
  // Match simulation variety
  randomSeed: number;
  // Online league
  onlineLeagueCode?: string;
  playerUid?: string;
  playerDisplayName?: string;
  // Manager & messaging
  managerProfile?: ManagerProfile;
  playerMessages: PlayerMessage[];
  lastRoundResults?: RoundResultSummary;
  unreadMessages: number;
}
