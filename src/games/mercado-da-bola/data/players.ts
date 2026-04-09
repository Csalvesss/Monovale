import type { Player, Position, StarRating, LifestyleLevel, MoodLevel } from '../types';
import { ALL_TEAMS } from './teams';

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─── Name pools ───────────────────────────────────────────────────────────────

const BR_FIRST = ['Gabriel', 'Lucas', 'Matheus', 'Felipe', 'Pedro', 'João', 'Rodrigo', 'Diego', 'André', 'Rafael', 'Thiago', 'Bruno', 'Gustavo', 'Vitor', 'Yago', 'Everton', 'Léo', 'Caio', 'Murilo', 'Allan'];
const BR_LAST  = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Alves', 'Nascimento', 'Pereira', 'Carvalho', 'Martins', 'Gomes', 'Ribeiro'];
const ES_FIRST = ['Sergio', 'Raúl', 'Pablo', 'Álvaro', 'Carlos', 'Antonio', 'David', 'Juan', 'Diego', 'Jorge', 'Marcos', 'Roberto', 'Alejandro', 'Fernando', 'Ricardo'];
const ES_LAST  = ['García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández', 'Sánchez', 'Torres', 'Ramírez', 'Díaz', 'Flores', 'Moreno', 'Ruiz', 'Jiménez', 'Romero'];
const EN_FIRST = ['Jack', 'Harry', 'James', 'Oliver', 'George', 'Charlie', 'Thomas', 'Will', 'Lewis', 'Kieran', 'Declan', 'Jordan', 'Luke', 'Alex', 'Ryan'];
const EN_LAST  = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Johnson', 'White', 'Walker', 'Robinson', 'Green'];
const IT_FIRST = ['Marco', 'Luca', 'Lorenzo', 'Francesco', 'Alessandro', 'Matteo', 'Andrea', 'Davide', 'Nicola', 'Filippo', 'Simone', 'Emanuele', 'Riccardo', 'Giorgio', 'Fabio'];
const IT_LAST  = ['Rossi', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano'];
const DE_FIRST = ['Leon', 'Lukas', 'Finn', 'Jonas', 'Max', 'Moritz', 'Paul', 'Felix', 'Tim', 'Jan', 'Niklas', 'Florian', 'Dominik', 'Marcel', 'Sebastian'];
const DE_LAST  = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein'];
const FR_FIRST = ['Antoine', 'Hugo', 'Louis', 'Lucas', 'Théo', 'Maxime', 'Kylian', 'Aurélien', 'Marcus', 'Youssouf', 'Rayan', 'Moussa', 'Mohamed', 'Axel', 'Pierre'];
const FR_LAST  = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Moreau'];

const NATIONALITY_DATA: Record<string, { first: string[]; last: string[]; flag: string; nationality: string }> = {
  brasileirao: { first: BR_FIRST, last: BR_LAST, flag: '🇧🇷', nationality: 'Brasil' },
  premier:     { first: EN_FIRST, last: EN_LAST, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', nationality: 'Inglaterra' },
  laliga:      { first: ES_FIRST, last: ES_LAST, flag: '🇪🇸', nationality: 'Espanha' },
  seriea:      { first: IT_FIRST, last: IT_LAST, flag: '🇮🇹', nationality: 'Itália' },
  bundesliga:  { first: DE_FIRST, last: DE_LAST, flag: '🇩🇪', nationality: 'Alemanha' },
  ligue1:      { first: FR_FIRST, last: FR_LAST, flag: '🇫🇷', nationality: 'França' },
};

// ─── Position lineup ──────────────────────────────────────────────────────────

const SQUAD_POSITIONS: Position[] = [
  'GK',
  'CB', 'CB', 'LB', 'RB',
  'CDM', 'CM', 'CM',
  'LW', 'RW', 'ST',
  'CB', 'CM', 'ST', 'LW', 'RW',
];

// ─── Star rating from reputation ──────────────────────────────────────────────

function repToStar(rep: number, rng: () => number): StarRating {
  const base = rep >= 90 ? 5 : rep >= 75 ? 4 : rep >= 60 ? 3 : rep >= 45 ? 2 : 1;
  const roll = rng();
  if (roll < 0.15 && base > 1) return (base - 1) as StarRating;
  if (roll > 0.85 && base < 5) return (base + 1) as StarRating;
  return base as StarRating;
}

// ─── Attribute generation ─────────────────────────────────────────────────────

function genAttrs(pos: Position, stars: StarRating, rng: () => number) {
  const base = 40 + stars * 10;
  const rand = (min: number, max: number) => Math.round(min + rng() * (max - min));
  const v = (bonus: number) => Math.min(99, rand(base + bonus - 5, base + bonus + 10));

  if (pos === 'GK')   return { pace: v(-10), shooting: v(-20), passing: v(-5), dribbling: v(-15), defending: v(5), physical: v(5), goalkeeping: v(15) };
  if (pos === 'CB' || pos === 'LB' || pos === 'RB') return { pace: v(5), shooting: v(-10), passing: v(0), dribbling: v(-5), defending: v(15), physical: v(10) };
  if (pos === 'CDM')  return { pace: v(0), shooting: v(-5), passing: v(10), dribbling: v(5), defending: v(10), physical: v(10) };
  if (pos === 'CM')   return { pace: v(0), shooting: v(5), passing: v(15), dribbling: v(10), defending: v(5), physical: v(5) };
  if (pos === 'CAM')  return { pace: v(5), shooting: v(10), passing: v(15), dribbling: v(15), defending: v(-5), physical: v(0) };
  if (pos === 'LW' || pos === 'RW') return { pace: v(15), shooting: v(10), passing: v(5), dribbling: v(15), defending: v(-10), physical: v(0) };
  // ST, CF
  return { pace: v(10), shooting: v(20), passing: v(5), dribbling: v(10), defending: v(-15), physical: v(10) };
}

// ─── Generate a single player ─────────────────────────────────────────────────

function generatePlayer(teamId: string, leagueId: string, pos: Position, index: number, rep: number): Player {
  const rng = seededRng(teamId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31 + index * 7 + pos.length * 13);
  const nd = NATIONALITY_DATA[leagueId] ?? NATIONALITY_DATA.brasileirao;
  const first = nd.first[Math.floor(rng() * nd.first.length)];
  const last  = nd.last[Math.floor(rng() * nd.last.length)];
  const name  = first;
  const fullName = `${first} ${last}`;
  const stars  = repToStar(rep, rng);
  const age    = 17 + Math.floor(rng() * 18);
  const level  = 1 + Math.floor(rng() * 4);
  const attrs  = genAttrs(pos, stars, rng);
  const mv     = Math.round((stars * 100 + rep * 2) * (0.7 + rng() * 0.6));
  const wage   = Math.round(mv * (0.05 + rng() * 0.05));

  const moodPts = 50 + Math.floor(rng() * 40);
  const mood: MoodLevel = moodPts >= 85 ? 'motivated' : moodPts >= 60 ? 'happy' : moodPts >= 35 ? 'neutral' : 'unhappy';

  const lifestyleOpts: LifestyleLevel[] = ['poor', 'modest', 'comfortable', 'luxury', 'superstar'];
  const lsIdx = Math.min(4, stars - 1 + (rng() > 0.7 ? 1 : 0));
  const lifestyle = lifestyleOpts[lsIdx];
  const lifestyleCosts: Record<string, number> = { poor: 0, modest: 10, comfortable: 50, luxury: 150, superstar: 500 };

  const totalStars = 3; // default for calcDefenseTokens in squad context
  const defenseTokens = totalStars >= 45 ? 12 : totalStars >= 34 ? 10 : totalStars >= 23 ? 8 : totalStars >= 12 ? 6 : 4;

  return {
    id: `${teamId}-${pos}-${index}`,
    name,
    fullName,
    position: pos,
    stars,
    age,
    nationality: nd.nationality,
    flag: nd.flag,
    currentTeamId: teamId,
    marketValue: mv,
    wage,
    contractExpiresIn: 1 + Math.floor(rng() * 4),
    attributes: attrs,
    mood,
    moodPoints: moodPts,
    lifestyle,
    lifestyleExpenses: lifestyleCosts[lifestyle],
    xp: level * 500 - Math.floor(rng() * 200),
    level,
    potentialBoost: Math.round(rng() * 20),
    rarity: 'normal',
    defenseTokens,
    injured: rng() < 0.05,
    injuredForRounds: 0,
    suspended: false,
  };
}

// ─── Cache + Real player data ────────────────────────────────────────────────

const _cache: Record<string, Player[]> = {};

// Real well-known players injected for key teams
const REAL_PLAYERS: Record<string, Partial<Player>[]> = {
  flamengo: [
    { name: 'Gabigol', fullName: 'Gabriel Barbosa', position: 'ST', stars: 4, age: 27, nationality: 'Brasil', flag: '🇧🇷', marketValue: 350, wage: 30 },
    { name: 'Arrascaeta', fullName: 'Giorgian De Arrascaeta', position: 'CAM', stars: 4, age: 29, nationality: 'Uruguai', flag: '🇺🇾', marketValue: 300, wage: 25 },
    { name: 'Everton Ribeiro', fullName: 'Everton Ribeiro', position: 'CM', stars: 3, age: 34, nationality: 'Brasil', flag: '🇧🇷', marketValue: 120, wage: 18 },
    { name: 'Gerson', fullName: 'Gerson Santos', position: 'CM', stars: 4, age: 26, nationality: 'Brasil', flag: '🇧🇷', marketValue: 280, wage: 22 },
  ],
  palmeiras: [
    { name: 'Endrick', fullName: 'Endrick Felipe', position: 'ST', stars: 5, age: 17, nationality: 'Brasil', flag: '🇧🇷', marketValue: 600, wage: 35 },
    { name: 'Raphael Veiga', fullName: 'Raphael Veiga', position: 'CAM', stars: 4, age: 28, nationality: 'Brasil', flag: '🇧🇷', marketValue: 250, wage: 20 },
    { name: 'Dudu', fullName: 'Dudu Gustavo Henrique', position: 'LW', stars: 4, age: 31, nationality: 'Brasil', flag: '🇧🇷', marketValue: 180, wage: 16 },
  ],
  realmadrid: [
    { name: 'Vini Jr', fullName: 'Vinícius José Paixão de Oliveira Júnior', position: 'LW', stars: 5, age: 23, nationality: 'Brasil', flag: '🇧🇷', marketValue: 1200, wage: 80 },
    { name: 'Bellingham', fullName: 'Jude Victor William Bellingham', position: 'CM', stars: 5, age: 20, nationality: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', marketValue: 1400, wage: 90 },
    { name: 'Kroos', fullName: 'Toni Kroos', position: 'CM', stars: 5, age: 34, nationality: 'Alemanha', flag: '🇩🇪', marketValue: 800, wage: 70 },
    { name: 'Mbappé', fullName: 'Kylian Mbappé Lottin', position: 'ST', stars: 5, age: 25, nationality: 'França', flag: '🇫🇷', marketValue: 1500, wage: 100 },
  ],
  barcelona: [
    { name: 'Pedri', fullName: 'Pedro González López', position: 'CM', stars: 5, age: 21, nationality: 'Espanha', flag: '🇪🇸', marketValue: 900, wage: 60 },
    { name: 'Gavi', fullName: 'Pablo Martín Páez Gavira', position: 'CM', stars: 5, age: 19, nationality: 'Espanha', flag: '🇪🇸', marketValue: 800, wage: 55 },
    { name: 'Lewandowski', fullName: 'Robert Lewandowski', position: 'ST', stars: 5, age: 35, nationality: 'Polônia', flag: '🇵🇱', marketValue: 400, wage: 60 },
    { name: 'Yamal', fullName: 'Lamine Yamal', position: 'RW', stars: 5, age: 16, nationality: 'Espanha', flag: '🇪🇸', marketValue: 600, wage: 30 },
  ],
  mancity: [
    { name: 'De Bruyne', fullName: 'Kevin De Bruyne', position: 'CAM', stars: 5, age: 32, nationality: 'Bélgica', flag: '🇧🇪', marketValue: 700, wage: 65 },
    { name: 'Haaland', fullName: 'Erling Braut Haaland', position: 'ST', stars: 5, age: 23, nationality: 'Noruega', flag: '🇳🇴', marketValue: 1300, wage: 85 },
    { name: 'Rodri', fullName: 'Rodrigo Hernández Cascante', position: 'CDM', stars: 5, age: 27, nationality: 'Espanha', flag: '🇪🇸', marketValue: 900, wage: 70 },
  ],
  liverpool: [
    { name: 'Salah', fullName: 'Mohamed Salah', position: 'RW', stars: 5, age: 31, nationality: 'Egito', flag: '🇪🇬', marketValue: 600, wage: 65 },
    { name: 'Núñez', fullName: 'Darwin Núñez', position: 'ST', stars: 4, age: 24, nationality: 'Uruguai', flag: '🇺🇾', marketValue: 500, wage: 50 },
    { name: 'Szoboszlai', fullName: 'Dominik Szoboszlai', position: 'CM', stars: 4, age: 23, nationality: 'Hungria', flag: '🇭🇺', marketValue: 450, wage: 45 },
  ],
  inter: [
    { name: 'Lautaro', fullName: 'Lautaro Javier Martínez', position: 'ST', stars: 5, age: 26, nationality: 'Argentina', flag: '🇦🇷', marketValue: 900, wage: 65 },
    { name: 'Barella', fullName: 'Nicolò Barella', position: 'CM', stars: 4, age: 27, nationality: 'Itália', flag: '🇮🇹', marketValue: 700, wage: 55 },
    { name: 'Thuram', fullName: 'Marcus Thuram', position: 'ST', stars: 4, age: 26, nationality: 'França', flag: '🇫🇷', marketValue: 500, wage: 45 },
  ],
  milan: [
    { name: 'Theo Hernández', fullName: 'Theo Bernard François Hernández', position: 'LB', stars: 4, age: 26, nationality: 'França', flag: '🇫🇷', marketValue: 600, wage: 50 },
    { name: 'Leão', fullName: 'Rafael Alexandre Conceição Leão', position: 'LW', stars: 5, age: 24, nationality: 'Portugal', flag: '🇵🇹', marketValue: 800, wage: 60 },
    { name: 'Pulisic', fullName: 'Christian Pulisic', position: 'RW', stars: 4, age: 25, nationality: 'EUA', flag: '🇺🇸', marketValue: 500, wage: 45 },
  ],
  juventus: [
    { name: 'Vlahović', fullName: 'Dušan Vlahović', position: 'ST', stars: 4, age: 24, nationality: 'Sérvia', flag: '🇷🇸', marketValue: 700, wage: 55 },
    { name: 'Rabiot', fullName: 'Adrien Rabiot', position: 'CM', stars: 4, age: 29, nationality: 'França', flag: '🇫🇷', marketValue: 350, wage: 40 },
    { name: 'Chiesa', fullName: 'Federico Chiesa', position: 'RW', stars: 4, age: 26, nationality: 'Itália', flag: '🇮🇹', marketValue: 400, wage: 40 },
  ],
  arsenal: [
    { name: 'Saka', fullName: 'Bukayo Saka', position: 'RW', stars: 5, age: 22, nationality: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', marketValue: 900, wage: 70 },
    { name: 'Ødegaard', fullName: 'Martin Ødegaard', position: 'CAM', stars: 5, age: 25, nationality: 'Noruega', flag: '🇳🇴', marketValue: 800, wage: 65 },
    { name: 'Martinelli', fullName: 'Gabriel Martinelli', position: 'LW', stars: 4, age: 22, nationality: 'Brasil', flag: '🇧🇷', marketValue: 600, wage: 50 },
  ],
};

function buildRealPlayer(teamId: string, data: Partial<Player>, index: number): Player {
  const rng = seededRng(teamId.charCodeAt(0) * 1000 + index * 77);
  const stars = (data.stars ?? 3) as StarRating;
  const rep = 70;
  const pos = data.position ?? 'CM';
  const attrs = genAttrs(pos as Position, stars, rng);
  const moodPts = 70 + Math.floor(rng() * 25);
  const mood: MoodLevel = moodPts >= 85 ? 'motivated' : moodPts >= 60 ? 'happy' : 'neutral';
  const lifestyleMap: Record<number, LifestyleLevel> = { 1: 'poor', 2: 'modest', 3: 'comfortable', 4: 'luxury', 5: 'superstar' };
  const lifestyle = lifestyleMap[stars] ?? 'comfortable';
  const lifestyleCosts: Record<string, number> = { poor: 0, modest: 10, comfortable: 50, luxury: 150, superstar: 500 };

  return {
    id: `${teamId}-real-${index}`,
    name: data.name ?? 'Jogador',
    fullName: data.fullName ?? data.name ?? 'Jogador Desconhecido',
    position: pos as Position,
    stars,
    age: data.age ?? 25,
    nationality: data.nationality ?? 'Brasil',
    flag: data.flag ?? '🇧🇷',
    currentTeamId: teamId,
    marketValue: data.marketValue ?? stars * 100,
    wage: data.wage ?? Math.round((data.marketValue ?? stars * 100) * 0.05),
    contractExpiresIn: 2 + Math.floor(rng() * 3),
    attributes: attrs,
    mood,
    moodPoints: moodPts,
    lifestyle,
    lifestyleExpenses: lifestyleCosts[lifestyle],
    xp: 500 + Math.floor(rng() * 1000),
    level: 2 + Math.floor(rng() * 3),
    potentialBoost: Math.round(rng() * 15),
    rarity: 'normal',
    defenseTokens: 4,
    injured: false,
    injuredForRounds: 0,
    suspended: false,
  };
}

export function getAvailablePlayers(teamId: string, count: number): Player[] {
  if (_cache[teamId]) return _cache[teamId].slice(0, count);

  const team = ALL_TEAMS.find(t => t.id === teamId);
  if (!team) return [];

  const realData = REAL_PLAYERS[teamId];
  const realPlayers: Player[] = realData
    ? realData.map((d, i) => buildRealPlayer(teamId, d, i))
    : [];

  const neededGenerated = Math.max(0, Math.max(count, 16) - realPlayers.length);
  const generatedPositions = SQUAD_POSITIONS.slice(realPlayers.length, realPlayers.length + neededGenerated);
  const generatedPlayers = generatedPositions.map((pos, i) =>
    generatePlayer(teamId, team.leagueId, pos, i + realPlayers.length, team.reputation)
  );

  const squad = [...realPlayers, ...generatedPlayers];
  _cache[teamId] = squad;
  return squad.slice(0, count);
}
