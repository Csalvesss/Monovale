// ─── Game Engine — Lendas da Bola Board Game ─────────────────────────────────
// Implements Mercado da Bola attack/defense mechanics for board game spaces.

import type { BoardPlayer, ActionResult, SpaceType } from './types';
import type { BoardSpace } from './types';
import { BOARD_SPACES, TOTAL_SPACES, PASS_GO_BONUS } from './data';

// ─── Dice ─────────────────────────────────────────────────────────────────────

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

// ─── Token pool (Mercado da Bola rule) ────────────────────────────────────────

const TOKEN_POOL = 100;

function pickTokenSet(count: number): Set<number> {
  const set = new Set<number>();
  while (set.size < Math.min(count, TOKEN_POOL)) {
    set.add(Math.floor(Math.random() * TOKEN_POOL) + 1);
  }
  return set;
}

// ─── Match simulation (board-game version) ────────────────────────────────────

interface MatchSim {
  homeGoals: number;
  awayGoals: number;
  events: string[];
  outcome: 'win' | 'draw' | 'loss';
}

function simulateMatch(
  attackRange: number,
  defenseTokens: number,
  opponentAttack: number,
  opponentDefense: number,
): MatchSim {
  let homeGoals = 0;
  let awayGoals = 0;
  const events: string[] = [];

  for (let r = 0; r < 3; r++) {
    // Home attacks
    const homeRoll = Math.floor(Math.random() * attackRange) + 1;
    const awayDef = pickTokenSet(opponentDefense);
    if (!awayDef.has(homeRoll)) {
      homeGoals++;
      events.push(`⚽ Gol! (ataque ${homeRoll} / fichas ${opponentDefense})`);
    } else {
      events.push(`🛡️ Defesa do adversário bloqueou (${homeRoll})`);
    }

    // Away attacks
    const awayRoll = Math.floor(Math.random() * opponentAttack) + 1;
    const homeDef = pickTokenSet(defenseTokens);
    if (!homeDef.has(awayRoll)) {
      awayGoals++;
      events.push(`⚽ Gol sofrido (${awayRoll})`);
    } else {
      events.push(`🛡️ Sua defesa bloqueou (${awayRoll})`);
    }
  }

  const outcome: MatchSim['outcome'] =
    homeGoals > awayGoals ? 'win' :
    homeGoals === awayGoals ? 'draw' : 'loss';

  return { homeGoals, awayGoals, events, outcome };
}

// ─── Legend card pool ─────────────────────────────────────────────────────────

const LEGEND_CARDS = [
  { name: 'Pelé',      bonus: 5, emoji: '👑', description: '+5 pontos da Lenda do Futebol!' },
  { name: 'Maradona',  bonus: 5, emoji: '🤌', description: '+5 pontos da Mão de Deus!' },
  { name: 'Ronaldo',   bonus: 4, emoji: '👟', description: '+4 pontos do Fenômeno!' },
  { name: 'Zidane',    bonus: 4, emoji: '💫', description: '+4 pontos do Maestro!' },
  { name: 'Cruyff',    bonus: 3, emoji: '🔁', description: '+3 pontos do Total Football!' },
  { name: 'Beckenbauer', bonus: 3, emoji: '🏰', description: '+3 pontos do Kaiser!' },
  { name: 'Messi',     bonus: 5, emoji: '🐐', description: '+5 pontos do GOAT!' },
  { name: 'Ronaldo CR', bonus: 4, emoji: '🦁', description: '+4 pontos do CR7!' },
];

function drawLegendCard() {
  return LEGEND_CARDS[Math.floor(Math.random() * LEGEND_CARDS.length)];
}

// ─── Sponsor pool ─────────────────────────────────────────────────────────────

const SPONSORS = [
  { name: 'NIG Sports',  nig: 300, points: 2 },
  { name: 'Arena Plus',  nig: 400, points: 2 },
  { name: 'GoldfootTV', nig: 500, points: 3 },
  { name: 'MaxBet',      nig: 250, points: 1 },
  { name: 'NeoKicks',    nig: 350, points: 2 },
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
  let nigDelta = 0;
  let pointsDelta = 0;
  let description = '';
  let extraTurn = false;
  let matchDetail: ActionResult['matchDetail'];
  let newSkipsNext = player.skipsNext;
  let newLegendCards = player.legendCards;
  let newDefenseTokens = player.defenseTokens;
  let newAttackRange = player.attackRange;

  // Passing GO check
  const newPos = (player.position + dice) % TOTAL_SPACES;
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
      // CPU opponent gets slightly worse stats
      const oppAttack = Math.max(13, player.attackRange - 3);
      const oppDefense = Math.max(8, player.defenseTokens - 2);
      const sim = simulateMatch(player.attackRange, player.defenseTokens, oppAttack, oppDefense);
      matchDetail = sim;
      if (sim.outcome === 'win') {
        nigDelta += 300;
        pointsDelta += 3;
        description = `Vitória ${sim.homeGoals}×${sim.awayGoals}! +3 pts, +300 NIG`;
      } else if (sim.outcome === 'draw') {
        nigDelta += 100;
        pointsDelta += 1;
        description = `Empate ${sim.homeGoals}×${sim.awayGoals}! +1 pt, +100 NIG`;
      } else {
        description = `Derrota ${sim.homeGoals}×${sim.awayGoals}… 0 pts, 0 NIG`;
      }
      break;
    }

    case 'transfer': {
      // Transfer market — handled via separate buyUpgrade() call in UI
      description = 'Mercado de Transferências — compre uma melhoria!';
      break;
    }

    case 'sponsor': {
      const sp = drawSponsor();
      nigDelta += sp.nig;
      pointsDelta += sp.points;
      description = `${sp.name}: +${sp.points} pts, +${sp.nig} NIG`;
      break;
    }

    case 'legend': {
      const card = drawLegendCard();
      pointsDelta += card.bonus;
      newLegendCards += 1;
      description = `${card.name} — ${card.description}`;
      break;
    }

    case 'rest': {
      newSkipsNext = true;
      description = 'Próxima rodada perdida 😴';
      break;
    }

    case 'challenge': {
      // Challenge the player with the most points (other than self)
      const others = allPlayers.filter(p => p.uid !== player.uid);
      if (others.length === 0) {
        nigDelta += 200;
        description = 'Sem adversários — +200 NIG de bônus!';
      } else {
        const target = others.reduce((a, b) => b.points > a.points ? b : a);
        const oppAttack = Math.max(13, target.attackRange);
        const oppDefense = Math.max(8, target.defenseTokens);
        const sim = simulateMatch(player.attackRange, player.defenseTokens, oppAttack, oppDefense);
        matchDetail = sim;
        if (sim.outcome === 'win') {
          nigDelta += 400;
          pointsDelta += 4;
          description = `Desafio vs ${target.name}: Vitória! +4 pts, +400 NIG`;
        } else if (sim.outcome === 'draw') {
          nigDelta += 150;
          pointsDelta += 1;
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
      description = 'Turno extra! Role os dados novamente 🎲';
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
    defenseTokens: newDefenseTokens,
    attackRange: newAttackRange,
    laps: player.laps + (passedGo && space.id !== 0 ? 1 : space.id === 0 ? 1 : 0),
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
  };

  return { action, updatedPlayer };
}

// ─── Get space by position ────────────────────────────────────────────────────

export function getSpace(position: number): BoardSpace {
  return BOARD_SPACES[position % TOTAL_SPACES];
}
