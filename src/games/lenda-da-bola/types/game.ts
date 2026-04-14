export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'CF' | 'ST';

export interface Attributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  fullName: string;
  photo: string;
  age: number;
  nationality: string;
  position: Position;
  currentTeamId: string;
  stars: number;
  attributes: Attributes;
  marketValue: number;
  wage: number;
  contractExpiresIn: number;
  moodPoints: number;
  lifestyle: string;
  lifestyleMonthlyExpense: number;
  xp: number;
  level: number;
  rarity: 'common' | 'rare' | 'legendary';
  recentForm: number[];
  era?: string;
  lore?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  flag: string;
  leagueId: string;
  budget: number;
  reputation: number;
  players: string[];
  isUserControlled?: boolean;
  group?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  reward: number;
  requirement: string;
  perks: string[];
  color: string;
}

export interface MatchResult {
  score: { home: number; away: number };
  events: string[];
  matchPoints: number;
}

export type LDBScreen = 'home' | 'squad' | 'match' | 'market' | 'standings' | 'sponsor';
