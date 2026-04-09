/**
 * DiceBear avatar URLs for player cards.
 *
 * Uses the "personas" style which supports an explicit gender=male parameter,
 * guaranteeing masculine illustrated characters for all cards.
 *
 * Skin-color reference (same values supported across DiceBear styles):
 * f2d3b1 very-light | ecad80 light | d1a26e med-light
 * b37148 medium     | 8c5e3c med-dark | 6e3d2a dark | 4a2512 very-dark
 */

const BASE = 'https://api.dicebear.com/9.x/personas/svg';
const BG   = '0f172a';   // matches card dark theme

const SKIN = {
  veryLight: 'f2d3b1',
  light:     'ecad80',
  medLight:  'd1a26e',
  medium:    'b37148',
  medDark:   '8c5e3c',
  dark:      '6e3d2a',
  veryDark:  '4a2512',
} as const;

const SKIN_LIST = Object.values(SKIN);

// Per-legend skin tone — two options so DiceBear chooses the best fit for the seed
const LEGEND_SKIN: Record<string, string> = {
  'pele':             `${SKIN.dark},${SKIN.veryDark}`,
  'maradona':         `${SKIN.medLight},${SKIN.light}`,
  'messi':            `${SKIN.veryLight},${SKIN.light}`,
  'cr7':              `${SKIN.light},${SKIN.veryLight}`,
  'ronaldinho':       `${SKIN.dark},${SKIN.veryDark}`,
  'ronaldo-fenomeno': `${SKIN.medDark},${SKIN.dark}`,
  'zidane':           `${SKIN.medLight},${SKIN.medium}`,
  'neymar':           `${SKIN.medium},${SKIN.medDark}`,
  'kaka':             `${SKIN.medLight},${SKIN.light}`,
  'garrincha':        `${SKIN.dark},${SKIN.medDark}`,
  'romario':          `${SKIN.medDark},${SKIN.dark}`,
  'cruyff':           `${SKIN.veryLight},${SKIN.light}`,
  'beckenbauer':      `${SKIN.veryLight},${SKIN.light}`,
  'maldini':          `${SKIN.light},${SKIN.veryLight}`,
  'yashin':           `${SKIN.veryLight},${SKIN.light}`,
  'van-basten':       `${SKIN.veryLight},${SKIN.light}`,
  'platini':          `${SKIN.veryLight},${SKIN.light}`,
  'puskas':           `${SKIN.veryLight},${SKIN.light}`,
  'eusebio':          `${SKIN.dark},${SKIN.veryDark}`,
  'tevez':            `${SKIN.medLight},${SKIN.light}`,
};

function buildUrl(seed: string, skinColor: string): string {
  // Build manually to keep gender[] brackets un-encoded (DiceBear array syntax)
  return (
    `${BASE}` +
    `?seed=${encodeURIComponent(seed)}` +
    `&gender[]=male` +
    `&skinColor=${encodeURIComponent(skinColor)}` +
    `&backgroundType=solid` +
    `&backgroundColor=${BG}` +
    `&scale=120`
  );
}

export function legendaryAvatarUrl(playerId: string): string {
  const skinColor = LEGEND_SKIN[playerId] ?? `${SKIN.medium},${SKIN.medLight}`;
  return buildUrl(`legend-${playerId}`, skinColor);
}

export function genericAvatarUrl(playerId: string): string {
  const index     = parseInt(playerId.replace('generic-', ''), 10) || 0;
  const skinColor = SKIN_LIST[index % SKIN_LIST.length];
  return buildUrl(`player-${playerId}`, skinColor);
}
