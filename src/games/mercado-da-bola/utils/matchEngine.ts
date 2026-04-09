import type { Player, MatchResult, AttackPhase } from '../types';
import { ATTACKS_PER_MATCH, GOAL_POSITIONS, DEFENSE_TOKEN_TABLE, MOOD_MULTIPLIER } from '../constants';

// ─── Calculate defense tokens for a squad ────────────────────────────────────

export function calcDefenseTokens(squad: Player[]): number {
  const totalStars = squad.reduce((sum, p) => sum + p.stars, 0);
  const row = DEFENSE_TOKEN_TABLE.find(r => totalStars >= r.min && totalStars <= r.max);
  return row?.tokens ?? (totalStars > 55 ? 12 : 4);
}

// ─── Get overall rating of a player (mood-adjusted) ──────────────────────────

export function getEffectiveRating(player: Player): number {
  const { pace, shooting, passing, dribbling, defending, physical, goalkeeping } = player.attributes;
  let base: number;
  if (player.position === 'GK') {
    base = ((goalkeeping ?? 60) * 0.5 + defending * 0.2 + physical * 0.2 + passing * 0.1);
  } else if (['CB', 'LB', 'RB'].includes(player.position)) {
    base = (defending * 0.4 + physical * 0.25 + pace * 0.15 + passing * 0.2);
  } else if (['CDM', 'CM'].includes(player.position)) {
    base = (passing * 0.35 + defending * 0.25 + physical * 0.2 + dribbling * 0.2);
  } else if (player.position === 'CAM') {
    base = (passing * 0.35 + dribbling * 0.3 + shooting * 0.25 + pace * 0.1);
  } else if (['LW', 'RW'].includes(player.position)) {
    base = (pace * 0.3 + dribbling * 0.3 + shooting * 0.25 + passing * 0.15);
  } else {
    // ST, CF
    base = (shooting * 0.4 + pace * 0.25 + dribbling * 0.2 + physical * 0.15);
  }

  if (player.rarity === 'legendary') return base; // legendary gets no mood penalty
  const mult = MOOD_MULTIPLIER[player.mood] ?? 1.0;
  return Math.round(base * mult);
}

// ─── Team overall rating ──────────────────────────────────────────────────────

export function getTeamRating(squad: Player[]): number {
  if (squad.length === 0) return 50;
  const active = squad.filter(p => !p.injured && !p.suspended);
  const playing = active.slice(0, 11);
  const sum = playing.reduce((s, p) => s + getEffectiveRating(p), 0);
  return Math.round(sum / Math.max(playing.length, 1));
}

// ─── AI: choose defense positions ────────────────────────────────────────────

function aiChooseDefensePositions(tokenCount: number, rng: () => number): number[] {
  const positions: number[] = [];
  const available = Array.from({ length: GOAL_POSITIONS }, (_, i) => i + 1);
  while (positions.length < tokenCount) {
    const idx = Math.floor(rng() * available.length);
    positions.push(available.splice(idx, 1)[0]);
  }
  return positions.sort((a, b) => a - b);
}

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Simulate a full match ────────────────────────────────────────────────────

export interface SimulateMatchParams {
  mySquad: Player[];
  opponentRating: number;   // 1–100
  myDefenseTokens: number;
  sponsorWinFee: number;
  sponsorDrawFee: number;
  sponsorLossFee: number;
  stadiumCapacity: number;
  ticketPrice: number;
  isHome: boolean;
  roundSeed: number;
}

export interface SimulateMatchReturn {
  result: MatchResult;
  phases: AttackPhase[];
  narrative: string[];
}

export function simulateMatch(params: SimulateMatchParams): SimulateMatchReturn {
  const {
    mySquad, opponentRating, myDefenseTokens, isHome,
    sponsorWinFee, sponsorDrawFee, sponsorLossFee,
    stadiumCapacity, ticketPrice, roundSeed,
  } = params;

  const rng = seededRng(roundSeed);
  const myRating = getTeamRating(mySquad);

  // Rating difference gives probability edge
  const ratingDiff = myRating - opponentRating;
  const myWinProb = Math.min(0.75, Math.max(0.15, 0.5 + ratingDiff * 0.008 + (isHome ? 0.06 : 0)));

  // Opponent defense tokens (based on their rating)
  const opponentStars = Math.max(1, Math.min(55, Math.round(opponentRating / 2)));
  const opponentTokenRow = DEFENSE_TOKEN_TABLE.find(r => opponentStars >= r.min && opponentStars <= r.max);
  const opponentDefenseTokens = opponentTokenRow?.tokens ?? 6;

  const phases: AttackPhase[] = [];
  let myGoals = 0;
  let opponentGoals = 0;
  const narrative: string[] = [];

  // 3 attack phases each
  for (let i = 0; i < ATTACKS_PER_MATCH; i++) {
    // MY ATTACK
    const myAttackNum = Math.floor(rng() * GOAL_POSITIONS) + 1;
    const opDefPositions = aiChooseDefensePositions(opponentDefenseTokens, rng);
    const myGoal = !opDefPositions.includes(myAttackNum);
    phases.push({ round: i + 1, attackerId: 'my-team', defenderPositions: opDefPositions, attackerNumber: myAttackNum, isGoal: myGoal });
    if (myGoal) {
      myGoals++;
      const attackers = mySquad.filter(p => ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.position) && !p.injured);
      const scorer = attackers[Math.floor(rng() * Math.max(attackers.length, 1))];
      narrative.push(`GOL! ${scorer?.name ?? 'Jogador'} marca para o seu time! placar ${myGoals}x${opponentGoals}`);
    } else {
      narrative.push(`Defesa do adversário bloqueou o ataque na posição ${myAttackNum}.`);
    }

    // OPPONENT ATTACK
    const oppAttackProb = rng();
    const oppSuccess = oppAttackProb < (opponentRating / 100) * 0.6;
    const myDefPositions = aiChooseDefensePositions(myDefenseTokens, rng);
    const opAttackNum = Math.floor(rng() * GOAL_POSITIONS) + 1;
    const opponentGoal = !myDefPositions.includes(opAttackNum);
    phases.push({ round: i + 1, attackerId: 'opponent', defenderPositions: myDefPositions, attackerNumber: opAttackNum, isGoal: opponentGoal && oppSuccess });
    if (opponentGoal && oppSuccess) {
      opponentGoals++;
      narrative.push(`Gol do adversário! sofreu o gol placar ${myGoals}x${opponentGoals}`);
    } else {
      narrative.push(`Sua defesa bloqueou o ataque adversário!`);
    }
  }

  // Determine winner
  const winner: 'home' | 'away' | 'draw' =
    myGoals > opponentGoals ? (isHome ? 'home' : 'away') :
    myGoals < opponentGoals ? (isHome ? 'away' : 'home') :
    'draw';
  const iWon = myGoals > opponentGoals;
  const isDraw = myGoals === opponentGoals;

  // Sponsor income
  let sponsorEarned = iWon ? sponsorWinFee : isDraw ? sponsorDrawFee : sponsorLossFee;

  // Ticket revenue (home games only)
  const attendance = isHome ? Math.floor(stadiumCapacity * (0.5 + Math.min(0.5, (myWinProb - 0.2) * 1.2)) * rng() * 0.3 + stadiumCapacity * 0.5) : 0;
  const ticketRevenue = isHome ? Math.round(attendance * ticketPrice * 0.001) : 0;

  // XP distribution
  const xpEarned: Record<string, number> = {};
  mySquad.slice(0, 11).forEach(p => {
    if (p.injured) return;
    let xp = 100;
    if (iWon) xp += 30;
    if (['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.position) && myGoals > 0 && rng() < 0.4) xp += 50;
    if (['GK', 'CB', 'LB', 'RB'].includes(p.position) && opponentGoals === 0) xp += 75;
    if (opponentRating > myRating + 10) xp += 20;
    xpEarned[p.id] = xp;
  });

  if (iWon) {
    narrative.push(`VITORIA! Resultado final ${myGoals}x${opponentGoals}. Patrocínio: +$${sponsorEarned}k`);
  } else if (isDraw) {
    narrative.push(`EMPATE! Resultado final ${myGoals}x${opponentGoals}. Patrocínio: +$${sponsorEarned}k`);
  } else {
    narrative.push(`DERROTA. Resultado final ${myGoals}x${opponentGoals}. Patrocínio: +$${sponsorLossFee}k`);
  }
  if (isHome && ticketRevenue > 0) {
    narrative.push(`Bilheteria: +$${ticketRevenue}k com ${attendance.toLocaleString('pt-BR')} torcedores`);
  }

  return {
    result: {
      homeGoals: isHome ? myGoals : opponentGoals,
      awayGoals: isHome ? opponentGoals : myGoals,
      winner,
      sponsorEarned,
      xpEarned,
      ticketRevenue,
    },
    phases,
    narrative,
  };
}

// ─── Quick AI vs AI result for background teams ───────────────────────────────

export function quickSimulate(ratingA: number, ratingB: number, seed: number): { goalsA: number; goalsB: number } {
  const rng = seededRng(seed);
  const prob = Math.min(0.8, Math.max(0.2, 0.5 + (ratingA - ratingB) * 0.01));
  let goalsA = 0, goalsB = 0;
  for (let i = 0; i < ATTACKS_PER_MATCH; i++) {
    if (rng() < prob * 0.55) goalsA++;
    if (rng() < (1 - prob) * 0.55) goalsB++;
  }
  return { goalsA, goalsB };
}
