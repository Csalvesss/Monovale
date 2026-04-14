import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { syncProgress } from '../services/lendaService';
import type { GameSave, Player, MBScreen, MatchFixture, MatchResult, TransferOffer, StadiumUpgrade, PlayerProfile, PlayerMessage, ManagerProfile, RoundResultSummary } from '../types';
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
  showRoundResults: boolean;
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
  | { type: 'UPDATE_SAVE'; save: GameSave }
  | { type: 'SWITCH_TURN' }
  | { type: 'SET_MANAGER_PROFILE'; profile: ManagerProfile; save: GameSave }
  | { type: 'READ_MESSAGE'; messageId: string }
  | { type: 'RESPOND_MESSAGE'; messageId: string; responseIndex: number }
  | { type: 'DISMISS_ROUND_RESULTS' }
  | { type: 'ACCEPT_OFFER'; offerId: string }
  | { type: 'REJECT_OFFER'; offerId: string };
// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: MBState, action: Action): MBState {
  switch (action.type) {
    case 'LOAD_SAVE': {
      const migratedSave: GameSave = {
        mode: 'solo',
        currentTurn: 1,
        playerProfiles: null,
        randomSeed: Math.floor(Math.random() * 1_000_000),
        playerMessages: [],
        unreadMessages: 0,
        ...action.save,
      };
      return { ...state, save: migratedSave, screen: 'home' };
    }
    case 'START_NEW_GAME':
      // If no manager profile yet, go to onboarding; otherwise go home
      return {
        ...state,
        save: action.save,
        screen: action.save.managerProfile ? 'home' : 'onboarding',
      };

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
        showRoundResults: true,
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

    case 'SWITCH_TURN': {
      if (!state.save) return state;
      const nextTurn: 1 | 2 = state.save.currentTurn === 1 ? 2 : 1;
      const updatedSave = { ...state.save, currentTurn: nextTurn };
      persistSave(updatedSave);
      return { ...state, save: updatedSave, screen: 'turn-handoff' };
    }

    case 'SET_MANAGER_PROFILE': {
      persistSave(action.save);
      return { ...state, save: action.save, screen: 'home' };
    }

    case 'READ_MESSAGE': {
      if (!state.save) return state;
      const msgs = state.save.playerMessages.map(m =>
        m.id === action.messageId ? { ...m, read: true } : m
      );
      const unread = msgs.filter(m => !m.read).length;
      const updatedSave = { ...state.save, playerMessages: msgs, unreadMessages: unread };
      persistSave(updatedSave);
      return { ...state, save: updatedSave };
    }

    case 'RESPOND_MESSAGE': {
      if (!state.save) return state;
      const msgs = state.save.playerMessages.map(m => {
        if (m.id !== action.messageId) return m;
        const resp = m.responses[action.responseIndex];
        return { ...m, responded: true, read: true };
      });
      // Apply mood/loyalty deltas to the player
      const msg = state.save.playerMessages.find(m => m.id === action.messageId);
      let squad = state.save.mySquad;
      if (msg) {
        const resp = msg.responses[action.responseIndex];
        if (resp) {
          squad = squad.map(p => {
            if (p.id !== msg.playerId) return p;
            const newMoodPts = Math.max(0, Math.min(100, p.moodPoints + resp.moralDelta));
            return { ...p, moodPoints: newMoodPts };
          });
        }
      }
      const unread = msgs.filter(m => !m.read).length;
      const updatedSave = { ...state.save, playerMessages: msgs, mySquad: squad, unreadMessages: unread };
      persistSave(updatedSave);
      return { ...state, save: updatedSave };
    }

    case 'DISMISS_ROUND_RESULTS':
      return { ...state, showRoundResults: false };

    case 'ACCEPT_OFFER': {
      if (!state.save) return state;
      const offer = state.save.pendingOffers.find(o => o.id === action.offerId);
      if (!offer) return state;
      const player = state.save.mySquad.find(p => p.id === offer.playerId);
      if (!player) return state;
      const newSquad = state.save.mySquad.filter(p => p.id !== offer.playerId);
      const newAllPlayers = state.save.allPlayers.map(p =>
        p.id === offer.playerId ? { ...p, currentTeamId: offer.fromTeamId } : p
      );
      const newBudget = state.save.budget + offer.offerAmount;
      const newOffers = state.save.pendingOffers.filter(o => o.id !== action.offerId);
      const updatedSave = { ...state.save, mySquad: newSquad, allPlayers: newAllPlayers, budget: newBudget, pendingOffers: newOffers };
      persistSave(updatedSave);
      return { ...state, save: updatedSave };
    }

    case 'REJECT_OFFER': {
      if (!state.save) return state;
      const newOffers = state.save.pendingOffers.filter(o => o.id !== action.offerId);
      const updatedSave = { ...state.save, pendingOffers: newOffers };
      persistSave(updatedSave);
      return { ...state, save: updatedSave };
    }

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

  const playerRound = fixture.round;

  // Update player's fixture
  let updatedFixtures = save.fixtures.map((f, i) => i === fixtureIndex ? { ...f, result, played: true } : f);

  // Update standings for player's match
  const myTeamId = save.myTeamId;
  const isHome = fixture.homeTeamId === myTeamId;
  const myGoals = isHome ? result.homeGoals : result.awayGoals;
  const opGoals = isHome ? result.awayGoals : result.homeGoals;
  const iWon = myGoals > opGoals;
  const isDraw = myGoals === opGoals;
  const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;

  let updatedStandings = save.standings.map(s => {
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

  // ── CPU vs CPU: simulate all other fixtures in this round ──
  const cpuRoundResults: RoundResultSummary['fixtures'] = [{
    homeTeamId: fixture.homeTeamId,
    awayTeamId: fixture.awayTeamId,
    homeGoals: result.homeGoals,
    awayGoals: result.awayGoals,
  }];

  const otherRoundFixtures = save.fixtures.filter(
    (f, i) => i !== fixtureIndex && f.round === playerRound && !f.played
  );

  for (const cpuFixture of otherRoundFixtures) {
    const teamA = getTeam(cpuFixture.homeTeamId);
    const teamB = getTeam(cpuFixture.awayTeamId);
    const ratingA = teamA ? Math.round(teamA.reputation * 0.85) : 60;
    const ratingB = teamB ? Math.round(teamB.reputation * 0.85) : 60;
    const seed = playerRound * 9973 +
      (cpuFixture.homeTeamId.charCodeAt(0) * 31) +
      (cpuFixture.awayTeamId.charCodeAt(0) * 17);
    const { goalsA, goalsB } = quickSimulate(ratingA, ratingB, seed);

    const cpuMatchResult: MatchResult = {
      homeGoals: goalsA,
      awayGoals: goalsB,
      winner: goalsA > goalsB ? 'home' : goalsA < goalsB ? 'away' : 'draw',
      sponsorEarned: 0,
      xpEarned: {},
      ticketRevenue: 0,
    };

    // Mark fixture as played
    updatedFixtures = updatedFixtures.map(f =>
      f.homeTeamId === cpuFixture.homeTeamId &&
      f.awayTeamId === cpuFixture.awayTeamId &&
      f.round === cpuFixture.round
        ? { ...f, result: cpuMatchResult, played: true }
        : f
    );

    cpuRoundResults.push({
      homeTeamId: cpuFixture.homeTeamId,
      awayTeamId: cpuFixture.awayTeamId,
      homeGoals: goalsA,
      awayGoals: goalsB,
    });

    // Update standings for both CPU teams
    const homeWon = goalsA > goalsB;
    const cpuDraw = goalsA === goalsB;
    const awayWon = goalsB > goalsA;

    updatedStandings = updatedStandings.map(s => {
      if (s.teamId === cpuFixture.homeTeamId) {
        return {
          ...s,
          played: s.played + 1,
          won: s.won + (homeWon ? 1 : 0),
          drawn: s.drawn + (cpuDraw ? 1 : 0),
          lost: s.lost + (awayWon ? 1 : 0),
          goalsFor: s.goalsFor + goalsA,
          goalsAgainst: s.goalsAgainst + goalsB,
          points: s.points + (homeWon ? 3 : cpuDraw ? 1 : 0),
        };
      }
      if (s.teamId === cpuFixture.awayTeamId) {
        return {
          ...s,
          played: s.played + 1,
          won: s.won + (awayWon ? 1 : 0),
          drawn: s.drawn + (cpuDraw ? 1 : 0),
          lost: s.lost + (homeWon ? 1 : 0),
          goalsFor: s.goalsFor + goalsB,
          goalsAgainst: s.goalsAgainst + goalsA,
          points: s.points + (awayWon ? 3 : cpuDraw ? 1 : 0),
        };
      }
      return s;
    });
  }

  const lastRoundResults: RoundResultSummary = { round: playerRound, fixtures: cpuRoundResults };

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
    lastRoundResults,
  };
}

function computeMood(moodPoints: number): Player['mood'] {
  if (moodPoints >= 85) return 'motivated';
  if (moodPoints >= 60) return 'happy';
  if (moodPoints >= 35) return 'neutral';
  return 'unhappy';
}

function generatePlayerMessages(save: GameSave): PlayerMessage[] {
  const newMessages: PlayerMessage[] = [];
  const existing = save.playerMessages ?? [];

  for (const player of save.mySquad) {
    // Skip if player already sent a message this round
    const recentMsg = existing.find(m => m.playerId === player.id && m.round >= save.currentRound - 1);
    if (recentMsg) continue;

    // 1. Bench streak — 3+ games on bench (low moodPoints after MOOD_BENCH_PENALTY)
    if (player.moodPoints <= 30 && !player.injured && Math.random() < 0.6) {
      newMessages.push({
        id: `msg-${Date.now()}-${player.id}-bench`,
        playerId: player.id,
        playerName: player.name,
        playerFlag: player.flag,
        content: pickFrom([
          `Manager, estou treinando muito e me sinto pronto. Por que não me usa nas partidas?`,
          `Vim para este clube para jogar, não para ficar observando do banco.`,
          `Tenho trabalhado duro. Só queria entender o critério de escalação.`,
        ]),
        mood: 'com_raiva',
        type: 'bench_streak',
        read: false,
        round: save.currentRound,
        timestamp: Date.now(),
        responses: [
          { text: 'Você é importante, mas precisa esperar seu momento.', moralDelta: 0, loyaltyDelta: 0 },
          { text: 'Vai jogar na próxima partida, prometo.', moralDelta: 15, loyaltyDelta: 5 },
          { text: 'Entendo sua frustração, mas a decisão é técnica.', moralDelta: -5, loyaltyDelta: 2 },
        ],
      });
    }

    // 2. Contract expiring — 1 season left
    if (player.contractExpiresIn <= 1 && Math.random() < 0.5) {
      newMessages.push({
        id: `msg-${Date.now()}-${player.id}-contract`,
        playerId: player.id,
        playerName: player.name,
        playerFlag: player.flag,
        content: pickFrom([
          `Meu contrato está acabando. Existe interesse do clube em renovar?`,
          `Estou esperando uma sinalização do clube sobre meu futuro aqui.`,
          `Já estou conversando com outros clubes. Mas prefiro ficar se houver proposta.`,
        ]),
        mood: 'insatisfeito',
        type: 'contract_expiring',
        read: false,
        round: save.currentRound,
        timestamp: Date.now() + 100,
        responses: [
          { text: 'Vamos renovar sim! Você é parte do nosso projeto.', moralDelta: 20, loyaltyDelta: 15 },
          { text: 'Ainda estamos avaliando. Preciso de mais tempo.', moralDelta: -5, loyaltyDelta: -5 },
          { text: 'Se tiver proposta melhor, pode analisar.', moralDelta: -10, loyaltyDelta: -20 },
        ],
      });
    }

    // 3. Happy / scoring streak — high moodPoints
    if (player.moodPoints >= 85 && Math.random() < 0.25) {
      newMessages.push({
        id: `msg-${Date.now()}-${player.id}-happy`,
        playerId: player.id,
        playerName: player.name,
        playerFlag: player.flag,
        content: pickFrom([
          `Estou muito feliz aqui! Esse clube me faz jogar meu melhor futebol.`,
          `Manager, obrigado pela confiança. Vou dar o máximo em campo!`,
          `Nunca estive tão confiante. Estou pronto para qualquer desafio!`,
        ]),
        mood: 'muito_feliz',
        type: 'general',
        read: false,
        round: save.currentRound,
        timestamp: Date.now() + 200,
        responses: [
          { text: 'Fico feliz em ouvir isso! Continue assim.', moralDelta: 5, loyaltyDelta: 5 },
          { text: 'Excelente! O clube conta com você.', moralDelta: 8, loyaltyDelta: 8 },
        ],
      });
    }

    // 4. Injury return
    if (!player.injured && player.injuredForRounds === 0 &&
        existing.find(m => m.playerId === player.id && m.type === 'injury_return') === undefined &&
        Math.random() < 0.3) {
      // Only trigger once after returning from injury; check if player was recently injured
      // (rough heuristic: low XP player with moodPoints just recovering)
      if (player.moodPoints >= 40 && player.moodPoints <= 60 && Math.random() < 0.15) {
        newMessages.push({
          id: `msg-${Date.now()}-${player.id}-injreturn`,
          playerId: player.id,
          playerName: player.name,
          playerFlag: player.flag,
          content: pickFrom([
            `Estou 100% recuperado e ansioso para voltar a jogar!`,
            `Esses meses foram difíceis, mas a fisioterapia foi incrível. Estou pronto!`,
            `Lesão superada. Só preciso de ritmo de jogo. Por favor, me escale!`,
          ]),
          mood: 'feliz',
          type: 'injury_return',
          read: false,
          round: save.currentRound,
          timestamp: Date.now() + 300,
          responses: [
            { text: 'Bem-vindo de volta! Vai jogar em breve.', moralDelta: 15, loyaltyDelta: 10 },
            { text: 'Preciso te ver treinar mais um pouco primeiro.', moralDelta: -5, loyaltyDelta: 0 },
          ],
        });
      }
    }
  }

  return newMessages;
}

function generateIncomingOffer(save: GameSave): TransferOffer | null {
  if (save.mySquad.length === 0 || Math.random() > 0.2) return null;
  // Target a random player from squad
  const candidates = save.mySquad.filter(p => p.stars >= 3);
  if (candidates.length === 0) return null;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const offeringTeams = ALL_TEAMS.filter(t => t.id !== save.myTeamId);
  const offeringTeam = offeringTeams[Math.floor(Math.random() * offeringTeams.length)];
  if (!offeringTeam) return null;
  const offerAmount = Math.round(target.marketValue * (0.8 + Math.random() * 0.6));
  return {
    id: `offer-${Date.now()}-${target.id}`,
    playerId: target.id,
    fromTeamId: offeringTeam.id,
    toTeamId: save.myTeamId,
    offerAmount,
    status: 'pending',
    round: save.currentRound,
  };
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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

  // Generate player messages
  const newMessages = generatePlayerMessages(eventSave);
  const allMessages = [...newMessages, ...(eventSave.playerMessages ?? [])].slice(0, 30);
  const unreadMessages = allMessages.filter(m => !m.read).length;

  // Maybe generate incoming offer
  const incomingOffer = generateIncomingOffer(eventSave);
  const pendingOffers = incomingOffer
    ? [incomingOffer, ...eventSave.pendingOffers.filter(o => o.status === 'pending')]
    : eventSave.pendingOffers.filter(o => o.status === 'pending');

  return {
    ...eventSave,
    playerMessages: allMessages,
    unreadMessages,
    pendingOffers,
  };
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
  switchTurn: () => void;
  dismissNotification: () => void;
  setManagerProfile: (profile: ManagerProfile, save: GameSave) => void;
  readMessage: (messageId: string) => void;
  respondMessage: (messageId: string, responseIndex: number) => void;
  dismissRoundResults: () => void;
  acceptOffer: (offerId: string) => void;
  rejectOffer: (offerId: string) => void;
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
    showRoundResults: false,
  });

  const setScreen = useCallback((s: MBScreen) => dispatch({ type: 'SET_SCREEN', screen: s }), []);
  const selectPlayer = useCallback((id: string | null) => dispatch({ type: 'SELECT_PLAYER', playerId: id }), []);
  const buyPlayer = useCallback((p: Player, price: number) => dispatch({ type: 'BUY_PLAYER', player: p, price }), []);
  const sellPlayer = useCallback((playerId: string, price: number, toTeamName: string) => dispatch({ type: 'SELL_PLAYER', playerId, price, toTeamName }), []);
  const setSponsor = useCallback((id: string) => dispatch({ type: 'SET_SPONSOR', sponsorId: id }), []);
  const trainPlayer = useCallback((playerId: string, cost: number) => dispatch({ type: 'TRAIN_PLAYER', playerId, cost }), []);
  const upgradeStadium = useCallback((u: StadiumUpgrade) => dispatch({ type: 'UPGRADE_STADIUM', upgrade: u }), []);
  const dismissNotification = useCallback(() => dispatch({ type: 'DISMISS_NOTIFICATION' }), []);
  const switchTurn = useCallback(() => dispatch({ type: 'SWITCH_TURN' }), []);
  const setManagerProfile = useCallback((profile: ManagerProfile, save: GameSave) => dispatch({ type: 'SET_MANAGER_PROFILE', profile, save }), []);
  const readMessage = useCallback((messageId: string) => dispatch({ type: 'READ_MESSAGE', messageId }), []);
  const respondMessage = useCallback((messageId: string, responseIndex: number) => dispatch({ type: 'RESPOND_MESSAGE', messageId, responseIndex }), []);
  const dismissRoundResults = useCallback(() => dispatch({ type: 'DISMISS_ROUND_RESULTS' }), []);
  const acceptOffer = useCallback((offerId: string) => dispatch({ type: 'ACCEPT_OFFER', offerId }), []);
  const rejectOffer = useCallback((offerId: string) => dispatch({ type: 'REJECT_OFFER', offerId }), []);
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
      roundSeed: fixtureIndex * 31337 + state.save.currentRound * 7 + (state.save.randomSeed ?? 0),
    });
    dispatch({ type: 'PLAY_MATCH', result, fixtureIndex });
  }, [state.save]);

  return React.createElement(
    MBContext.Provider,
    { value: { state, dispatch, setScreen, selectPlayer, buyPlayer, sellPlayer, setSponsor, trainPlayer, upgradeStadium, playMatch, switchTurn, dismissNotification, setManagerProfile, readMessage, respondMessage, dismissRoundResults, acceptOffer, rejectOffer } },
    children,
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
