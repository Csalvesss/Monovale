// ─── Game Engine — Lendas da Bola Board Game ─────────────────────────────────

import type { BoardPlayer, ActionResult, SpaceType } from './types';
import type { BoardSpace } from './types';
import type { BoardCard } from './cards';
import { BOARD_SPACES, TOTAL_SPACES, PASS_GO_BONUS, DEFENSE_TABLE } from './data';
import { getMarketOffers } from './cards';

// ─── Dice (single die 1–6) ────────────────────────────────────────────────────

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// ─── Compute player stats from card collection ────────────────────────────────
// Implements the Mercado da Bola rules:
//   • defenseTokens = function of total ★ count of all 11+ players
//   • attackRange   = star points of the best ATK card (10 + stars*3)

export function computePlayerStats(cards: BoardCard[]): {
  defenseTokens: number;
  attackRange: number;
} {
  const totalStars = cards.reduce((sum, c) => sum + c.stars, 0);

  const defenseTokens =
    DEFENSE_TABLE.find(r => totalStars >= r.min && totalStars <= r.max)?.tokens ?? 10;

  const atkCards = cards.filter(c => c.position === 'ATK');
  const bestAtkStars = atkCards.length > 0
    ? Math.max(...atkCards.map(c => c.stars))
    : 1;
  // 1★=13, 2★=16, 3★=19, 4★=22, 5★=25
  const attackRange = 10 + bestAtkStars * 3;

  return { defenseTokens, attackRange };
}

// ─── Defense token pool ───────────────────────────────────────────────────────

const TOKEN_POOL = 100;

function pickTokenSet(count: number): Set<number> {
  const set = new Set<number>();
  while (set.size < Math.min(count, TOKEN_POOL)) {
    set.add(Math.floor(Math.random() * TOKEN_POOL) + 1);
  }
  return set;
}

// ─── Match simulation (Mercado da Bola rules) ─────────────────────────────────

interface MatchSim {
  homeGoals: number;
  awayGoals: number;
  events: string[];
  outcome: 'win' | 'draw' | 'loss';
}

function simulateMatch(
  myAttackRange: number,
  myDefenseTokens: number,
  oppAttackRange: number,
  oppDefenseTokens: number,
): MatchSim {
  let homeGoals = 0;
  let awayGoals = 0;
  const events: string[] = [];

  for (let r = 0; r < 3; r++) {
    // My attack
    const roll = Math.floor(Math.random() * myAttackRange) + 1;
    const oppDef = pickTokenSet(oppDefenseTokens);
    if (!oppDef.has(roll)) {
      homeGoals++;
      events.push(`⚽ Gol! (${roll} não estava entre as ${oppDefenseTokens} fichas do adversário)`);
    } else {
      events.push(`🛡️ Adversário bloqueou (ficha ${roll} de ${oppDefenseTokens})`);
    }

    // Opponent attacks
    const oppRoll = Math.floor(Math.random() * oppAttackRange) + 1;
    const myDef = pickTokenSet(myDefenseTokens);
    if (!myDef.has(oppRoll)) {
      awayGoals++;
      events.push(`⚽ Gol sofrido (${oppRoll} não estava nas suas ${myDefenseTokens} fichas)`);
    } else {
      events.push(`🛡️ Sua defesa bloqueou (ficha ${oppRoll})`);
    }
  }

  const outcome: MatchSim['outcome'] =
    homeGoals > awayGoals ? 'win' :
    homeGoals === awayGoals ? 'draw' : 'loss';

  return { homeGoals, awayGoals, events, outcome };
}

// ─── Legend card pool ─────────────────────────────────────────────────────────

const LEGEND_CARDS = [
  { name: 'Pelé',       bonus: 5, desc: '+5 pontos — Rei do Futebol!' },
  { name: 'Maradona',   bonus: 5, desc: '+5 pontos — Mão de Deus!' },
  { name: 'Ronaldo R9', bonus: 4, desc: '+4 pontos — O Fenômeno!' },
  { name: 'Zidane',     bonus: 4, desc: '+4 pontos — O Maestro!' },
  { name: 'Cruyff',     bonus: 3, desc: '+3 pontos — Total Football!' },
  { name: 'Beckenbauer',bonus: 3, desc: '+3 pontos — Der Kaiser!' },
  { name: 'Ronaldinho', bonus: 4, desc: '+4 pontos — O Bruxo!' },
  { name: 'Romário',    bonus: 3, desc: '+3 pontos — O Baixinho!' },
  { name: 'Garrincha',  bonus: 3, desc: '+3 pontos — Alegria do Povo!' },
];

function drawLegendCard() {
  return LEGEND_CARDS[Math.floor(Math.random() * LEGEND_CARDS.length)];
}

// ─── Sponsor pool ─────────────────────────────────────────────────────────────

const SPONSORS = [
  { name: 'NIG Sports',   nig: 300, points: 2 },
  { name: 'Arena Plus',   nig: 400, points: 2 },
  { name: 'GoldfootTV',  nig: 500, points: 3 },
  { name: 'MaxBet',       nig: 250, points: 1 },
  { name: 'NeoKicks',     nig: 350, points: 2 },
  { name: 'SportGold',    nig: 450, points: 2 },
];

function drawSponsor() {
  return SPONSORS[Math.floor(Math.random() * SPONSORS.length)];
}

// ─── Main action resolver ─────────────────────────────────────────────────────

export function resolveSpaceAction(
  player: BoardPlayer,
  space: BoardSpace,
  dice: number,
  allPlayers: BoardPlayer[],
): { action: ActionResult; updatedPlayer: BoardPlayer } {
  let nigDelta     = 0;
  let pointsDelta  = 0;
  let description  = '';
  let extraTurn    = false;
  let newSkipsNext = player.skipsNext;
  let newLegendCards = player.legendCards;
  let matchDetail: ActionResult['matchDetail'];
  let marketOffers: ActionResult['marketOffers'];

  // Passing GO check
  const newPos   = (player.position + dice) % TOTAL_SPACES;
  const passedGo = newPos < player.position || (player.position + dice) >= TOTAL_SPACES;
  if (passedGo && space.id !== 0) {
    nigDelta += PASS_GO_BONUS;
    description += `+${PASS_GO_BONUS} NIG ao passar no INÍCIO! `;
  }

  switch (space.type) {

    case 'start': {
      nigDelta += PASS_GO_BONUS;
      description = `+${PASS_GO_BONUS} NIG — Ponto de partida!`;
      break;
    }

    case 'match-day': {
      // CPU has slightly weaker stats
      const oppAttack  = Math.max(13, player.attackRange - 3);
      const oppDefense = Math.max(8,  player.defenseTokens - 2);
      const sim = simulateMatch(player.attackRange, player.defenseTokens, oppAttack, oppDefense);
      matchDetail = sim;
      if (sim.outcome === 'win') {
        nigDelta += 300; pointsDelta += 3;
        description = `Vitória ${sim.homeGoals}×${sim.awayGoals}! +3 pts, +300 NIG`;
      } else if (sim.outcome === 'draw') {
        nigDelta += 100; pointsDelta += 1;
        description = `Empate ${sim.homeGoals}×${sim.awayGoals}. +1 pt, +100 NIG`;
      } else {
        description = `Derrota ${sim.homeGoals}×${sim.awayGoals}. 0 pts`;
      }
      break;
    }

    case 'transfer': {
      // Show 3 market cards — player chooses one in the modal
      marketOffers = getMarketOffers(player.cards);
      description = 'Você pode contratar um novo jogador!';
      break;
    }

    case 'sponsor': {
      const sp = drawSponsor();
      nigDelta += sp.nig; pointsDelta += sp.points;
      description = `${sp.name}: +${sp.points} pts, +${sp.nig} NIG`;
      break;
    }

    case 'legend': {
      const card = drawLegendCard();
      pointsDelta += card.bonus;
      newLegendCards += 1;
      description = `${card.name} — ${card.desc}`;
      break;
    }

    case 'rest': {
      newSkipsNext = true;
      description = 'Próxima rodada perdida 😴';
      break;
    }

    case 'challenge': {
      const others = allPlayers.filter(p => p.uid !== player.uid);
      if (others.length === 0) {
        nigDelta += 200;
        description = 'Sem adversários — +200 NIG de bônus!';
      } else {
        // Challenge the leader
        const target = others.reduce((a, b) => b.points > a.points ? b : a);
        const sim = simulateMatch(
          player.attackRange, player.defenseTokens,
          target.attackRange, target.defenseTokens,
        );
        matchDetail = sim;
        if (sim.outcome === 'win') {
          nigDelta += 400; pointsDelta += 4;
          description = `Desafio vs ${target.name}: Vitória! +4 pts, +400 NIG`;
        } else if (sim.outcome === 'draw') {
          nigDelta += 150; pointsDelta += 1;
          description = `Desafio vs ${target.name}: Empate. +1 pt, +150 NIG`;
        } else {
          description = `Desafio vs ${target.name}: Derrota. 0 NIG`;
        }
      }
      break;
    }

    case 'bonus': {
      const val = space.value ?? 200;
      nigDelta += val;
      description = `+${val} NIG!`;
      break;
    }

    case 'penalty': {
      const val = space.value ?? 200;
      nigDelta -= val;
      description = `-${val} NIG 😬`;
      break;
    }

    case 'extra-turn': {
      extraTurn = true;
      description = 'Turno extra! Role novamente 🎲';
      break;
    }
  }

  const updatedPlayer: BoardPlayer = {
    ...player,
    position: newPos,
    nig: Math.max(0, player.nig + nigDelta),
    points: Math.max(0, player.points + pointsDelta),
    skipsNext: newSkipsNext,
    legendCards: newLegendCards,
    laps: player.laps + ((passedGo && space.id !== 0) || space.id === 0 ? 1 : 0),
  };

  const action: ActionResult = {
    playerUid: player.uid,
    spaceId: space.id,
    spaceType: space.type,
    spaceLabel: space.label,
    dice,
    nigDelta,
    pointsDelta,
    description,
    extraTurn,
    matchDetail,
    marketOffers,
  };

  return { action, updatedPlayer };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function getSpace(position: number): BoardSpace {
  return BOARD_SPACES[position % TOTAL_SPACES];
}
