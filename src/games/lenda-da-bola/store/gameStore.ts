import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MatchRecord {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface GameState {
  currentSeason: number;
  currentWeek: number;
  budget: number;
  userTeamId: string | null;
  selectedSponsorId: string | null;
  tournamentStage: 'group' | 'knockout' | 'final';
  unlockedLegends: string[];
  matchRecord: MatchRecord;
  nextOpponentId: string;
  // actions
  setGameData: (data: Partial<Omit<GameState, 'setGameData' | 'advanceWeek' | 'unlockLegend' | 'resetGame' | 'recordMatchResult'>>) => void;
  advanceWeek: () => void;
  unlockLegend: (id: string) => void;
  resetGame: () => void;
  recordMatchResult: (homeGoals: number, awayGoals: number, nextOpponentId?: string) => void;
}

const OPPONENT_ROTATION = [
  'argentina','france','germany','portugal','england','spain','italy','netherlands',
  'belgium','uruguay','croatia','mexico','usa','senegal','japan',
];

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      currentSeason: 1,
      currentWeek: 1,
      budget: 50_000_000,
      userTeamId: null,
      selectedSponsorId: null,
      tournamentStage: 'group',
      unlockedLegends: [],
      matchRecord: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 },
      nextOpponentId: 'argentina',

      setGameData: (data) => set((state) => ({ ...state, ...data })),

      advanceWeek: () => set((state) => {
        const nextWeek = state.currentWeek + 1;
        if (nextWeek > 7) {
          return { currentWeek: 1, currentSeason: state.currentSeason + 1, tournamentStage: 'group' as const };
        }
        return { currentWeek: nextWeek };
      }),

      unlockLegend: (id) => set((state) => ({
        unlockedLegends: state.unlockedLegends.includes(id)
          ? state.unlockedLegends
          : [...state.unlockedLegends, id],
      })),

      resetGame: () => set({
        currentSeason: 1,
        currentWeek: 1,
        budget: 50_000_000,
        userTeamId: null,
        selectedSponsorId: null,
        tournamentStage: 'group',
        unlockedLegends: [],
        matchRecord: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 },
        nextOpponentId: 'argentina',
      }),

      recordMatchResult: (homeGoals, awayGoals, nextOpponentId) => set((state) => {
        const wins   = homeGoals > awayGoals ? state.matchRecord.wins + 1   : state.matchRecord.wins;
        const draws  = homeGoals === awayGoals ? state.matchRecord.draws + 1 : state.matchRecord.draws;
        const losses = awayGoals > homeGoals  ? state.matchRecord.losses + 1 : state.matchRecord.losses;
        const played = wins + draws + losses;
        const nextIdx = played % OPPONENT_ROTATION.length;
        return {
          matchRecord: { wins, draws, losses, goalsFor: state.matchRecord.goalsFor + homeGoals, goalsAgainst: state.matchRecord.goalsAgainst + awayGoals },
          nextOpponentId: nextOpponentId ?? OPPONENT_ROTATION[nextIdx],
        };
      }),
    }),
    { name: 'lenda-da-bola-save' }
  )
);
