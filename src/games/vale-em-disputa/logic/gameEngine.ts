// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Game Engine
// Core game logic: initialization, turn management, win conditions
// ─────────────────────────────────────────────────────────────────────────────

import type {
  GameState, Player, Territory, Mission, MissionId, LogEntry, ActiveEffect, FactionId,
} from '../types';
import {
  ALL_CITY_NAMES, REGIONS, CITY_REGION, getCityGold,
  TERRITORY_CARD_SYMBOL, getTradeBonus, MISSIONS, isBorderCity,
  FACTIONS, ADJACENCIES, areAdjacent, LITORAL_NORTE_CITIES, EVENT_CARDS,
} from '../constants';
import { resolveCombat } from './combatEngine';

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function logEntry(text: string, type: LogEntry['type'] = 'system'): LogEntry {
  return { id: generateId(), text, timestamp: Date.now(), type };
}

// ── Win condition check ───────────────────────────────────────────────────────

export function checkWinCondition(state: GameState, playerId: string): boolean {
  const player = state.players[playerId];
  if (!player || player.eliminated) return false;
  const mission = player.mission;
  const territories = state.territories;

  // Get cities controlled by this player
  const myCities = Object.entries(territories)
    .filter(([, t]) => t.owner === playerId)
    .map(([city]) => city);

  switch (mission.id as MissionId) {
    case 'control_r1_r5': {
      const r1 = REGIONS[0].cities;
      const r5 = REGIONS[4].cities;
      return (
        r1.every(c => territories[c]?.owner === playerId && territories[c].troops >= 2) &&
        r5.every(c => territories[c]?.owner === playerId && territories[c].troops >= 2)
      );
    }
    case 'eliminate_player': {
      const target = mission.targetPlayerId;
      if (!target) return false;
      const targetPlayer = state.players[target];
      return targetPlayer?.eliminated === true;
    }
    case 'control_18_cities':
      return myCities.length >= 18;

    case 'control_r3_r4': {
      const r3 = REGIONS[2].cities;
      const r4 = REGIONS[3].cities;
      return (
        r3.every(c => territories[c]?.owner === playerId) &&
        r4.every(c => territories[c]?.owner === playerId)
      );
    }
    case 'control_12_with_3':
      return myCities.filter(c => territories[c].troops >= 3).length >= 12;

    case 'accumulate_gold':
      return player.gold >= 45;

    default:
      return false;
  }
}

// Domination win: owns all territories
export function checkDominationWin(state: GameState, playerId: string): boolean {
  return Object.values(state.territories).every(t => t.owner === playerId);
}

// ── Reinforcement calculation ─────────────────────────────────────────────────

export function calculateReinforcements(
  state: GameState,
  playerId: string,
  ignoreRegionBonus = false
): number {
  const territories = state.territories;
  const myCities = Object.keys(territories).filter(c => territories[c].owner === playerId);
  let base = Math.max(3, Math.floor(myCities.length / 3));

  if (!ignoreRegionBonus) {
    // Check active effects that might block region bonus
    const hasSerranosPenalty = state.activeEffects.some(
      e => e.type === 'seca_serra' && e.targetPlayerId === playerId
    );

    if (!hasSerranosPenalty) {
      for (const region of REGIONS) {
        if (region.cities.every(c => territories[c]?.owner === playerId)) {
          base += 2;
        }
      }
    } else {
      // Only one region loses bonus — simplified: all regions still count except one penalized
      // For simplicity, just subtract 2 if any region bonus would apply
      for (const region of REGIONS) {
        if (region.cities.every(c => territories[c]?.owner === playerId)) {
          base += 2;
        }
      }
      base -= 2; // remove one region's bonus
      base = Math.max(3, base);
    }
  }

  // Check corte_abastecimento effect
  const hasCorte = state.activeEffects.some(
    e => e.type === 'corte_abastecimento' && e.targetPlayerId === playerId
  );
  if (hasCorte) {
    base = Math.max(3, Math.floor(base / 2));
  }

  return base;
}

// ── Game initialization ───────────────────────────────────────────────────────

interface InitGameParams {
  gameId: string;
  code: string;
  players: { id: string; name: string; faction: FactionId }[];
}

export function initGame({ gameId, code, players }: InitGameParams): GameState {
  // Shuffle cities and distribute
  const shuffledCities = shuffle(ALL_CITY_NAMES);
  const territories: Record<string, Territory> = {};
  ALL_CITY_NAMES.forEach(city => { territories[city] = { owner: null, troops: 1 }; });

  const playerCount = players.length;
  shuffledCities.forEach((city, i) => {
    territories[city].owner = players[i % playerCount].id;
  });

  // Shuffle missions
  const missionIds: MissionId[] = [
    'control_r1_r5', 'eliminate_player', 'control_18_cities',
    'control_r3_r4', 'control_12_with_3', 'accumulate_gold',
  ];
  const shuffledMissions = shuffle(missionIds);

  // Shuffle event deck
  const eventDeck = shuffle(EVENT_CARDS.map(c => c.id));

  // Shuffle territory deck
  const territoryDeck = shuffle([...ALL_CITY_NAMES]);

  // Build players
  const playersRecord: Record<string, Player> = {};
  const playerOrder = players.map(p => p.id);

  players.forEach((p, idx) => {
    const missionId = shuffledMissions[idx % missionIds.length] as MissionId;

    // For eliminate_player, pick a random other player
    let targetPlayerId: string | undefined;
    if (missionId === 'eliminate_player') {
      const others = players.filter(op => op.id !== p.id);
      if (others.length > 0) {
        targetPlayerId = others[Math.floor(Math.random() * others.length)].id;
      }
    }

    const mission: Mission = {
      id: missionId,
      title: MISSIONS[missionId].title,
      description: MISSIONS[missionId].description,
      targetPlayerId,
    };

    // Históricos start with 1 territory card
    let hand: string[] = [];
    if (p.faction === 'historicos' && territoryDeck.length > 0) {
      hand = [territoryDeck.shift()!];
    }

    playersRecord[p.id] = {
      id: p.id,
      name: p.name,
      faction: p.faction,
      gold: 0,
      combatWins: 0,
      hand,
      mission,
      eliminated: false,
      factionPowerUsed: false,
      pendingPowerAvailable: false,
    };
  });

  const log: LogEntry[] = [
    logEntry('Partida iniciada! Vale em Disputa começa agora.', 'system'),
    ...players.map(p =>
      logEntry(`${p.name} (${FACTIONS[p.faction].name}) está na batalha!`, 'system')
    ),
  ];

  return {
    id: gameId,
    code,
    status: 'playing',
    currentTurn: playerOrder[0],
    currentPhase: 'reinforce',
    round: 1,
    playerOrder,
    players: playersRecord,
    territories,
    eventDeck,
    territoryDeck,
    usedTerritoryCards: [],
    tradeCount: 0,
    activeEffects: [],
    pendingEventChoice: null,
    conqueredThisTurn: false,
    log,
    winner: null,
    winReason: null,
  };
}

// ── Turn management ────────────────────────────────────────────────────────────

export function getNextPlayer(state: GameState): string {
  const order = state.playerOrder;
  const idx = order.indexOf(state.currentTurn);
  let next = (idx + 1) % order.length;
  // Skip eliminated players
  while (state.players[order[next]]?.eliminated && next !== idx) {
    next = (next + 1) % order.length;
  }
  return order[next];
}

// Expire active effects whose turn has passed
function expireEffects(state: GameState): ActiveEffect[] {
  return state.activeEffects.filter(e => e.expiresAfterTurn >= state.round);
}

// ── Phase transitions ─────────────────────────────────────────────────────────

export function advancePhase(state: GameState): GameState {
  const phases: GameState['currentPhase'][] = ['reinforce', 'attack', 'move', 'end'];
  const idx = phases.indexOf(state.currentPhase);

  if (idx < phases.length - 1) {
    return { ...state, currentPhase: phases[idx + 1] };
  }

  // End of turn: move to next player
  const nextPlayer = getNextPlayer(state);
  const newRound = nextPlayer === state.playerOrder[0] ? state.round + 1 : state.round;

  // Give territory card if player conquered at least 1 city this turn
  let newState = { ...state };
  if (state.conqueredThisTurn && !hasEffect(state, 'interdicao_queluz', state.currentTurn)) {
    newState = drawTerritoryCard(newState, state.currentTurn);
  }

  const activeEffects = expireEffects({ ...newState, round: newRound });

  return {
    ...newState,
    currentTurn: nextPlayer,
    currentPhase: 'reinforce',
    round: newRound,
    conqueredThisTurn: false,
    activeEffects,
    log: [
      ...newState.log,
      logEntry(`Turno de ${newState.players[nextPlayer]?.name ?? nextPlayer} começa.`, 'system'),
    ],
  };
}

// ── Reinforce ─────────────────────────────────────────────────────────────────

export function placeReinforcement(
  state: GameState,
  playerId: string,
  city: string,
  troops: number
): GameState {
  if (state.territories[city]?.owner !== playerId) return state;

  const newTerritories = {
    ...state.territories,
    [city]: { ...state.territories[city], troops: state.territories[city].troops + troops },
  };

  return {
    ...state,
    territories: newTerritories,
    log: [...state.log, logEntry(`${state.players[playerId].name} reforçou ${city} com ${troops} tropa(s).`, 'reinforce')],
  };
}

// ── Attack ─────────────────────────────────────────────────────────────────────

export interface AttackOptions {
  fromCity: string;
  toCity: string;
  ignoreAdjacency?: boolean;
  attackBonus?: number;
  rerollAttack?: boolean;
}

export function performAttack(
  state: GameState,
  playerId: string,
  opts: AttackOptions
): { state: GameState; result: ReturnType<typeof resolveCombat> | null } {
  const { fromCity, toCity, ignoreAdjacency = false, attackBonus = 0, rerollAttack = false } = opts;

  const fromT = state.territories[fromCity];
  const toT = state.territories[toCity];

  if (!fromT || !toT) return { state, result: null };
  if (fromT.owner !== playerId) return { state, result: null };
  if (toT.owner === playerId) return { state, result: null };
  if (fromT.troops < 2) return { state, result: null };

  // Adjacency check
  if (!ignoreAdjacency && !areAdjacent(fromCity, toCity)) return { state, result: null };

  // Litorâneos passive: R5 cities can only be attacked from R1 or R2
  if (LITORAL_NORTE_CITIES.has(toCity)) {
    const defenderFaction = toT.owner ? state.players[toT.owner]?.faction : null;
    const attackerFromRegion = CITY_REGION[fromCity];
    const litoraneosOwnsDefender = toT.owner && state.players[toT.owner]?.faction === 'litoraneos';
    if (!ignoreAdjacency && litoraneosOwnsDefender && attackerFromRegion !== 1 && attackerFromRegion !== 2) {
      return { state, result: null };
    }
    void defenderFaction; // suppress unused warning
  }

  // Serranos passive: attacker needs +2 difference
  const defenderFaction = toT.owner ? state.players[toT.owner]?.faction : null;
  const serranosDefending = defenderFaction === 'serranos';

  // Frozen city check
  const cityFrozen = state.activeEffects.some(
    e => (e.type === 'fortaleza_jacarei' || e.type === 'pico_mantiqueira' || e.type === 'faction_freeze') &&
         e.targetCity === toCity
  );
  if (cityFrozen) return { state, result: null };

  const result = resolveCombat(fromT.troops, toT.troops, {
    serranosDefending,
    attackBonus,
    rerollAttack,
  });

  let newFromTroops = fromT.troops - result.attackerLosses;
  let newToTroops = toT.troops - result.defenderLosses;
  let newOwner = toT.owner;
  let conquered = false;
  let newLog = [...state.log];
  let newPlayers = { ...state.players };
  let newTerritories = { ...state.territories };
  let newConqueredThisTurn = state.conqueredThisTurn;

  if (result.conquered) {
    // Move at least 1 troop (attackerDiceCount) into conquered city
    const movingTroops = Math.min(newFromTroops - 1, result.attackerDice.length);
    newFromTroops = newFromTroops - movingTroops;
    newToTroops = movingTroops;
    newOwner = playerId;
    conquered = true;
    newConqueredThisTurn = true;

    // Gold: player gains gold for conquered city
    const goldGain = getCityGold(toCity);
    newPlayers[playerId] = {
      ...newPlayers[playerId],
      gold: newPlayers[playerId].gold + goldGain,
      combatWins: newPlayers[playerId].combatWins + 1,
    };

    // Former owner loses 1 gold
    if (toT.owner && newPlayers[toT.owner]) {
      newPlayers[toT.owner] = {
        ...newPlayers[toT.owner],
        gold: Math.max(0, newPlayers[toT.owner].gold - 1),
      };
    }

    // Check if former owner is eliminated
    const formerOwner = toT.owner;
    if (formerOwner) {
      const formerOwnerCitiesLeft = Object.entries(newTerritories)
        .filter(([c, t]) => c !== toCity && t.owner === formerOwner).length;
      if (formerOwnerCitiesLeft === 0) {
        // Eliminate player and transfer their cards & gold to attacker
        const eliminated = newPlayers[formerOwner];
        newPlayers[playerId] = {
          ...newPlayers[playerId],
          gold: newPlayers[playerId].gold + eliminated.gold,
          hand: [...newPlayers[playerId].hand, ...eliminated.hand],
        };
        newPlayers[formerOwner] = { ...eliminated, eliminated: true, gold: 0, hand: [] };
        newLog.push(logEntry(
          `${newPlayers[playerId].name} eliminou ${eliminated.name}! Herda ouro e cartas.`,
          'combat'
        ));
      }
    }

    // Check faction power threshold
    if (newPlayers[playerId].combatWins >= 3) {
      newPlayers[playerId] = { ...newPlayers[playerId], pendingPowerAvailable: true };
    }

    newLog.push(logEntry(
      `${state.players[playerId].name} conquistou ${toCity} de ${toT.owner ? state.players[toT.owner]?.name : 'neutro'}! (+${goldGain} ouro)`,
      'combat'
    ));
  } else {
    // Attacker wins combat but doesn't conquer
    if (result.defenderLosses > 0) {
      newPlayers[playerId] = {
        ...newPlayers[playerId],
        combatWins: newPlayers[playerId].combatWins + 1,
      };
      if (newPlayers[playerId].combatWins >= 3) {
        newPlayers[playerId] = { ...newPlayers[playerId], pendingPowerAvailable: true };
      }
    }
    newLog.push(logEntry(
      `${state.players[playerId].name} atacou ${toCity}: -${result.attackerLosses} vs -${result.defenderLosses} tropas.`,
      'combat'
    ));
  }

  newTerritories = {
    ...newTerritories,
    [fromCity]: { ...fromT, troops: newFromTroops },
    [toCity]: { ...toT, troops: Math.max(0, newToTroops), owner: newOwner },
  };

  void conquered;

  // Check win conditions
  let winner = state.winner;
  let winReason = state.winReason;
  if (!winner) {
    if (checkWinCondition({ ...state, territories: newTerritories, players: newPlayers }, playerId)) {
      winner = playerId;
      winReason = `${newPlayers[playerId].name} completou a missão: ${newPlayers[playerId].mission.title}`;
    } else if (checkDominationWin({ ...state, territories: newTerritories }, playerId)) {
      winner = playerId;
      winReason = `${newPlayers[playerId].name} dominou todo o Vale!`;
    }
  }

  return {
    result,
    state: {
      ...state,
      territories: newTerritories,
      players: newPlayers,
      conqueredThisTurn: newConqueredThisTurn,
      log: newLog,
      winner,
      winReason,
      status: winner ? 'finished' : state.status,
    },
  };
}

// ── Move troops ───────────────────────────────────────────────────────────────

export function moveTroops(
  state: GameState,
  playerId: string,
  fromCity: string,
  toCity: string,
  troops: number,
  ignoreAdjacency = false
): GameState {
  const fromT = state.territories[fromCity];
  const toT = state.territories[toCity];

  if (!fromT || !toT) return state;
  if (fromT.owner !== playerId || toT.owner !== playerId) return state;
  if (!ignoreAdjacency && !areAdjacent(fromCity, toCity)) return state;
  if (troops <= 0 || fromT.troops - troops < 1) return state;

  // Check desvio_carvalho penalty
  if (hasEffect(state, 'desvio_carvalho', playerId)) return state;

  return {
    ...state,
    territories: {
      ...state.territories,
      [fromCity]: { ...fromT, troops: fromT.troops - troops },
      [toCity]: { ...toT, troops: toT.troops + troops },
    },
    log: [...state.log, logEntry(`${state.players[playerId].name} moveu ${troops} tropa(s) de ${fromCity} para ${toCity}.`, 'move')],
  };
}

// ── Territory cards ────────────────────────────────────────────────────────────

function drawTerritoryCard(state: GameState, playerId: string): GameState {
  let deck = [...state.territoryDeck];
  let used = [...state.usedTerritoryCards];

  if (deck.length === 0) {
    // Reshuffle
    deck = shuffle(used);
    used = [];
  }

  if (deck.length === 0) return state;

  const card = deck.shift()!;
  return {
    ...state,
    territoryDeck: deck,
    usedTerritoryCards: used,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        hand: [...state.players[playerId].hand, card],
      },
    },
    log: [...state.log, logEntry(`${state.players[playerId].name} recebeu 1 carta de território.`, 'card')],
  };
}

export function tradeTerritoryCards(
  state: GameState,
  playerId: string,
  cardCities: string[]
): GameState {
  if (cardCities.length !== 3) return state;

  const player = state.players[playerId];
  if (!cardCities.every(c => player.hand.includes(c))) return state;

  // Check boicote_lorena
  if (hasEffect(state, 'boicote_lorena', playerId)) return state;

  const symbols = cardCities.map(c => TERRITORY_CARD_SYMBOL[c]);
  const isValidTrade =
    new Set(symbols).size === 3 || // all different
    new Set(symbols).size === 1;   // all same

  if (!isValidTrade) return state;

  const bonus = getTradeBonus(state.tradeCount);
  const newHand = player.hand.filter(c => !cardCities.includes(c));

  return {
    ...state,
    tradeCount: state.tradeCount + 1,
    usedTerritoryCards: [...state.usedTerritoryCards, ...cardCities],
    players: {
      ...state.players,
      [playerId]: { ...player, hand: newHand },
    },
    log: [...state.log, logEntry(`${player.name} trocou 3 cartas por +${bonus} tropas!`, 'card')],
  };
}

// ── Gold actions ──────────────────────────────────────────────────────────────

export function spendGoldForTroops(
  state: GameState,
  playerId: string,
  goldAmount: number
): { state: GameState; troopsGained: number } {
  const player = state.players[playerId];
  if (player.gold < goldAmount) return { state, troopsGained: 0 };
  if (goldAmount % 2 !== 0) return { state, troopsGained: 0 };

  const troopsGained = goldAmount / 2;
  return {
    troopsGained,
    state: {
      ...state,
      players: {
        ...state.players,
        [playerId]: { ...player, gold: player.gold - goldAmount },
      },
      log: [...state.log, logEntry(`${player.name} gastou ${goldAmount} ouros por +${troopsGained} tropa(s).`, 'gold')],
    },
  };
}

// ── Event cards ───────────────────────────────────────────────────────────────

export function triggerEventDraw(state: GameState, playerId: string): GameState {
  // Draw 2 cards from deck, player picks 1
  const deck = [...state.eventDeck];
  if (deck.length < 2) {
    // Not enough cards — just reset deck (no events available)
    return state;
  }

  const card1 = deck.shift()!;
  const card2 = deck.shift()!;

  return {
    ...state,
    eventDeck: deck,
    pendingEventChoice: { cardIds: [card1, card2] },
    players: {
      ...state.players,
      [playerId]: { ...state.players[playerId], combatWins: 0, pendingPowerAvailable: false },
    },
    log: [...state.log, logEntry(`${state.players[playerId].name} acumulou 3 vitórias — escolha uma carta de evento!`, 'card')],
  };
}

export function resolveEventChoice(
  state: GameState,
  playerId: string,
  chosenCardId: string,
  discardedCardId: string
): GameState {
  if (!state.pendingEventChoice) return state;

  // Return discarded card to deck (shuffle back in)
  const newDeck = shuffle([...state.eventDeck, discardedCardId]);

  return {
    ...state,
    eventDeck: newDeck,
    pendingEventChoice: null,
    log: [...state.log, logEntry(`${state.players[playerId].name} escolheu a carta "${chosenCardId}".`, 'card')],
  };
}

// ── Active effects helpers ────────────────────────────────────────────────────

export function hasEffect(state: GameState, type: string, targetPlayerId?: string): boolean {
  return state.activeEffects.some(
    e => e.type === type && (targetPlayerId === undefined || e.targetPlayerId === targetPlayerId)
  );
}

export function addEffect(state: GameState, effect: ActiveEffect): GameState {
  return { ...state, activeEffects: [...state.activeEffects, effect] };
}

export function removeEffect(state: GameState, effectId: string): GameState {
  return { ...state, activeEffects: state.activeEffects.filter(e => e.id !== effectId) };
}

// ── Faction active powers ─────────────────────────────────────────────────────

export function useFactionPower(
  state: GameState,
  playerId: string,
  opts: Record<string, unknown> = {}
): GameState {
  const player = state.players[playerId];
  if (!player.pendingPowerAvailable) return state;
  if (state.currentTurn !== playerId) return state;

  const faction = player.faction;
  let newState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, combatWins: 0, pendingPowerAvailable: false },
    },
  };

  switch (faction) {
    case 'industriais': {
      // Move troops between 2 non-adjacent cities
      const { fromCity, toCity, troops } = opts as { fromCity: string; toCity: string; troops: number };
      if (fromCity && toCity && troops > 0) {
        newState = moveTroops(newState, playerId, fromCity, toCity, troops, true);
      }
      break;
    }
    case 'serranos': {
      // Cancel 1 event card effect this turn
      newState = addEffect(newState, {
        id: generateId(),
        type: 'serranos_cancel',
        targetPlayerId: playerId,
        expiresAfterTurn: state.round,
      });
      break;
    }
    case 'historicos': {
      // Freeze 1 own city (cannot be attacked)
      const { city } = opts as { city: string };
      if (city && newState.territories[city]?.owner === playerId) {
        newState = addEffect(newState, {
          id: generateId(),
          type: 'faction_freeze',
          targetCity: city,
          targetPlayerId: playerId,
          expiresAfterTurn: state.round + 1,
        });
      }
      break;
    }
    case 'fronteiristas': {
      // Steal 1 troop from adjacent enemy city
      const { enemyCity } = opts as { enemyCity: string };
      const enemyT = newState.territories[enemyCity];
      if (enemyCity && enemyT && enemyT.owner !== playerId && enemyT.troops > 1) {
        // Check adjacency to any own city
        const ownCities = Object.entries(newState.territories)
          .filter(([, t]) => t.owner === playerId).map(([c]) => c);
        const adjacent = ownCities.some(c => areAdjacent(c, enemyCity));
        if (adjacent) {
          newState = {
            ...newState,
            territories: {
              ...newState.territories,
              [enemyCity]: { ...enemyT, troops: enemyT.troops - 1 },
            },
          };
          // Move stolen troop to adjacent own city
          const ownAdj = ownCities.find(c => areAdjacent(c, enemyCity));
          if (ownAdj) {
            newState = {
              ...newState,
              territories: {
                ...newState.territories,
                [ownAdj]: { ...newState.territories[ownAdj], troops: newState.territories[ownAdj].troops + 1 },
              },
            };
          }
        }
      }
      break;
    }
    case 'litoraneos': {
      // Grant ignoreAdjacency for attacking coastal city — add effect
      newState = addEffect(newState, {
        id: generateId(),
        type: 'litoraneos_coastal_attack',
        targetPlayerId: playerId,
        expiresAfterTurn: state.round,
      });
      break;
    }
  }

  newState.log = [...newState.log, logEntry(`${player.name} usou o poder da facção ${FACTIONS[faction].name}!`, 'faction')];
  return newState;
}

// ── Simple event card application (for cards that apply immediately) ───────────

export function applySimpleEventCard(
  state: GameState,
  playerId: string,
  cardId: string,
  opts: Record<string, unknown> = {}
): GameState {
  let newState = { ...state };
  const player = newState.players[playerId];

  switch (cardId) {
    case 'ev02': { // Reforço da Dutra: +3 tropas
      const city = opts.city as string;
      if (city && newState.territories[city]?.owner === playerId) {
        newState = placeReinforcement(newState, playerId, city, 3);
      }
      break;
    }
    case 'ev04': { // Temporada em Ilhabela: +1 tropa em cada cidade
      const newT = { ...newState.territories };
      Object.entries(newT).forEach(([c, t]) => {
        if (t.owner === playerId) newT[c] = { ...t, troops: t.troops + 1 };
      });
      newState = { ...newState, territories: newT };
      break;
    }
    case 'ev09': { // Polo Industrial: +1 tropa por 3 cidades
      const myCityCount = Object.values(newState.territories).filter(t => t.owner === playerId).length;
      const bonus = Math.floor(myCityCount / 3);
      if (bonus > 0 && opts.city) {
        newState = placeReinforcement(newState, playerId, opts.city as string, bonus);
      }
      break;
    }
    case 'ev22': { // Blitz na Dutra: target adversário perde 1 tropa por cidade (max 5)
      const targetId = opts.targetPlayerId as string;
      if (targetId && newState.players[targetId]) {
        let losses = 0;
        const newT = { ...newState.territories };
        for (const [c, t] of Object.entries(newT)) {
          if (t.owner === targetId && t.troops > 1 && losses < 5) {
            newT[c] = { ...t, troops: t.troops - 1 };
            losses++;
          }
        }
        newState = { ...newState, territories: newT };
      }
      break;
    }
    default:
      // Complex cards that need UI interaction are handled elsewhere
      newState.log = [...newState.log, logEntry(`${player.name} jogou a carta de evento!`, 'card')];
  }

  return newState;
}

// ── Industriais passive: bonus in R1 ──────────────────────────────────────────

export function getReinforcePassiveBonus(
  playerId: string,
  city: string,
  state: GameState
): number {
  const player = state.players[playerId];
  if (!player) return 0;
  let bonus = 0;

  if (player.faction === 'industriais' && CITY_REGION[city] === 1) bonus += 1;
  if (player.faction === 'fronteiristas' && isBorderCity(city)) bonus += 1;

  return bonus;
}

// ── Check if 5 cards in hand → mandatory trade ────────────────────────────────
export function mustTradeCards(state: GameState, playerId: string): boolean {
  return (state.players[playerId]?.hand?.length ?? 0) >= 5;
}
