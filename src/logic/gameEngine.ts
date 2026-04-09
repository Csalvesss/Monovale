import type {
  GameState,
  Player,
  PropertyState,
  Card,
  AuctionState,
  TradeState,
  LogEntry,
  LobbyConfig,
  TurnPhase,
} from '../types';
import { BOARD_SPACES, GROUP_POSITIONS } from '../data/properties';
import { CHANCE_CARDS, COMMUNITY_CARDS, shuffleDeck } from '../data/cards';
import { calculateRent } from './rentCalculator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _logId = Date.now();
function makeLog(
  text: string,
  type: LogEntry['type'] = 'info'
): LogEntry {
  return { id: String(_logId++), text, type, timestamp: Date.now() };
}

function addLog(state: GameState, text: string, type: LogEntry['type'] = 'info'): GameState {
  return { ...state, log: [makeLog(text, type), ...state.log].slice(0, 100) };
}

function getActivePlayers(players: Player[]): Player[] {
  return players.filter(p => !p.bankrupt);
}

function getOwnedPositions(player: Player, properties: Record<number, PropertyState>): number[] {
  return Object.entries(properties)
    .filter(([, ps]) => ps.ownerId === player.id)
    .map(([pos]) => Number(pos));
}

// ─── Initialise ──────────────────────────────────────────────────────────────

export function initGame(config: LobbyConfig, gameId: string | null = null): GameState {
  const playerList = [...config.players];
  if (config.randomOrder) {
    for (let i = playerList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerList[i], playerList[j]] = [playerList[j], playerList[i]];
    }
  }

  const players: Player[] = playerList.map((p, i) => ({
    id: `player_${i}`,
    name: p.name,
    pawnId: p.pawnId,
    uid: p.uid ?? null,
    position: 0,
    money: 1500,
    jailTurns: 0,
    bankrupt: false,
    getOutOfJailCards: 0,
  }));

  // Build initial property states
  const properties: Record<number, PropertyState> = {};
  for (const space of BOARD_SPACES) {
    if (
      space.type === 'property' ||
      space.type === 'railroad' ||
      space.type === 'utility'
    ) {
      properties[space.position] = {
        position: space.position,
        ownerId: null,
        houses: 0,
        hotel: false,
        mortgaged: false,
      };
    }
  }

  return {
    phase: 'playing',
    turnPhase: 'pre_roll',
    players,
    currentPlayerIndex: 0,
    spaces: BOARD_SPACES,
    properties,
    chanceCards: shuffleDeck(CHANCE_CARDS),
    communityCards: shuffleDeck(COMMUNITY_CARDS),
    dice: null,
    doubleCount: 0,
    pendingPropertyPosition: null,
    pendingCard: null,
    auction: null,
    trade: null,
    log: [makeLog('🎲 Partida iniciada! Bem-vindos ao Monovale!', 'info')],
    winner: null,
    gameId,
  };
}

// ─── Roll Dice ───────────────────────────────────────────────────────────────

export function rollDice(state: GameState): GameState {
  const die1 = Math.ceil(Math.random() * 6);
  const die2 = Math.ceil(Math.random() * 6);
  const isDouble = die1 === die2;
  const player = state.players[state.currentPlayerIndex];

  let newDoubleCount = isDouble ? state.doubleCount + 1 : 0;

  // 3 doubles in a row → go to jail
  if (newDoubleCount >= 3) {
    let s = { ...state, dice: [die1, die2] as [number, number], doubleCount: 0 };
    s = sendToJail(s, player.id, '3 pares seguidos!');
    return { ...s, turnPhase: 'turn_complete' };
  }

  const total = die1 + die2;
  let s = {
    ...state,
    dice: [die1, die2] as [number, number],
    doubleCount: newDoubleCount,
  };

  // Jail logic
  if (player.jailTurns > 0) {
    if (isDouble) {
      // Get out free with double
      s = updatePlayer(s, player.id, { jailTurns: 0 });
      s = addLog(s, `🔓 ${player.name} tirou par e saiu do DETRAN!`, 'jail');
      s = movePlayer(s, player.id, total);
    } else if (player.jailTurns >= 3) {
      // Must pay after 3 turns
      if (player.money >= 50) {
        s = updatePlayer(s, player.id, { money: player.money - 50, jailTurns: 0 });
        s = addLog(s, `💸 ${player.name} pagou R$50 de fiança e saiu do DETRAN.`, 'jail');
        s = movePlayer(s, player.id, total);
      } else {
        // Bankrupt while in jail
        s = addLog(s, `💀 ${player.name} não tem dinheiro para pagar a fiança!`, 'bankrupt');
        s = declareBankruptcy(s, player.id, null);
        return { ...s, turnPhase: 'turn_complete' };
      }
    } else {
      s = updatePlayer(s, player.id, { jailTurns: player.jailTurns + 1 });
      s = addLog(s, `🚔 ${player.name} ficou mais um turno no DETRAN (turno ${player.jailTurns + 1}/3).`, 'jail');
      return { ...s, turnPhase: 'turn_complete' };
    }
  } else {
    s = movePlayer(s, player.id, total);
  }

  return s;
}

// ─── Move Player ─────────────────────────────────────────────────────────────

function movePlayer(state: GameState, playerId: string, steps: number): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const oldPos = player.position;
  const newPos = (oldPos + steps) % 40;

  // Passed GO?
  if (newPos < oldPos && oldPos !== 0) {
    const playerNow = state.players.find(p => p.id === playerId)!;
    state = updatePlayer(state, playerId, { money: playerNow.money + 200 });
    state = addLog(
      state,
      `🛣️ ${playerNow.name} passou pelo Pedágio da Dutra! Sr. Marinho entregou R$200.`,
      'bank'
    );
  }

  state = updatePlayer(state, playerId, { position: newPos });
  return resolveSpace(state, playerId, newPos);
}

function movePlayerTo(state: GameState, playerId: string, position: number, collectGo: boolean): GameState {
  const player = state.players.find(p => p.id === playerId)!;

  if (collectGo && position <= player.position && position !== player.position) {
    state = updatePlayer(state, playerId, { money: player.money + 200 });
    state = addLog(
      state,
      `🛣️ ${player.name} passou pelo Pedágio da Dutra! Sr. Marinho entregou R$200.`,
      'bank'
    );
  }

  state = updatePlayer(state, playerId, { position });
  return resolveSpace(state, playerId, position);
}

// ─── Resolve Space ───────────────────────────────────────────────────────────

function resolveSpace(state: GameState, playerId: string, position: number): GameState {
  const space = state.spaces[position];
  const player = state.players.find(p => p.id === playerId)!;

  switch (space.type) {
    case 'go':
      return { ...state, turnPhase: 'turn_complete' };

    case 'jail':
      // Just visiting — do nothing
      state = addLog(state, `👀 ${player.name} está de visita no DETRAN.`, 'info');
      return { ...state, turnPhase: 'turn_complete' };

    case 'free_parking':
      state = addLog(state, `🏔️ ${player.name} descansou no Mirante do Vale.`, 'info');
      return { ...state, turnPhase: 'turn_complete' };

    case 'go_to_jail':
      state = sendToJail(state, playerId, 'parou na Multa da Via Dutra');
      return { ...state, turnPhase: 'turn_complete' };

    case 'income_tax': {
      const tax = Math.min(200, Math.floor(player.money * 0.1));
      const amount = space.taxAmount ?? 200;
      state = chargeMoney(state, playerId, amount, null);
      if (!state.players.find(p => p.id === playerId)?.bankrupt) {
        state = addLog(state, `💸 ${player.name} pagou R$${amount} de Imposto de Renda ao Sr. Marinho.`, 'bank');
      }
      return { ...state, turnPhase: 'turn_complete' };
    }

    case 'luxury_tax': {
      const amount = space.taxAmount ?? 100;
      state = chargeMoney(state, playerId, amount, null);
      if (!state.players.find(p => p.id === playerId)?.bankrupt) {
        state = addLog(state, `🛣️ ${player.name} pagou R$${amount} de Pedágio do Anel Viário.`, 'bank');
      }
      return { ...state, turnPhase: 'turn_complete' };
    }

    case 'chance': {
      const [card, ...rest] = state.chanceCards;
      state = { ...state, chanceCards: rest.length ? rest : shuffleDeck(CHANCE_CARDS), pendingCard: card };
      state = addLog(state, `🎟️ ${player.name} comprou um Bilhete da Fortuna: "${card.text}"`, 'card');
      return { ...state, turnPhase: 'card_drawn' };
    }

    case 'community_chest': {
      const [card, ...rest] = state.communityCards;
      state = { ...state, communityCards: rest.length ? rest : shuffleDeck(COMMUNITY_CARDS), pendingCard: card };
      state = addLog(state, `📬 ${player.name} recebeu uma Voz do Vale: "${card.text}"`, 'card');
      return { ...state, turnPhase: 'card_drawn' };
    }

    case 'property':
    case 'railroad':
    case 'utility': {
      const propState = state.properties[position];
      if (!propState) return { ...state, turnPhase: 'turn_complete' };

      if (!propState.ownerId) {
        // Unowned — offer to buy
        return { ...state, turnPhase: 'buy_decision', pendingPropertyPosition: position };
      }

      if (propState.ownerId === playerId) {
        // Own property — nothing
        return { ...state, turnPhase: 'turn_complete' };
      }

      if (propState.mortgaged) {
        state = addLog(state, `🏚️ ${space.name} está hipotecada. Sem aluguel.`, 'info');
        return { ...state, turnPhase: 'turn_complete' };
      }

      // Pay rent
      const owner = state.players.find(p => p.id === propState.ownerId)!;
      const diceTotal = state.dice ? state.dice[0] + state.dice[1] : 7;
      const rent = calculateRent(space, propState, state.properties, owner, diceTotal);

      state = addLog(
        state,
        `🏦 Sr. Marinho cobra aluguel de R$${rent} de ${player.name} para ${owner.name} em ${space.name}!`,
        'bank'
      );
      state = transferMoney(state, playerId, propState.ownerId, rent);
      return { ...state, turnPhase: 'turn_complete' };
    }
  }

  return { ...state, turnPhase: 'turn_complete' };
}

// ─── Resolve Card ────────────────────────────────────────────────────────────

export function resolveCard(state: GameState): GameState {
  const card = state.pendingCard;
  if (!card) return { ...state, turnPhase: 'turn_complete', pendingCard: null };

  const player = state.players[state.currentPlayerIndex];
  const action = card.action;
  let s = { ...state, pendingCard: null };

  switch (action.type) {
    case 'collect':
      s = updatePlayer(s, player.id, { money: player.money + action.amount });
      break;

    case 'pay':
      s = chargeMoney(s, player.id, action.amount, null);
      break;

    case 'collect_from_each': {
      let collected = 0;
      for (const other of s.players.filter(p => p.id !== player.id && !p.bankrupt)) {
        const amt = Math.min(action.amount, other.money);
        s = updatePlayer(s, other.id, { money: other.money - amt });
        collected += amt;
      }
      const p = s.players.find(p => p.id === player.id)!;
      s = updatePlayer(s, player.id, { money: p.money + collected });
      break;
    }

    case 'pay_to_each': {
      const others = s.players.filter(p => p.id !== player.id && !p.bankrupt);
      const total = action.amount * others.length;
      s = chargeMoney(s, player.id, total, null);
      if (!s.players.find(p => p.id === player.id)?.bankrupt) {
        for (const other of others) {
          s = updatePlayer(s, other.id, { money: other.money + action.amount });
        }
      }
      break;
    }

    case 'advance_to': {
      const target = action.position;
      const currentPos = s.players.find(p => p.id === player.id)!.position;
      const passesGo = target < currentPos && action.collectGoBonus;
      s = movePlayerTo(s, player.id, target, passesGo);
      return s; // resolveSpace sets turnPhase
    }

    case 'advance_to_railroad': {
      const pos = s.players.find(p => p.id === player.id)!.position;
      const railroads = [5, 15, 25, 35];
      const next = railroads.find(r => r > pos) ?? railroads[0];
      s = movePlayerTo(s, player.id, next, next < pos);
      return s;
    }

    case 'go_to_jail':
      s = sendToJail(s, player.id, 'por carta');
      return { ...s, turnPhase: 'turn_complete' };

    case 'get_out_of_jail_free':
      s = updatePlayer(s, player.id, { getOutOfJailCards: player.getOutOfJailCards + 1 });
      return { ...s, turnPhase: 'turn_complete' };

    case 'move_back': {
      const currentPos = s.players.find(p => p.id === player.id)!.position;
      const newPos = ((currentPos - action.spaces) + 40) % 40;
      s = updatePlayer(s, player.id, { position: newPos });
      s = resolveSpace(s, player.id, newPos);
      return s;
    }

    case 'repairs': {
      const ownedPos = getOwnedPositions(player, s.properties);
      let total = 0;
      for (const pos of ownedPos) {
        const ps = s.properties[pos];
        if (ps?.hotel) total += action.perHotel;
        else total += ps?.houses * action.perHouse;
      }
      if (total > 0) {
        s = chargeMoney(s, player.id, total, null);
        if (!s.players.find(p => p.id === player.id)?.bankrupt) {
          s = addLog(s, `🔨 ${player.name} pagou R$${total} em reparos.`, 'info');
        }
      } else {
        s = addLog(s, `🔨 ${player.name} não tem construções — sem custo de reparo.`, 'info');
      }
      break;
    }
  }

  return { ...s, turnPhase: 'turn_complete' };
}

// ─── Buy Property ────────────────────────────────────────────────────────────

export function buyProperty(state: GameState): GameState {
  const pos = state.pendingPropertyPosition;
  if (pos === null) return state;

  const space = state.spaces[pos];
  const player = state.players[state.currentPlayerIndex];
  const price = space.price ?? 0;

  if (player.money < price) return state; // can't afford

  let s = updatePlayer(state, player.id, { money: player.money - price });
  s = {
    ...s,
    properties: {
      ...s.properties,
      [pos]: { ...s.properties[pos], ownerId: player.id },
    },
    pendingPropertyPosition: null,
    turnPhase: 'turn_complete',
  };
  s = addLog(s, `🏠 ${player.name} comprou ${space.name} por R$${price} do Sr. Marinho!`, 'bank');
  return s;
}

// ─── Auction ─────────────────────────────────────────────────────────────────

export function startAuction(state: GameState): GameState {
  const pos = state.pendingPropertyPosition;
  if (pos === null) return state;

  const space = state.spaces[pos];
  const active = getActivePlayers(state.players);
  const activeIds = active.map(p => p.id);

  const auction: AuctionState = {
    propertyPosition: pos,
    highestBid: 0,
    highestBidderIndex: null,
    activeBidderIndex: 0,
    passedPlayerIds: [],
    activePlayerIds: activeIds,
    startingPlayerIndex: state.currentPlayerIndex,
  };

  let s = { ...state, auction, pendingPropertyPosition: null, turnPhase: 'auction' as TurnPhase };
  s = addLog(s, `🏦 Sr. Marinho abre leilão para ${space.name}! Lance mínimo: R$10.`, 'auction');
  return s;
}

export function placeBid(state: GameState, playerId: string, amount: number): GameState {
  if (!state.auction) return state;
  const auction = state.auction;
  if (amount <= auction.highestBid) return state;

  const bidder = state.players.find(p => p.id === playerId)!;
  if (bidder.money < amount) return state;

  const space = state.spaces[auction.propertyPosition];
  const newAuction: AuctionState = {
    ...auction,
    highestBid: amount,
    highestBidderIndex: state.players.findIndex(p => p.id === playerId),
    activeBidderIndex: (auction.activeBidderIndex + 1) % auction.activePlayerIds.length,
  };

  let s = { ...state, auction: newAuction };
  s = addLog(s, `💰 ${bidder.name} deu lance de R$${amount} em ${space.name}!`, 'auction');
  return s;
}

export function passBid(state: GameState, playerId: string): GameState {
  if (!state.auction) return state;
  const auction = state.auction;

  const newPassedIds = [...auction.passedPlayerIds, playerId];
  const remainingIds = auction.activePlayerIds.filter(id => !newPassedIds.includes(id));
  const player = state.players.find(p => p.id === playerId)!;

  let s = addLog(state, `🚫 ${player.name} passou no leilão.`, 'auction');

  if (remainingIds.length <= 1) {
    return endAuction({ ...s, auction: { ...auction, passedPlayerIds: newPassedIds, activePlayerIds: remainingIds } });
  }

  const newActiveBidderIndex = auction.activeBidderIndex % remainingIds.length;
  const newAuction: AuctionState = {
    ...auction,
    passedPlayerIds: newPassedIds,
    activePlayerIds: remainingIds,
    activeBidderIndex: newActiveBidderIndex,
  };
  return { ...s, auction: newAuction };
}

function endAuction(state: GameState): GameState {
  const auction = state.auction;
  if (!auction) return state;

  const space = state.spaces[auction.propertyPosition];
  let s = { ...state, auction: null, turnPhase: 'turn_complete' as TurnPhase };

  if (auction.highestBidderIndex !== null && auction.highestBid >= 10) {
    const winner = state.players[auction.highestBidderIndex];
    if (winner && !winner.bankrupt) {
      s = updatePlayer(s, winner.id, { money: winner.money - auction.highestBid });
      s = {
        ...s,
        properties: {
          ...s.properties,
          [auction.propertyPosition]: {
            ...s.properties[auction.propertyPosition],
            ownerId: winner.id,
          },
        },
      };
      s = addLog(s, `🔨 ${winner.name} venceu o leilão de ${space.name} por R$${auction.highestBid}!`, 'auction');
      return s;
    }
  }

  s = addLog(s, `🏚️ Ninguém deu lance. ${space.name} ficou com o Sr. Marinho.`, 'auction');
  return s;
}

// ─── End Turn ────────────────────────────────────────────────────────────────

export function endTurn(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isDouble = state.dice && state.dice[0] === state.dice[1];

  // If rolled doubles and not in jail, player rolls again
  if (isDouble && currentPlayer.jailTurns === 0 && state.doubleCount > 0) {
    let s = { ...state, turnPhase: 'pre_roll' as TurnPhase, dice: null };
    s = addLog(s, `🎲 ${currentPlayer.name} tirou par! Rola de novo.`, 'info');
    return s;
  }

  // Next player
  const activePlayers = state.players.filter(p => !p.bankrupt);
  if (activePlayers.length <= 1) {
    const winner = activePlayers[0];
    let s = { ...state, phase: 'ended' as const, winner: winner?.id ?? null };
    if (winner) {
      s = addLog(s, `🏆 ${winner.name} venceu o Monovale! Parabéns!`, 'info');
    }
    return s;
  }

  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  while (state.players[nextIndex].bankrupt) {
    nextIndex = (nextIndex + 1) % state.players.length;
  }

  const next = state.players[nextIndex];
  let s: GameState = {
    ...state,
    currentPlayerIndex: nextIndex,
    turnPhase: 'pre_roll',
    dice: null,
    doubleCount: 0,
    pendingCard: null,
    pendingPropertyPosition: null,
    auction: null,
    trade: null,
  };
  s = addLog(s, `🎲 Vez de ${next.name}.`, 'info');
  return s;
}

// ─── Jail Actions ────────────────────────────────────────────────────────────

export function payJailFine(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  if (player.jailTurns === 0 || player.money < 50) return state;

  let s = updatePlayer(state, player.id, { money: player.money - 50, jailTurns: 0 });
  s = addLog(s, `💸 ${player.name} pagou R$50 de fiança e saiu do DETRAN!`, 'jail');
  return s;
}

export function useJailCard(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  if (player.jailTurns === 0 || player.getOutOfJailCards === 0) return state;

  let s = updatePlayer(state, player.id, {
    jailTurns: 0,
    getOutOfJailCards: player.getOutOfJailCards - 1,
  });
  s = addLog(s, `🔓 ${player.name} usou o cartão de saída do DETRAN!`, 'jail');
  return s;
}

// ─── Build / Mortgage ────────────────────────────────────────────────────────

export function buildHouse(state: GameState, position: number): GameState {
  const space = state.spaces[position];
  const propState = state.properties[position];
  const player = state.players[state.currentPlayerIndex];

  if (!propState || propState.ownerId !== player.id) return state;
  if (propState.mortgaged || propState.hotel) return state;
  if (!space.group || !space.housePrice) return state;

  // Check monopoly
  // GROUP_POSITIONS imported at top of file
  const groupPos = GROUP_POSITIONS[space.group] ?? [];
  const hasMonopoly = groupPos.every((p: number) => state.properties[p]?.ownerId === player.id);
  if (!hasMonopoly) return state;

  const cost = space.housePrice;
  if (player.money < cost) return state;

  const maxHouses = groupPos.reduce((max: number, p: number) => {
    return Math.max(max, state.properties[p]?.houses ?? 0);
  }, 0);

  let newHouses = propState.houses;
  let newHotel = propState.hotel;

  if (propState.houses < 4) {
    if (propState.houses >= maxHouses) return state; // must build evenly
    newHouses = propState.houses + 1;
  } else {
    newHotel = true;
    newHouses = 0;
  }

  let s = updatePlayer(state, player.id, { money: player.money - cost });
  s = {
    ...s,
    properties: {
      ...s.properties,
      [position]: { ...propState, houses: newHouses, hotel: newHotel },
    },
  };
  const built = newHotel ? 'hotel' : `${newHouses} casa(s)`;
  s = addLog(s, `🏗️ ${player.name} construiu em ${space.name}. Agora: ${built}.`, 'info');
  return s;
}

export function sellHouse(state: GameState, position: number): GameState {
  const space = state.spaces[position];
  const propState = state.properties[position];
  const player = state.players[state.currentPlayerIndex];

  if (!propState || propState.ownerId !== player.id) return state;
  if (!propState.hotel && propState.houses === 0) return state;
  if (!space.housePrice) return state;

  const refund = Math.floor(space.housePrice / 2);
  let newHouses = propState.houses;
  let newHotel = propState.hotel;

  if (propState.hotel) {
    newHotel = false;
    newHouses = 4;
  } else {
    newHouses = propState.houses - 1;
  }

  let s = updatePlayer(state, player.id, { money: player.money + refund });
  s = {
    ...s,
    properties: {
      ...s.properties,
      [position]: { ...propState, houses: newHouses, hotel: newHotel },
    },
  };
  s = addLog(s, `🏚️ ${player.name} vendeu uma construção em ${space.name}. Recebeu R$${refund}.`, 'info');
  return s;
}

export function mortgageProperty(state: GameState, position: number): GameState {
  const space = state.spaces[position];
  const propState = state.properties[position];
  const player = state.players[state.currentPlayerIndex];

  if (!propState || propState.ownerId !== player.id) return state;
  if (propState.mortgaged || propState.houses > 0 || propState.hotel) return state;

  const mortgageValue = Math.floor((space.price ?? 0) / 2);
  let s = updatePlayer(state, player.id, { money: player.money + mortgageValue });
  s = {
    ...s,
    properties: {
      ...s.properties,
      [position]: { ...propState, mortgaged: true },
    },
  };
  s = addLog(s, `🏚️ ${player.name} hipotecou ${space.name}. Recebeu R$${mortgageValue}.`, 'bank');
  return s;
}

export function unmortgageProperty(state: GameState, position: number): GameState {
  const space = state.spaces[position];
  const propState = state.properties[position];
  const player = state.players[state.currentPlayerIndex];

  if (!propState || propState.ownerId !== player.id) return state;
  if (!propState.mortgaged) return state;

  const unmortgageCost = Math.floor((space.price ?? 0) * 0.55);
  if (player.money < unmortgageCost) return state;

  let s = updatePlayer(state, player.id, { money: player.money - unmortgageCost });
  s = {
    ...s,
    properties: {
      ...s.properties,
      [position]: { ...propState, mortgaged: false },
    },
  };
  s = addLog(s, `🏠 ${player.name} resgatou ${space.name} por R$${unmortgageCost}.`, 'bank');
  return s;
}

// ─── Trade ───────────────────────────────────────────────────────────────────

export function proposeTrade(state: GameState, targetPlayerIndex: number): GameState {
  const trade: TradeState = {
    proposingPlayerIndex: state.currentPlayerIndex,
    targetPlayerIndex: targetPlayerIndex >= 0 ? targetPlayerIndex : null,
    offerMoney: 0,
    offerPositions: [],
    requestMoney: 0,
    requestPositions: [],
    status: targetPlayerIndex >= 0 ? 'configuring' : 'selecting_target',
  };
  return { ...state, trade, turnPhase: 'trade' };
}

export function updateTrade(state: GameState, trade: TradeState): GameState {
  return { ...state, trade };
}

export function acceptTrade(state: GameState): GameState {
  const trade = state.trade;
  if (!trade || trade.targetPlayerIndex === null) return state;

  const proposer = state.players[trade.proposingPlayerIndex];
  const target = state.players[trade.targetPlayerIndex];

  // Validate money
  if (proposer.money < trade.offerMoney || target.money < trade.requestMoney) {
    return addLog(state, '❌ Troca inválida: dinheiro insuficiente.', 'trade');
  }

  // Validate properties
  for (const pos of trade.offerPositions) {
    if (state.properties[pos]?.ownerId !== proposer.id) {
      return addLog(state, '❌ Troca inválida: propriedade não pertence ao proponente.', 'trade');
    }
  }
  for (const pos of trade.requestPositions) {
    if (state.properties[pos]?.ownerId !== target.id) {
      return addLog(state, '❌ Troca inválida: propriedade não pertence ao alvo.', 'trade');
    }
  }

  let s = state;

  // Transfer money
  s = updatePlayer(s, proposer.id, { money: proposer.money - trade.offerMoney + trade.requestMoney });
  s = updatePlayer(s, target.id, { money: target.money - trade.requestMoney + trade.offerMoney });

  // Transfer properties
  const newProps = { ...s.properties };
  for (const pos of trade.offerPositions) {
    newProps[pos] = { ...newProps[pos], ownerId: target.id };
  }
  for (const pos of trade.requestPositions) {
    newProps[pos] = { ...newProps[pos], ownerId: proposer.id };
  }

  s = { ...s, properties: newProps, trade: null, turnPhase: 'turn_complete' };
  s = addLog(s, `🤝 Troca aceita entre ${proposer.name} e ${target.name}!`, 'trade');
  return s;
}

export function cancelTrade(state: GameState): GameState {
  const trade = state.trade;
  if (trade) {
    const proposer = state.players[trade.proposingPlayerIndex];
    state = addLog(state, `❌ ${proposer.name} cancelou a negociação.`, 'trade');
  }
  return { ...state, trade: null, turnPhase: 'turn_complete' };
}

// ─── Bankruptcy ──────────────────────────────────────────────────────────────

function declareBankruptcy(state: GameState, playerId: string, creditorId: string | null): GameState {
  const player = state.players.find(p => p.id === playerId)!;

  // Return all properties to bank (for auction later — simplified: just free them)
  const newProps = { ...state.properties };
  for (const pos of getOwnedPositions(player, state.properties)) {
    newProps[pos] = { ...newProps[pos], ownerId: null, houses: 0, hotel: false, mortgaged: false };
  }

  // Give remaining money to creditor if applicable
  let newPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, bankrupt: true, money: 0 } : p
  );
  if (creditorId) {
    newPlayers = newPlayers.map(p =>
      p.id === creditorId ? { ...p, money: p.money + player.money } : p
    );
  }

  let s: GameState = { ...state, players: newPlayers, properties: newProps };
  s = addLog(s, `💀 ${player.name} foi à falência! Sr. Marinho confisca tudo.`, 'bankrupt');

  const activePlayers = s.players.filter(p => !p.bankrupt);
  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    s = { ...s, phase: 'ended', winner: winner.id };
    s = addLog(s, `🏆 ${winner.name} é o campeão do Vale! Parabéns!`, 'info');
  }

  return s;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function updatePlayer(state: GameState, playerId: string, updates: Partial<Player>): GameState {
  return {
    ...state,
    players: state.players.map(p =>
      p.id === playerId ? { ...p, ...updates } : p
    ),
  };
}

function chargeMoney(state: GameState, playerId: string, amount: number, creditorId: string | null): GameState {
  const player = state.players.find(p => p.id === playerId)!;

  if (player.money >= amount) {
    let s = updatePlayer(state, playerId, { money: player.money - amount });
    if (creditorId) {
      const creditor = s.players.find(p => p.id === creditorId)!;
      s = updatePlayer(s, creditorId, { money: creditor.money + amount });
    }
    return s;
  }

  // Can't pay — declare bankruptcy
  return declareBankruptcy(state, playerId, creditorId);
}

function transferMoney(state: GameState, fromId: string, toId: string, amount: number): GameState {
  return chargeMoney(state, fromId, amount, toId);
}

function sendToJail(state: GameState, playerId: string, reason: string): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  let s = updatePlayer(state, playerId, { position: 10, jailTurns: 1 });
  s = addLog(s, `🚔 ${player.name} foi preso no DETRAN (${reason})!`, 'jail');
  return s;
}
