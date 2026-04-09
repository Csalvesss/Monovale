import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { GameSave, Player, MBScreen, MatchFixture, MatchResult, TransferOffer, StadiumUpgrade } from '../types';
import { ALL_TEAMS, getTeam } from '../data/teams';
import { ALL_SPONSORS, getSponsor } from '../data/sponsors';
import { LEGENDARY_PLAYERS, getLegendaryById } from '../data/legendary-players';
import { calcDefenseTokens, simulateMatch, quickSimulate, getTeamRating } from '../utils/matchEngine';
import {
  newsTransferIn, newsTransferOut, newsSponsorSigned, newsLegendaryFound,
  newsMatchWin, newsMatchDraw, newsMatchLoss, newsStadiumUpgrade,
  newsPlayerLevelUp, generateWorldNews, applyRandomEvent,
} from '../utils/eventGenerator';
import {
  SAVE_KEY, LEGENDARY_BASE_CHANCE, LEGENDARY_CHAMPION_BONUS,
  LEGENDARY_BUDGET_BONUS, LEGENDARY_SEASON_BONUS, LEGENDARY_MAX_CHANCE,
  XP_PER_LEVEL, MOOD_BENCH_PENALTY, MOOD_PLAY_BONUS, MOOD_WAGE_BONUS,
  LIFESTYLE_COSTS, STADIUM_UPGRADE_COSTS,
} from '../constants';

// ─── State shape ─────────────────────────────────────────────────────────────

interface MBState {
  screen: MBScreen;
  save: GameSave | null;
  matchPhase: 'setup' | 'playing' | 'result' | null;
  lastMatchResult: ReturnType<typeof simulateMatch> | null;
  selectedPlayerId: string | null;
  notification: { message: string; type: 'success' | 'error' | 'info' | 'legendary' } | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_SAVE'; save: GameSave }
  | { type: 'START_NEW_GAME'; save: GameSave }
  | { type: 'SET_SCREEN'; screen: MBScreen }
  | { type: 'SELECT_PLAYER'; playerId: string | null }
  | { type: 'PLAY_MATCH'; result: ReturnType<typeof simulateMatch>; fixtureIndex: number }
  | { type: 'BUY_PLAYER'; player: Player; price: number }
  | { type: 'SELL_PLAYER'; playerId: string; price: number; toTeamName: string }
  | { type: 'SET_SPONSOR'; sponsorId: string }
  | { type: 'TRAIN_PLAYER'; playerId: string; cost: number }
  | { type: 'UPGRADE_STADIUM'; upgrade: StadiumUpgrade }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'DISMISS_NOTIFICATION' }
  | { type: 'SHOW_NOTIFICATION'; message: string; notifType: 'success' | 'error' | 'info' | 'legendary' }
  | { type: 'UPDATE_SAVE'; save: GameSave };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: MBState, action: Action): MBState {
  switch (action.type) {
    case 'LOAD_SAVE':
    case 'START_NEW_GAME':
      return { ...state, save: action.save, screen: 'home' };

    case 'SET_SCREEN':
      return {
        ...state,
        screen: action.screen,
        selectedPlayerId: null,
        // Reset match result when navigating to match screen so it shows pre-match, not the last result
        ...(action.screen === 'match' ? { lastMatchResult: null, matchPhase: null } : {}),
      };

    case 'SELECT_PLAYER':
      return { ...state, selectedPlayerId: action.playerId, screen: action.playerId ? 'player-detail' : state.screen };

    case 'PLAY_MATCH':
      if (!state.save) return state;
      return {
        ...state,
        lastMatchResult: action.result,
        matchPhase: 'result',
        save: applyMatchResult(state.save, action.result, action.fixtureIndex),
      };

    case 'BUY_PLAYER': {
      if (!state.save) return state;
      const cost = action.price;
      if (state.save.budget < cost) return { ...state, notification: { message: 'Orçamento insuficiente!', type: 'error' } };
      const buyer = { ...action.player, currentTeamId: state.save.myTeamId };
      const newSquad = [...state.save.mySquad, buyer];
      const newAllPlayers = state.save.allPlayers.map(p => p.id === buyer.id ? buyer : p);
      const transferNews = newsTransferIn(buyer, getTeam(state.save.myTeamId)?.name ?? 'Seu Time');
      const newSave: GameSave = {
        ...state.save,
        budget: state.save.budget - cost,
        mySquad: newSquad,
        allPlayers: newAllPlayers,
        newsFeed: [transferNews, ...state.save.newsFeed].slice(0, 50),
        finances: [{ round: state.save.currentRound, description: `Compra: ${buyer.name}`, amount: -cost, category: 'transfer' }, ...state.save.finances],
      };
      persistSave(newSave);
      return { ...state, save: newSave, notification: { message: `${buyer.name} contratado por $${cost}k!`, type: 'success' } };
    }

    case 'SELL_PLAYER': {
      if (!state.save) return state;
      const sold = state.save.mySquad.find(p => p.id === action.playerId);
      if (!sold) return state;
      const returnedPlayer = { ...sold, currentTeamId: 'free-market' };
      const updatedAllPlayers = state.save.allPlayers.map(p => p.id === sold.id ? returnedPlayer : p);
      const myTeamName = getTeam(state.save.myTeamId)?.name ?? 'Seu Time';
      const saleNews = newsTransferOut(sold, myTeamName, action.toTeamName);
      const newSave: GameSave = {
        ...state.save,
        budget: state.save.budget + action.price,
        mySquad: state.save.mySquad.filter(p => p.id !== action.playerId),
        allPlayers: updatedAllPlayers,
        newsFeed: [saleNews, ...state.save.newsFeed].slice(0, 50),
        finances: [{ round: state.save.currentRound, description: `Venda: ${sold.name}`, amount: action.price, category: 'transfer' }, ...state.save.finances],
      };
      persistSave(newSave);
      return { ...state, save: newSave, notification: { message: `${sold.name} vendido por $${action.price}k!`, type: 'success' } };
    }

    case 'SET_SPONSOR': {
      if (!state.save) return state;
      const sponsor = getSponsor(action.sponsorId);
      if (!sponsor) return state;
      const myTeamName = getTeam(state.save.myTeamId)?.name ?? 'Seu Time';
      const sponsorNews = newsSponsorSigned(myTeamName, sponsor.name);
      const newSave: GameSave = {
        ...state.save,
        sponsorId: action.sponsorId,
        newsFeed: [sponsorNews, ...state.save.newsFeed].slice(0, 50),
      };
      persistSave(newSave);
      return { ...state, save: newSave, notification: { message: `Patrocínio com ${sponsor.name} fechado!`, type: 'success' } };
    }

    case 'TRAIN_PLAYER': {
      if (!state.save) return state;
      if (state.save.budget < action.cost) return { ...state, notification: { message: 'Orçamento insuficiente!', type: 'error' } };
      const newSquad = state.save.mySquad.map(p => {
        if (p.id !== action.playerId) return p;
        const newXp = p.xp + 200;
        const newLevel = Math.min(10, Math.floor(newXp / XP_PER_LEVEL) + 1);
        const leveled = newLevel > p.level;
        const boostedAttrs = leveled ? boostAttributes(p) : p.attributes;
        const lvlNews = leveled ? newsPlayerLevelUp(p) : null;
        return { ...p, xp: newXp, level: newLevel, attributes: boostedAttrs, mood: leveled ? ('happy' as const) : p.mood, moodPoints: leveled ? Math.min(100, p.moodPoints + 15) : p.moodPoints };
      });
      const newSave: GameSave = {
        ...state.save,
        budget: state.save.budget - action.cost,
        mySquad: newSquad,
        finances: [{ round: state.save.currentRound, description: `Treino extra`, amount: -action.cost, category: 'training' }, ...state.save.finances],
      };
      persistSave(newSave);
      return { ...state, save: newSave, notification: { message: 'Jogador treinou extra!', type: 'success' } };
    }

    case 'UPGRADE_STADIUM': {
      if (!state.save) return state;
      const cur = state.save.stadium;
      const lvl = cur[action.upgrade as keyof typeof cur] as number ?? 0;
      if (lvl >= 5) return { ...state, notification: { message: 'Nível máximo já atingido!', type: 'error' } };
      const cost = STADIUM_UPGRADE_COSTS[action.upgrade]?.[lvl] ?? 9999;
      if (state.save.budget < cost) return { ...state, notification: { message: 'Orçamento insuficiente!', type: 'error' } };
      const newStadium = { ...cur, [action.upgrade]: lvl + 1 };
      if (action.upgrade === 'capacity') newStadium.capacity = Math.round(cur.capacity * 1.15);
      const myTeamName = getTeam(state.save.myTeamId)?.name ?? 'Seu Time';
      const stadNews = newsStadiumUpgrade(myTeamName, action.upgrade);
      const newSave: GameSave = {
        ...state.save,
        budget: state.save.budget - cost,
        stadium: newStadium,
        newsFeed: [stadNews, ...state.save.newsFeed].slice(0, 50),
        finances: [{ round: state.save.currentRound, description: `Melhoria estádio: ${action.upgrade}`, amount: -cost, category: 'stadium' }, ...state.save.finances],
      };
      persistSave(newSave);
      return { ...state, save: newSave, notification: { message: `Melhoria ${action.upgrade} concluída!`, type: 'success' } };
    }

    case 'ADVANCE_ROUND': {
      if (!state.save) return state;
      const newSave = advanceRound(state.save);
      persistSave(newSave);
      return { ...state, save: newSave };
    }

    case 'DISMISS_NOTIFICATION':
      return { ...state, notification: null };

    case 'SHOW_NOTIFICATION':
      return { ...state, notification: { message: action.message, type: action.notifType } };

    case 'UPDATE_SAVE':
      persistSave(action.save);
      return { ...state, save: action.save };

    default:
      return state;
  }
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function boostAttributes(p: Player): Player['attributes'] {
  const attrs = { ...p.attributes };
  const keys = Object.keys(attrs) as (keyof typeof attrs)[];
  const posKeys = getPositionKeys(p.position);
  posKeys.forEach(k => {
    if (k in attrs) (attrs as Record<string, number>)[k] = Math.min(99, ((attrs as Record<string, number>)[k] ?? 0) + 2);
  });
  return attrs;
}

function getPositionKeys(pos: string): string[] {
  if (pos === 'GK') return ['goalkeeping', 'defending', 'physical'];
  if (['CB', 'LB', 'RB'].includes(pos)) return ['defending', 'physical', 'pace'];
  if (['CDM', 'CM'].includes(pos)) return ['passing', 'defending', 'physical'];
  if (pos === 'CAM') return ['passing', 'dribbling', 'shooting'];
  if (['LW', 'RW'].includes(pos)) return ['pace', 'dribbling', 'shooting'];
  return ['shooting', 'pace', 'physical'];
}

function applyMatchResult(save: GameSave, matchData: ReturnType<typeof simulateMatch>, fixtureIndex: number): GameSave {
  const { result } = matchData;
  const fixture = save.fixtures[fixtureIndex];
  if (!fixture) return save;

  // Update fixture
  const updatedFixtures = save.fixtures.map((f, i) => i === fixtureIndex ? { ...f, result, played: true } : f);

  // Update standings
  const myTeamId = save.myTeamId;
  const isHome = fixture.homeTeamId === myTeamId;
  const myGoals = isHome ? result.homeGoals : result.awayGoals;
  const opGoals = isHome ? result.awayGoals : result.homeGoals;
  const iWon = myGoals > opGoals;
  const isDraw = myGoals === opGoals;
  const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;

  const updatedStandings = save.standings.map(s => {
    if (s.teamId === myTeamId) {
      return {
        ...s,
        played: s.played + 1,
        won: s.won + (iWon ? 1 : 0),
        drawn: s.drawn + (isDraw ? 1 : 0),
        lost: s.lost + (!iWon && !isDraw ? 1 : 0),
        goalsFor: s.goalsFor + myGoals,
        goalsAgainst: s.goalsAgainst + opGoals,
        points: s.points + (iWon ? 3 : isDraw ? 1 : 0),
      };
    }
    if (s.teamId === opponentId) {
      const opWon = !iWon && !isDraw;
      return {
        ...s,
        played: s.played + 1,
        won: s.won + (opWon ? 1 : 0),
        drawn: s.drawn + (isDraw ? 1 : 0),
        lost: s.lost + (iWon ? 1 : 0),
        goalsFor: s.goalsFor + opGoals,
        goalsAgainst: s.goalsAgainst + myGoals,
        points: s.points + (opWon ? 3 : isDraw ? 1 : 0),
      };
    }
    return s;
  });

  // Apply XP to squad
  const updatedSquad = save.mySquad.map(p => {
    const gained = result.xpEarned[p.id] ?? 0;
    if (!gained) return { ...p, moodPoints: Math.max(0, p.moodPoints + MOOD_BENCH_PENALTY) };
    const newXp = p.xp + gained;
    const newLevel = Math.min(10, Math.floor(newXp / XP_PER_LEVEL) + 1);
    const leveled = newLevel > p.level;
    return {
      ...p,
      xp: newXp,
      level: newLevel,
      attributes: leveled ? boostAttributes(p) : p.attributes,
      moodPoints: Math.min(100, p.moodPoints + MOOD_PLAY_BONUS + (iWon ? 5 : 0)),
      mood: computeMood(Math.min(100, p.moodPoints + MOOD_PLAY_BONUS + (iWon ? 5 : 0))),
    };
  });

  // Budget update
  const newBudget = save.budget + result.sponsorEarned + result.ticketRevenue;
  const myTeamName = getTeam(myTeamId)?.name ?? 'Seu Time';
  const opponentTeam = getTeam(opponentId);
  const score = `${myGoals}x${opGoals}`;
  const matchNews = iWon
    ? newsMatchWin(myTeamName, opponentTeam?.name ?? 'Adversário', score)
    : isDraw
      ? newsMatchDraw(myTeamName, opponentTeam?.name ?? 'Adversário', score)
      : newsMatchLoss(myTeamName, opponentTeam?.name ?? 'Adversário', score);

  // Check legendary
  let legendaryBonus = save.legendaryChanceBonus;
  let legendaryOwned = [...save.legendaryCardsOwned];
  let legendaryNews = null;
  const legendaryChance = Math.min(LEGENDARY_MAX_CHANCE, LEGENDARY_BASE_CHANCE + legendaryBonus);
  const legendaryRoll = Math.random();
  if (legendaryRoll < legendaryChance) {
    const available = LEGENDARY_PLAYERS.filter(l => !legendaryOwned.includes(l.id));
    if (available.length > 0) {
      const card = available[Math.floor(Math.random() * available.length)];
      legendaryOwned.push(card.id);
      legendaryBonus = 0; // reset
      legendaryNews = newsLegendaryFound(card.name, myTeamName);
    }
  } else {
    legendaryBonus += 0.0002; // small accumulation
  }

  const newsFeed = [matchNews, ...(legendaryNews ? [legendaryNews] : []), ...save.newsFeed].slice(0, 50);
  const finances = [
    { round: save.currentRound, description: `Partida vs ${opponentTeam?.name ?? 'Adversário'} - patrocínio`, amount: result.sponsorEarned, category: 'sponsor' as const },
    ...(result.ticketRevenue > 0 ? [{ round: save.currentRound, description: 'Bilheteria', amount: result.ticketRevenue, category: 'ticket' as const }] : []),
    ...save.finances,
  ];

  return {
    ...save,
    fixtures: updatedFixtures,
    standings: updatedStandings,
    mySquad: updatedSquad,
    budget: newBudget,
    newsFeed,
    finances,
    legendaryCardsOwned: legendaryOwned,
    legendaryChanceBonus: legendaryBonus,
    currentRound: save.currentRound + 1,
    totalRoundsPlayed: save.totalRoundsPlayed + 1,
  };
}

function computeMood(moodPoints: number): Player['mood'] {
  if (moodPoints >= 85) return 'motivated';
  if (moodPoints >= 60) return 'happy';
  if (moodPoints >= 35) return 'neutral';
  return 'unhappy';
}

function advanceRound(save: GameSave): GameSave {
  // Deduct weekly wages
  const weeklyWages = save.mySquad.reduce((s, p) => s + p.wage, 0);
  const newBudget = save.budget - weeklyWages;
  const finances = [
    { round: save.currentRound, description: 'Salários semanais', amount: -weeklyWages, category: 'wage' as const },
    ...save.finances,
  ];

  // Lifestyle expenses (monthly, approximate weekly)
  const lifestyleCost = save.mySquad.reduce((s, p) => s + Math.round(p.lifestyleExpenses / 4), 0);

  // Heal injuries
  const mySquad = save.mySquad.map(p => {
    if (!p.injured) return p;
    const remaining = p.injuredForRounds - 1;
    return remaining <= 0 ? { ...p, injured: false, injuredForRounds: 0 } : { ...p, injuredForRounds: remaining };
  });

  // Random event
  const { save: eventSave } = applyRandomEvent({ ...save, mySquad, budget: newBudget - lifestyleCost, finances });

  return eventSave;
}

function persistSave(save: GameSave) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface MBContextValue {
  state: MBState;
  dispatch: React.Dispatch<Action>;
  // Convenience actions
  setScreen: (s: MBScreen) => void;
  selectPlayer: (id: string | null) => void;
  buyPlayer: (p: Player, price: number) => void;
  sellPlayer: (playerId: string, price: number, toTeamName: string) => void;
  setSponsor: (id: string) => void;
  trainPlayer: (playerId: string, cost: number) => void;
  upgradeStadium: (u: StadiumUpgrade) => void;
  playMatch: (fixtureIndex: number) => void;
  dismissNotification: () => void;
}

const MBContext = createContext<MBContextValue | null>(null);

export function MBProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    screen: 'team-select',
    save: null,
    matchPhase: null,
    lastMatchResult: null,
    selectedPlayerId: null,
    notification: null,
  });

  const setScreen = useCallback((s: MBScreen) => dispatch({ type: 'SET_SCREEN', screen: s }), []);
  const selectPlayer = useCallback((id: string | null) => dispatch({ type: 'SELECT_PLAYER', playerId: id }), []);
  const buyPlayer = useCallback((p: Player, price: number) => dispatch({ type: 'BUY_PLAYER', player: p, price }), []);
  const sellPlayer = useCallback((playerId: string, price: number, toTeamName: string) => dispatch({ type: 'SELL_PLAYER', playerId, price, toTeamName }), []);
  const setSponsor = useCallback((id: string) => dispatch({ type: 'SET_SPONSOR', sponsorId: id }), []);
  const trainPlayer = useCallback((playerId: string, cost: number) => dispatch({ type: 'TRAIN_PLAYER', playerId, cost }), []);
  const upgradeStadium = useCallback((u: StadiumUpgrade) => dispatch({ type: 'UPGRADE_STADIUM', upgrade: u }), []);
  const dismissNotification = useCallback(() => dispatch({ type: 'DISMISS_NOTIFICATION' }), []);

  const playMatch = useCallback((fixtureIndex: number) => {
    if (!state.save) return;
    const fixture = state.save.fixtures[fixtureIndex];
    if (!fixture || fixture.played) return;

    const myTeamId = state.save.myTeamId;
    const isHome = fixture.homeTeamId === myTeamId;
    const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
    const opponentTeam = getTeam(opponentId);
    const opponentRating = opponentTeam ? Math.round(opponentTeam.reputation * 0.85) : 60;
    const myDefenseTokens = calcDefenseTokens(state.save.mySquad);
    const sponsor = getSponsor(state.save.sponsorId ?? '');
    const result = simulateMatch({
      mySquad: state.save.mySquad,
      opponentRating,
      myDefenseTokens,
      sponsorWinFee: sponsor?.winFee ?? 20,
      sponsorDrawFee: sponsor?.drawFee ?? 10,
      sponsorLossFee: sponsor?.lossFee ?? 0,
      stadiumCapacity: state.save.stadium.capacity,
      ticketPrice: state.save.stadium.ticketPrice,
      isHome,
      roundSeed: fixtureIndex * 31337 + state.save.currentRound * 7,
    });
    dispatch({ type: 'PLAY_MATCH', result, fixtureIndex });
  }, [state.save]);

  return React.createElement(
    MBContext.Provider,
    { value: { state, dispatch, setScreen, selectPlayer, buyPlayer, sellPlayer, setSponsor, trainPlayer, upgradeStadium, playMatch, dismissNotification } },
    children
  );
}

export function useMB(): MBContextValue {
  const ctx = useContext(MBContext);
  if (!ctx) throw new Error('useMB must be used inside MBProvider');
  return ctx;
}

// ─── Save/Load helpers ────────────────────────────────────────────────────────

export function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameSave;
  } catch { return null; }
}
