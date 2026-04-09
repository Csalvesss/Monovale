import type { BoardSpace, Player, PropertyState } from '../types';
import { GROUP_POSITIONS } from '../data/properties';

export function calculateRent(
  space: BoardSpace,
  propState: PropertyState,
  allProperties: Record<number, PropertyState>,
  owner: Player,
  diceTotal: number
): number {
  if (propState.mortgaged) return 0;

  // ── Railroad ────────────────────────────────────────────────────────────────
  if (space.type === 'railroad') {
    const ownedRailroads = GROUP_POSITIONS.railroad.filter(pos => {
      const ps = allProperties[pos];
      return ps?.ownerId === owner.id && !ps.mortgaged;
    }).length;
    const railroadRents = [0, 25, 50, 100, 200];
    return railroadRents[ownedRailroads] ?? 0;
  }

  // ── Utility ─────────────────────────────────────────────────────────────────
  if (space.type === 'utility') {
    const ownedUtilities = GROUP_POSITIONS.utility.filter(pos => {
      const ps = allProperties[pos];
      return ps?.ownerId === owner.id && !ps.mortgaged;
    }).length;
    return diceTotal * (ownedUtilities >= 2 ? 10 : 4);
  }

  // ── Regular property ────────────────────────────────────────────────────────
  if (!space.rent) return 0;

  if (propState.hotel) return space.rent[5];
  if (propState.houses > 0) return space.rent[propState.houses];

  // No houses — check monopoly bonus (double rent)
  if (space.group) {
    const groupPositions = GROUP_POSITIONS[space.group] ?? [];
    const hasMonopoly = groupPositions.every(pos => {
      const ps = allProperties[pos];
      return ps?.ownerId === owner.id;
    });
    if (hasMonopoly) return space.rent[0] * 2;
  }

  return space.rent[0];
}

export function getPropertyNetWorth(
  space: BoardSpace,
  propState: PropertyState
): number {
  if (!space.price) return 0;
  const mortgageValue = Math.floor(space.price / 2);
  if (propState.mortgaged) return mortgageValue;
  const houseValue = (space.housePrice ?? 0) * (propState.hotel ? 5 : propState.houses) / 2;
  return space.price + houseValue;
}

export function calculateNetWorth(
  player: Player,
  ownedPositions: number[],
  spaces: BoardSpace[],
  allProperties: Record<number, PropertyState>
): number {
  const propWorth = ownedPositions.reduce((sum, pos) => {
    const space = spaces[pos];
    const ps = allProperties[pos];
    if (!space || !ps) return sum;
    return sum + getPropertyNetWorth(space, ps);
  }, 0);
  return player.money + propWorth;
}
