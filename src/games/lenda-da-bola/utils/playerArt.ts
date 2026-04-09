/**
 * DiceBear avatar URLs for player cards.
 * Legendary players get skin tones matched to their real-world appearance.
 * Generic players get deterministic varied avatars based on their ID.
 *
 * DiceBear adventurer valid skinColor values:
 * f2d3b1 (very light) | ecad80 (light) | d1a26e (medium-light)
 * b37148 (medium) | 8c5e3c (medium-dark) | 6e3d2a (dark) | 4a2512 (very dark)
 */

const BASE = 'https://api.dicebear.com/9.x/adventurer/svg';

// Background matched to card dark theme so the avatar blends naturally
const BG = '0f172a';

type SkinTone = 'veryLight' | 'light' | 'medLight' | 'medium' | 'medDark' | 'dark' | 'veryDark';

const SKIN: Record<SkinTone, string> = {
  veryLight: 'f2d3b1',
  light:     'ecad80',
  medLight:  'd1a26e',
  medium:    'b37148',
  medDark:   '8c5e3c',
  dark:      '6e3d2a',
  veryDark:  '4a2512',
};

// All skin tone values in order (used for generic players round-robin)
const SKIN_LIST = Object.values(SKIN);

// Legendary player skin tone configs (two tones so DiceBear picks the best fit)
const LEGEND_SKIN: Record<string, string> = {
  'pele':              `${SKIN.dark},${SKIN.medDark}`,
  'maradona':          `${SKIN.medLight},${SKIN.light}`,
  'messi':             `${SKIN.veryLight},${SKIN.light}`,
  'cr7':               `${SKIN.light},${SKIN.veryLight}`,
  'ronaldinho':        `${SKIN.dark},${SKIN.veryDark}`,
  'ronaldo-fenomeno':  `${SKIN.medDark},${SKIN.dark}`,
  'zidane':            `${SKIN.medLight},${SKIN.medium}`,
  'neymar':            `${SKIN.medium},${SKIN.medDark}`,
  'kaka':              `${SKIN.medLight},${SKIN.light}`,
  'garrincha':         `${SKIN.dark},${SKIN.medDark}`,
  'romario':           `${SKIN.medDark},${SKIN.dark}`,
  'cruyff':            `${SKIN.veryLight},${SKIN.light}`,
  'beckenbauer':       `${SKIN.veryLight},${SKIN.light}`,
  'maldini':           `${SKIN.light},${SKIN.veryLight}`,
  'yashin':            `${SKIN.veryLight},${SKIN.light}`,
  'van-basten':        `${SKIN.veryLight},${SKIN.light}`,
  'platini':           `${SKIN.veryLight},${SKIN.light}`,
  'puskas':            `${SKIN.veryLight},${SKIN.light}`,
  'eusebio':           `${SKIN.dark},${SKIN.veryDark}`,
  'tevez':             `${SKIN.medLight},${SKIN.light}`,
};

export function legendaryAvatarUrl(playerId: string): string {
  const skinColor = LEGEND_SKIN[playerId] ?? `${SKIN.medium},${SKIN.medLight}`;
  const params = new URLSearchParams({
    seed:            `legend-${playerId}`,
    skinColor,
    backgroundType:  'solid',
    backgroundColor: BG,
    scale:           '110',
  });
  return `${BASE}?${params}`;
}

export function genericAvatarUrl(playerId: string): string {
  const index   = parseInt(playerId.replace('generic-', ''), 10) || 0;
  const skinColor = SKIN_LIST[index % SKIN_LIST.length];
  const params = new URLSearchParams({
    seed:            `player-${playerId}`,
    skinColor,
    backgroundType:  'solid',
    backgroundColor: BG,
    scale:           '110',
  });
  return `${BASE}?${params}`;
}
