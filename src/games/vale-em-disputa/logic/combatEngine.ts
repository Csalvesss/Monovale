// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Combat Engine
// ─────────────────────────────────────────────────────────────────────────────

import type { CombatResult } from '../types';

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(count: number): number[] {
  return Array.from({ length: count }, rollDie).sort((a, b) => b - a);
}

/**
 * Resolve a single combat round.
 * attackerTroops: number of troops in the attacking city (max 3 dice, but must leave 1)
 * defenderTroops: number of troops in the defending city (max 2 dice)
 * serranosDefending: if true, attacker needs +2 difference to win
 * rerollAttack: if true, attacker may reroll 1 die once
 * attackBonus: +N added to attacker's highest die
 */
export function resolveCombat(
  attackerTroops: number,
  defenderTroops: number,
  opts: {
    serranosDefending?: boolean;
    attackBonus?: number;
    rerollAttack?: boolean;
  } = {}
): CombatResult {
  const { serranosDefending = false, attackBonus = 0, rerollAttack = false } = opts;

  // attacker can use 1-3 dice (must keep 1 troop back), defender 1-2
  const attackerDiceCount = Math.min(3, attackerTroops - 1);
  const defenderDiceCount = Math.min(2, defenderTroops);

  if (attackerDiceCount < 1) {
    return { attackerDice: [], defenderDice: [], attackerLosses: 0, defenderLosses: 0, conquered: false };
  }

  let attackerDice = rollDice(attackerDiceCount);

  // Optionally reroll lowest attacker die
  if (rerollAttack && attackerDice.length > 0) {
    const minIdx = attackerDice.indexOf(Math.min(...attackerDice));
    const rerolled = rollDie();
    attackerDice[minIdx] = rerolled;
    attackerDice.sort((a, b) => b - a);
  }

  // Apply attack bonus to highest die
  if (attackBonus > 0 && attackerDice.length > 0) {
    attackerDice[0] = Math.min(6 + attackBonus, attackerDice[0] + attackBonus);
  }

  const defenderDice = rollDice(defenderDiceCount);

  let attackerLosses = 0;
  let defenderLosses = 0;
  const pairsToCompare = Math.min(attackerDiceCount, defenderDiceCount);

  for (let i = 0; i < pairsToCompare; i++) {
    const atkVal = attackerDice[i];
    const defVal = defenderDice[i];

    if (serranosDefending) {
      // Attacker needs to beat defender by at least 2
      if (atkVal - defVal >= 2) {
        defenderLosses++;
      } else {
        attackerLosses++;
      }
    } else {
      // Normal: attacker wins ties go to defender
      if (atkVal > defVal) {
        defenderLosses++;
      } else {
        attackerLosses++;
      }
    }
  }

  const conquered = defenderTroops - defenderLosses <= 0;

  return { attackerDice, defenderDice, attackerLosses, defenderLosses, conquered };
}

/**
 * Check if a player can attack from city A to city B.
 * Requires: A is adjacent to B, A has at least 2 troops.
 */
export function canAttack(
  fromTroops: number,
  fromOwner: string | null,
  toOwner: string | null,
  adjacent: boolean,
  playerId: string
): boolean {
  return (
    fromOwner === playerId &&
    toOwner !== playerId &&
    fromTroops >= 2 &&
    adjacent
  );
}
