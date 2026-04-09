import { create } from 'zustand';
import type { Player } from '../types/game';

interface SquadState {
  players: Record<string, Player>;
  lineup: string[];
  bench: string[];
  // actions
  setPlayers: (players: Player[]) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  setLineup: (lineup: string[]) => void;
  setBench: (bench: string[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  swapLineupBench: (lineupId: string, benchId: string) => void;
}

export const useSquadStore = create<SquadState>((set) => ({
  players: {},
  lineup: [],
  bench: [],

  setPlayers: (list) => {
    const map = list.reduce<Record<string, Player>>((acc, p) => ({ ...acc, [p.id]: p }), {});
    set((state) => ({ players: { ...state.players, ...map } }));
  },

  updatePlayer: (id, updates) => set((state) => ({
    players: { ...state.players, [id]: { ...state.players[id], ...updates } },
  })),

  setLineup: (lineup) => set({ lineup }),
  setBench:  (bench)  => set({ bench }),

  addPlayer: (player) => set((state) => ({
    players: { ...state.players, [player.id]: player },
    bench: [...state.bench, player.id],
  })),

  removePlayer: (id) => set((state) => {
    const { [id]: _removed, ...rest } = state.players;
    return {
      players: rest,
      lineup: state.lineup.filter((pid) => pid !== id),
      bench:  state.bench.filter((pid)  => pid !== id),
    };
  }),

  swapLineupBench: (lineupId, benchId) => set((state) => ({
    lineup: state.lineup.map((id) => (id === lineupId ? benchId : id)),
    bench:  state.bench.map((id)  => (id === benchId  ? lineupId : id)),
  })),
}));
