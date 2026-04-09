import type { Team, Player, MatchResult } from '../types/game';

export function calculateDefenseTokens(totalStarPoints: number): number {
  if (totalStarPoints <= 11) return 4;
  if (totalStarPoints <= 22) return 6;
  if (totalStarPoints <= 33) return 8;
  if (totalStarPoints <= 44) return 10;
  return 12;
}

function pickUniqueTokens(count: number): number[] {
  const tokens: number[] = [];
  while (tokens.length < count) {
    const p = Math.floor(Math.random() * 16) + 1;
    if (!tokens.includes(p)) tokens.push(p);
  }
  return tokens;
}

export function runMatch(homeTeam: Team, awayTeam: Team, homeLineup: Player[]): MatchResult {
  const homeStarPoints = homeLineup.reduce((sum, p) => sum + p.stars, 0);
  const awayStarPoints = Math.max(11, Math.floor(homeStarPoints * 0.85)); // slightly weaker opponent

  const homeTokens = calculateDefenseTokens(homeStarPoints);
  const awayTokens = calculateDefenseTokens(awayStarPoints);

  let homeGoals = 0;
  let awayGoals = 0;
  const events: string[] = [];

  for (let i = 0; i < 3; i++) {
    // Home attacks
    const homeAtt = Math.floor(Math.random() * 16) + 1;
    const awayDef = pickUniqueTokens(awayTokens);
    if (!awayDef.includes(homeAtt)) {
      homeGoals++;
      const scorers = homeLineup.filter(p => ['ST', 'CF', 'CAM', 'RW', 'LW'].includes(p.position));
      const scorer = scorers.length > 0 ? scorers[Math.floor(Math.random() * scorers.length)] : homeLineup[0];
      events.push(`⚽ GOL! ${scorer?.name ?? homeTeam.shortName} marca para ${homeTeam.name}!`);
    }

    // Away attacks
    const awayAtt = Math.floor(Math.random() * 16) + 1;
    const homeDef = pickUniqueTokens(homeTokens);
    if (!homeDef.includes(awayAtt)) {
      awayGoals++;
      events.push(`⚽ GOL do ${awayTeam.name}! A defesa não segurou.`);
    }
  }

  if (events.length === 0) {
    events.push('🤝 Um jogo muito equilibrado. Muita luta no meio-campo, sem grandes chances.');
  }

  if (homeGoals > awayGoals) {
    events.push(`🏆 Vitória do ${homeTeam.name}! Placar final: ${homeGoals} × ${awayGoals}`);
  } else if (awayGoals > homeGoals) {
    events.push(`😔 Derrota do ${homeTeam.name}. Placar final: ${homeGoals} × ${awayGoals}`);
  } else {
    events.push(`🤝 Empate! ${homeGoals} × ${awayGoals}. Ponto valioso na tabela.`);
  }

  return { score: { home: homeGoals, away: awayGoals }, events };
}

export function getTeamStrength(lineup: Player[]): { attack: number; defense: number; morale: number } {
  if (lineup.length === 0) return { attack: 0, defense: 0, morale: 50 };
  const attackers = lineup.filter(p => ['ST', 'CF', 'CAM', 'RW', 'LW'].includes(p.position));
  const defenders = lineup.filter(p => ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(p.position));
  const attack  = attackers.length > 0 ? Math.round(attackers.reduce((s, p) => s + (p.attributes.shooting + p.attributes.dribbling) / 2, 0) / attackers.length) : 50;
  const defense = defenders.length > 0 ? Math.round(defenders.reduce((s, p) => s + (p.attributes.defending + p.attributes.physical) / 2, 0) / defenders.length) : 50;
  const morale  = Math.round(lineup.reduce((s, p) => s + p.moodPoints, 0) / lineup.length);
  return { attack, defense, morale };
}
