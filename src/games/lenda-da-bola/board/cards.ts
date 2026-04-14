// ─── Player Card (Cartela de Jogador) ────────────────────────────────────────

export interface BoardCard {
  id: string;
  name: string;
  stars: 1 | 2 | 3 | 4 | 5;
  position: 'ATK' | 'MID' | 'DEF' | 'GK';
  flag: string;
}

// NIG cost per star rating
export const CARD_COST: Record<number, number> = {
  1: 150,
  2: 300,
  3: 500,
  4: 800,
  5: 1200,
};

// ─── Card pool ────────────────────────────────────────────────────────────────

export const CARD_POOL: BoardCard[] = [
  // ── Goleiros (GK) ──
  { id: 'g1',  name: 'Bruno',         stars: 1, position: 'GK',  flag: '🇧🇷' },
  { id: 'g2',  name: 'Éderson',       stars: 2, position: 'GK',  flag: '🇧🇷' },
  { id: 'g3',  name: 'Alisson',       stars: 3, position: 'GK',  flag: '🇧🇷' },
  { id: 'g4',  name: 'Weverton',      stars: 1, position: 'GK',  flag: '🇧🇷' },
  { id: 'g5',  name: 'Courtois',      stars: 4, position: 'GK',  flag: '🇧🇪' },
  { id: 'g6',  name: 'Neuer',         stars: 3, position: 'GK',  flag: '🇩🇪' },
  { id: 'g7',  name: 'Oblak',         stars: 3, position: 'GK',  flag: '🇸🇮' },
  { id: 'g8',  name: 'Donnarumma',    stars: 3, position: 'GK',  flag: '🇮🇹' },
  { id: 'g9',  name: 'Lloris',        stars: 2, position: 'GK',  flag: '🇫🇷' },

  // ── Defensores (DEF) ──
  { id: 'd1',  name: 'Danilo',        stars: 1, position: 'DEF', flag: '🇧🇷' },
  { id: 'd2',  name: 'Alex Sandro',   stars: 1, position: 'DEF', flag: '🇧🇷' },
  { id: 'd3',  name: 'Militão',       stars: 2, position: 'DEF', flag: '🇧🇷' },
  { id: 'd4',  name: 'Marquinhos',    stars: 3, position: 'DEF', flag: '🇧🇷' },
  { id: 'd5',  name: 'Thiago Silva',  stars: 3, position: 'DEF', flag: '🇧🇷' },
  { id: 'd6',  name: 'Rúben Dias',    stars: 3, position: 'DEF', flag: '🇵🇹' },
  { id: 'd7',  name: 'Van Dijk',      stars: 4, position: 'DEF', flag: '🇳🇱' },
  { id: 'd8',  name: 'Varane',        stars: 3, position: 'DEF', flag: '🇫🇷' },
  { id: 'd9',  name: 'Koulibaly',     stars: 2, position: 'DEF', flag: '🇸🇳' },
  { id: 'd10', name: 'Walker',        stars: 2, position: 'DEF', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'd11', name: 'T. Hernández',  stars: 2, position: 'DEF', flag: '🇫🇷' },
  { id: 'd12', name: 'Acuña',         stars: 1, position: 'DEF', flag: '🇦🇷' },
  { id: 'd13', name: 'Alaba',         stars: 3, position: 'DEF', flag: '🇦🇹' },
  { id: 'd14', name: 'Trent A-A',     stars: 3, position: 'DEF', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },

  // ── Meias (MID) ──
  { id: 'm1',  name: 'Renato S.',     stars: 1, position: 'MID', flag: '🇧🇷' },
  { id: 'm2',  name: 'Fred',          stars: 1, position: 'MID', flag: '🇧🇷' },
  { id: 'm3',  name: 'Fabinho',       stars: 2, position: 'MID', flag: '🇧🇷' },
  { id: 'm4',  name: 'Casemiro',      stars: 2, position: 'MID', flag: '🇧🇷' },
  { id: 'm5',  name: 'Paquetá',       stars: 2, position: 'MID', flag: '🇧🇷' },
  { id: 'm6',  name: 'Bruno G.',      stars: 3, position: 'MID', flag: '🇧🇷' },
  { id: 'm7',  name: 'Gerson',        stars: 1, position: 'MID', flag: '🇧🇷' },
  { id: 'm8',  name: 'B. Fernandes',  stars: 3, position: 'MID', flag: '🇵🇹' },
  { id: 'm9',  name: 'B. Silva',      stars: 3, position: 'MID', flag: '🇵🇹' },
  { id: 'm10', name: 'De Bruyne',     stars: 5, position: 'MID', flag: '🇧🇪' },
  { id: 'm11', name: 'Kroos',         stars: 4, position: 'MID', flag: '🇩🇪' },
  { id: 'm12', name: 'Modric',        stars: 4, position: 'MID', flag: '🇭🇷' },
  { id: 'm13', name: 'Pedri',         stars: 3, position: 'MID', flag: '🇪🇸' },
  { id: 'm14', name: 'Bellingham',    stars: 4, position: 'MID', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'm15', name: 'Barella',       stars: 2, position: 'MID', flag: '🇮🇹' },
  { id: 'm16', name: 'Verratti',      stars: 3, position: 'MID', flag: '🇮🇹' },
  { id: 'm17', name: 'Camavinga',     stars: 2, position: 'MID', flag: '🇫🇷' },
  { id: 'm18', name: 'Tchouaméni',    stars: 2, position: 'MID', flag: '🇫🇷' },

  // ── Atacantes (ATK) ──
  { id: 'a1',  name: 'Antony',        stars: 2, position: 'ATK', flag: '🇧🇷' },
  { id: 'a2',  name: 'Martinelli',    stars: 2, position: 'ATK', flag: '🇧🇷' },
  { id: 'a3',  name: 'Gabriel Jesus', stars: 2, position: 'ATK', flag: '🇧🇷' },
  { id: 'a4',  name: 'Firmino',       stars: 2, position: 'ATK', flag: '🇧🇷' },
  { id: 'a5',  name: 'Rodrygo',       stars: 3, position: 'ATK', flag: '🇧🇷' },
  { id: 'a6',  name: 'Raphinha',      stars: 3, position: 'ATK', flag: '🇧🇷' },
  { id: 'a7',  name: 'Vinicius Jr.',  stars: 4, position: 'ATK', flag: '🇧🇷' },
  { id: 'a8',  name: 'Neymar',        stars: 5, position: 'ATK', flag: '🇧🇷' },
  { id: 'a9',  name: 'Messi',         stars: 5, position: 'ATK', flag: '🇦🇷' },
  { id: 'a10', name: 'Di María',      stars: 3, position: 'ATK', flag: '🇦🇷' },
  { id: 'a11', name: 'Mbappé',        stars: 5, position: 'ATK', flag: '🇫🇷' },
  { id: 'a12', name: 'Giroud',        stars: 2, position: 'ATK', flag: '🇫🇷' },
  { id: 'a13', name: 'Benzema',       stars: 4, position: 'ATK', flag: '🇫🇷' },
  { id: 'a14', name: 'Ronaldo',       stars: 5, position: 'ATK', flag: '🇵🇹' },
  { id: 'a15', name: 'Haaland',       stars: 5, position: 'ATK', flag: '🇳🇴' },
  { id: 'a16', name: 'Lewandowski',   stars: 4, position: 'ATK', flag: '🇵🇱' },
  { id: 'a17', name: 'Salah',         stars: 4, position: 'ATK', flag: '🇪🇬' },
  { id: 'a18', name: 'Son',           stars: 3, position: 'ATK', flag: '🇰🇷' },
  { id: 'a19', name: 'Osimhen',       stars: 3, position: 'ATK', flag: '🇳🇬' },
  { id: 'a20', name: 'Sterling',      stars: 2, position: 'ATK', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Starting deck of 11 players (1 GK, 4 DEF, 4 MID, 2 ATK).
 * Drawn only from 1-2★ cards so every player starts equal.
 * Total ≈ 14-18 stars → 30 defense tokens, attack range 16.
 */
export function getStarterDeck(): BoardCard[] {
  const pool = {
    GK:  shuffle(CARD_POOL.filter(c => c.position === 'GK'  && c.stars <= 2)),
    DEF: shuffle(CARD_POOL.filter(c => c.position === 'DEF' && c.stars <= 2)),
    MID: shuffle(CARD_POOL.filter(c => c.position === 'MID' && c.stars <= 2)),
    ATK: shuffle(CARD_POOL.filter(c => c.position === 'ATK' && c.stars <= 2)),
  };
  return [
    ...pool.GK.slice(0, 1),
    ...pool.DEF.slice(0, 4),
    ...pool.MID.slice(0, 4),
    ...pool.ATK.slice(0, 2),
  ];
}

/**
 * 3 random market offers for a given player.
 * Skews toward cheaper cards; never offers cards the player already owns.
 */
export function getMarketOffers(ownedCards: BoardCard[]): BoardCard[] {
  const ownedIds = new Set(ownedCards.map(c => c.id));
  const available = CARD_POOL.filter(c => !ownedIds.has(c.id));
  // Weight by inverse of stars (cheaper = more frequent)
  const weighted: BoardCard[] = [];
  for (const c of available) {
    const w = c.stars <= 2 ? 4 : c.stars === 3 ? 2 : 1;
    for (let i = 0; i < w; i++) weighted.push(c);
  }
  return shuffle(weighted).slice(0, 3);
}

// Position labels
export const POSITION_LABEL: Record<BoardCard['position'], string> = {
  GK: 'GOL', DEF: 'DEF', MID: 'MEI', ATK: 'ATA',
};
