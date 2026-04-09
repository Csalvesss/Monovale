import type { Team, Player, MatchResult } from '../types/game';

// ─── Star point values (Mercado da Bola) ────────────────────────────────────
// 5★ = 25 pts | 4★ = 22 pts | 3★ = 19 pts | 2★ = 16 pts
export function starPoints(stars: number): number {
  return Math.max(13, 10 + stars * 3);
}

// ─── Defense token table (Mercado da Bola) ───────────────────────────────────
// Input: sum of star RATINGS (1-5 per player → 11-55 for 11 players)
// Each row of the Mercado da Bola table:
//   1-10  stars → 10 fichas
//   11-20 stars → 30 fichas
//   21-30 stars → 40 fichas
//   31-44 stars → 49 fichas
//   45+   stars → 55 fichas
export function calculateDefenseTokens(totalStarRatings: number): number {
  if (totalStarRatings <= 10) return 10;
  if (totalStarRatings <= 20) return 30;
  if (totalStarRatings <= 30) return 40;
  if (totalStarRatings <= 44) return 49;
  return 55;
}

// Pool must be larger than max tokens so even the strongest defense is beatable
// 55 tokens / 100 pool = 55% block max → 45% goal chance for elite defense
const TOKEN_POOL = 100;

function pickTokens(count: number): Set<number> {
  const chosen = new Set<number>();
  while (chosen.size < Math.min(count, TOKEN_POOL)) {
    chosen.add(Math.floor(Math.random() * TOKEN_POOL) + 1);
  }
  return chosen;
}

// ─── Cartas de Notícias (Mercado da Bola) ────────────────────────────────────
// Drawn on each goal: Gol=3pts | Vitória=2pts | Empate=1pt
type NewsCard = { label: string; points: number; emoji: string };
const NEWS_CARDS: NewsCard[] = [
  { label: 'GOL',     points: 3, emoji: '🟢' },
  { label: 'VITÓRIA', points: 2, emoji: '🟡' },
  { label: 'EMPATE',  points: 1, emoji: '🔵' },
];
function drawNewsCard(): NewsCard {
  return NEWS_CARDS[Math.floor(Math.random() * NEWS_CARDS.length)];
}

// ─── Main match simulation ───────────────────────────────────────────────────
export function runMatch(homeTeam: Team, awayTeam: Team, homeLineup: Player[]): MatchResult {
  // Total star ratings → defense tokens (Mercado da Bola table)
  const homeStarSum = homeLineup.reduce((s, p) => s + p.stars, 0);
  const awayStarSum = Math.max(11, Math.floor(homeStarSum * 0.85));

  const homeDefCount = calculateDefenseTokens(homeStarSum);
  const awayDefCount = calculateDefenseTokens(awayStarSum);

  // Attack range = star points of the best attacking player (16-25)
  const homeAttackers = homeLineup.filter(p =>
    ['ST', 'CF', 'CAM', 'RW', 'LW'].includes(p.position)
  );
  const homeAttackRange = homeAttackers.length > 0
    ? Math.max(...homeAttackers.map(p => starPoints(p.stars)))
    : 16;
  const awayAttackRange = Math.max(16, Math.floor(homeAttackRange * 0.85));

  let homeGoals = 0;
  let awayGoals = 0;
  let homeMatchPoints = 0; // points scored via Cartas de Notícias + result bonus

  const events: string[] = [];

  // 3 rounds — each round: home attacks then away attacks
  for (let round = 0; round < 3; round++) {
    // Home attacks: roll 1..homeAttackRange against away defense tokens
    const homeRoll  = Math.floor(Math.random() * homeAttackRange) + 1;
    const awayDef   = pickTokens(awayDefCount);

    if (!awayDef.has(homeRoll)) {
      homeGoals++;
      const scorer = homeAttackers.length > 0
        ? homeAttackers[Math.floor(Math.random() * homeAttackers.length)]
        : homeLineup[0];
      const card = drawNewsCard();
      homeMatchPoints += card.points;
      events.push(
        `⚽ GOL! ${scorer?.name ?? homeTeam.shortName} ` +
        `— ${card.emoji} Carta ${card.label} (+${card.points} pts)`
      );
    } else {
      events.push(`🛡️ ${awayTeam.shortName} bloqueou o ataque!`);
    }

    // Away attacks: roll 1..awayAttackRange against home defense tokens
    const awayRoll = Math.floor(Math.random() * awayAttackRange) + 1;
    const homeDef  = pickTokens(homeDefCount);

    if (!homeDef.has(awayRoll)) {
      awayGoals++;
      events.push(`⚽ GOL de ${awayTeam.name}!`);
    } else {
      events.push(`🛡️ ${homeTeam.shortName} defendeu!`);
    }
  }

  if (homeGoals === 0 && awayGoals === 0) {
    events.push('🤝 Jogo de muita defesa — zero a zero!');
  }

  // Match result bonus points (Mercado da Bola: Vitória=+2, Empate=+1)
  if (homeGoals > awayGoals) {
    homeMatchPoints += 2;
    events.push(
      `🏆 VITÓRIA! ${homeTeam.name} ${homeGoals}×${awayGoals} ${awayTeam.name}` +
      ` — +2 pts de vitória`
    );
  } else if (homeGoals === awayGoals) {
    homeMatchPoints += 1;
    events.push(`🤝 EMPATE! ${homeGoals}×${awayGoals} — +1 pt de empate`);
  } else {
    events.push(`😔 Derrota. ${homeTeam.name} ${homeGoals}×${awayGoals} ${awayTeam.name}`);
  }

  return {
    score:       { home: homeGoals, away: awayGoals },
    events,
    matchPoints: homeMatchPoints,
  };
}

// ─── Team strength preview (for MatchScreen stats panel) ────────────────────
export function getTeamStrength(lineup: Player[]): {
  attack: number; defense: number; morale: number; starPointTotal: number;
} {
  if (lineup.length === 0) return { attack: 0, defense: 0, morale: 50, starPointTotal: 0 };

  const attackers = lineup.filter(p => ['ST', 'CF', 'CAM', 'RW', 'LW'].includes(p.position));
  const defenders = lineup.filter(p => ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(p.position));

  const attack = attackers.length > 0
    ? Math.round(attackers.reduce((s, p) => s + (p.attributes.shooting + p.attributes.dribbling) / 2, 0) / attackers.length)
    : 50;
  const defense = defenders.length > 0
    ? Math.round(defenders.reduce((s, p) => s + (p.attributes.defending + p.attributes.physical) / 2, 0) / defenders.length)
    : 50;
  const morale = Math.round(lineup.reduce((s, p) => s + p.moodPoints, 0) / lineup.length);
  const starPointTotal = lineup.reduce((s, p) => s + starPoints(p.stars), 0);

  return { attack, defense, morale, starPointTotal };
}
