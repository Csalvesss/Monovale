import type { Player, Position, StarRating, LifestyleLevel, MoodLevel, PlayerAttributes, LegendaryCard } from '../types';
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

// ─── FICTIONAL_PLAYERS — 84 jogadores estáticos para o Álbum ─────────────────
// 73 normais (stars 2–4) + 11 Lendas da Lore (stars 5, rarity: 'legendary')
// Avatares via DiceBear Avataaars

function av(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

type FP = [
  string,        // id
  string,        // name (apelido)
  string,        // fullName
  Position,
  StarRating,
  number,        // age
  string,        // nationality
  string,        // flag
  string,        // teamId
  number,        // marketValue
  number,        // wage
  PlayerAttributes,
  'normal' | 'legendary',
  string?,       // lore (só lendas)
];

function buildFP(raw: FP): Player {
  const [id, name, fullName, pos, stars, age, nat, flag, teamId, mv, wage, attrs, rarity, lore] = raw;
  const ls: LifestyleLevel = stars >= 5 ? 'superstar' : stars >= 4 ? 'luxury' : stars >= 3 ? 'comfortable' : 'modest';
  const lsCost: Record<LifestyleLevel, number> = { poor: 0, modest: 10, comfortable: 50, luxury: 150, superstar: 500 };
  const lc: LegendaryCard | undefined = rarity === 'legendary' && lore
    ? { visual: 'gold', boostMultiplier: 1.10, lore, era: '' }
    : undefined;
  return {
    id, name, fullName, position: pos, stars, age, nationality: nat, flag,
    currentTeamId: teamId, marketValue: mv, wage, contractExpiresIn: 2,
    attributes: attrs,
    mood: 'happy', moodPoints: 72,
    lifestyle: ls, lifestyleExpenses: lsCost[ls],
    xp: stars * 600, level: Math.min(10, stars + 1),
    potentialBoost: 10, rarity, legendaryCard: lc,
    defenseTokens: 4,
    injured: false, injuredForRounds: 0, suspended: false,
    imageUrl: av(id),
  };
}

const RAW_FICTIONAL: FP[] = [
  // ── Goleiros (5) ───────────────────────────────────────────────────────────
  ['fp-gk01','Mendes','Gabriel Mendes','GK',2,22,'Brasil','🇧🇷','corinthians',40,4,{pace:50,shooting:28,passing:42,dribbling:32,defending:54,physical:58,goalkeeping:62},'normal'],
  ['fp-gk02','Ferretti','Tomás Ferretti','GK',3,27,'Portugal','🇵🇹','benfica',100,8,{pace:58,shooting:35,passing:52,dribbling:42,defending:64,physical:66,goalkeeping:74},'normal'],
  ['fp-gk03','Luca R.','Luca Romanelli','GK',3,29,'Itália','🇮🇹','juventus',110,9,{pace:56,shooting:36,passing:50,dribbling:40,defending:62,physical:65,goalkeeping:76},'normal'],
  ['fp-gk04','Marcus Cole','Marcus James Cole','GK',4,25,'Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','arsenal',200,16,{pace:64,shooting:44,passing:62,dribbling:52,defending:74,physical:76,goalkeeping:84},'normal'],
  // ── Zagueiros (9) ──────────────────────────────────────────────────────────
  ['fp-cb01','Neto','Pedro Neto','CB',2,21,'Brasil','🇧🇷','corinthians',45,4,{pace:56,shooting:40,passing:48,dribbling:44,defending:62,physical:64},'normal'],
  ['fp-cb02','Zanetti','Marco Zanetti','CB',3,26,'Itália','🇮🇹','inter',110,9,{pace:65,shooting:50,passing:58,dribbling:52,defending:74,physical:74},'normal'],
  ['fp-cb03','Brandt','Johan Brandt','CB',3,28,'Alemanha','🇩🇪','bayernmunich',120,10,{pace:67,shooting:52,passing:60,dribbling:54,defending:76,physical:76},'normal'],
  ['fp-cb04','C. Santos','Carlos Santos','CB',3,25,'Brasil','🇧🇷','palmeiras',105,8,{pace:63,shooting:48,passing:56,dribbling:50,defending:72,physical:72},'normal'],
  ['fp-cb05','Andrade','Rafael Andrade','CB',3,32,'Brasil','🇧🇷','santos',90,7,{pace:60,shooting:46,passing:55,dribbling:48,defending:70,physical:70},'normal'],
  ['fp-cb06','Kaya','Emre Kaya','CB',3,26,'Turquia','🇹🇷','arsenal',95,8,{pace:62,shooting:48,passing:55,dribbling:50,defending:72,physical:72},'normal'],
  ['fp-cb07','Kingsley','David Kingsley','CB',4,27,'Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','chelsea',210,17,{pace:75,shooting:58,passing:68,dribbling:62,defending:84,physical:82},'normal'],
  ['fp-cb08','M. Costa','Mateus Costa','CB',4,24,'Brasil','🇧🇷','flamengo',195,15,{pace:73,shooting:56,passing:66,dribbling:60,defending:82,physical:80},'normal'],
  ['fp-cb09','Morozov','Alexei Morozov','CB',3,30,'Rússia','🇷🇺','realmadrid',98,8,{pace:61,shooting:48,passing:56,dribbling:50,defending:73,physical:74},'normal'],
  // ── Laterais Esquerdo (5) ──────────────────────────────────────────────────
  ['fp-lb01','C. Lima','Carlos Lima','LB',2,20,'Brasil','🇧🇷','corinthians',38,3,{pace:68,shooting:44,passing:54,dribbling:52,defending:58,physical:60},'normal'],
  ['fp-lb02','Dupont','Marc Dupont','LB',3,24,'França','🇫🇷','psg',105,8,{pace:76,shooting:54,passing:65,dribbling:62,defending:68,physical:68},'normal'],
  ['fp-lb03','L. Viana','Lucas Viana','LB',3,28,'Brasil','🇧🇷','flamengo',112,9,{pace:78,shooting:56,passing:66,dribbling:64,defending:70,physical:70},'normal'],
  ['fp-lb04','S. Ramos Jr','Sergio Ramos Jr','LB',3,23,'Espanha','🇪🇸','barcelona',100,8,{pace:74,shooting:52,passing:63,dribbling:60,defending:68,physical:66},'normal'],
  ['fp-lb05','R. Bianchi','Riccardo Bianchi','LB',4,25,'Itália','🇮🇹','milan',195,15,{pace:84,shooting:62,passing:74,dribbling:72,defending:78,physical:78},'normal'],
  // ── Laterais Direito (5) ───────────────────────────────────────────────────
  ['fp-rb01','J. Moura','João Moura','RB',2,21,'Brasil','🇧🇷','atleticomg',40,3,{pace:67,shooting:43,passing:53,dribbling:51,defending:57,physical:59},'normal'],
  ['fp-rb02','T. Bridges','Thomas Bridges','RB',3,25,'Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','manutd',108,9,{pace:77,shooting:55,passing:66,dribbling:63,defending:69,physical:69},'normal'],
  ['fp-rb03','E. Salinas','Eduardo Salinas','RB',3,27,'Argentina','🇦🇷','realmadrid',115,10,{pace:79,shooting:57,passing:67,dribbling:65,defending:71,physical:71},'normal'],
  ['fp-rb04','F. Torres','Felipe Torres','RB',3,26,'Brasil','🇧🇷','palmeiras',110,9,{pace:76,shooting:54,passing:64,dribbling:62,defending:69,physical:69},'normal'],
  ['fp-rb05','K. Mueller','Kevin Mueller','RB',4,23,'Alemanha','🇩🇪','bayernmunich',200,16,{pace:86,shooting:64,passing:76,dribbling:74,defending:80,physical:80},'normal'],
  // ── Volantes (8) ───────────────────────────────────────────────────────────
  ['fp-cdm01','T. Braga','Tiago Braga','CDM',2,22,'Brasil','🇧🇷','corinthians',42,4,{pace:60,shooting:50,passing:62,dribbling:56,defending:66,physical:68},'normal'],
  ['fp-cdm02','F. Roth','Fabian Roth','CDM',3,27,'Alemanha','🇩🇪','bayernmunich',112,9,{pace:68,shooting:58,passing:72,dribbling:65,defending:74,physical:76},'normal'],
  ['fp-cdm03','Diallo','Moussa Diallo','CDM',3,26,'Senegal','🇸🇳','psg',110,9,{pace:70,shooting:56,passing:70,dribbling:64,defending:74,physical:78},'normal'],
  ['fp-cdm04','L. Mota','Lucas Mota','CDM',3,29,'Brasil','🇧🇷','flamengo',108,9,{pace:66,shooting:56,passing:70,dribbling:63,defending:72,physical:74},'normal'],
  ['fp-cdm05','S. Bauer','Stefan Bauer','CDM',4,24,'Áustria','🇦🇹','mancity',198,16,{pace:77,shooting:66,passing:82,dribbling:74,defending:84,physical:84},'normal'],
  ['fp-cdm06','R. Lopes','Ricardo Lopes','CDM',4,26,'Brasil','🇧🇷','palmeiras',192,15,{pace:75,shooting:64,passing:80,dribbling:72,defending:82,physical:82},'normal'],
  ['fp-cdm07','P. Mendes','Paulo Mendes','CDM',3,31,'Brasil','🇧🇷','santos',95,7,{pace:64,shooting:54,passing:68,dribbling:60,defending:70,physical:72},'normal'],
  ['fp-cdm08','V. Orlov','Victor Orlov','CDM',3,25,'Ucrânia','🇺🇦','ajax',105,8,{pace:67,shooting:56,passing:70,dribbling:62,defending:72,physical:74},'normal'],
  // ── Meias (10) ─────────────────────────────────────────────────────────────
  ['fp-cm01','A. Sousa','António Sousa','CM',2,20,'Portugal','🇵🇹','benfica',44,4,{pace:62,shooting:55,passing:65,dribbling:60,defending:52,physical:58},'normal'],
  ['fp-cm02','A. Gray','Alex Gray','CM',3,26,'Escócia','🏴󠁧󠁢󠁳󠁣󠁴󠁿','chelsea',108,9,{pace:70,shooting:65,passing:74,dribbling:68,defending:60,physical:66},'normal'],
  ['fp-cm03','M. Torres','Manuel Torres','CM',3,25,'Espanha','🇪🇸','barcelona',115,9,{pace:72,shooting:66,passing:76,dribbling:70,defending:61,physical:65},'normal'],
  ['fp-cm04','F. Gallo','Fabio Gallo','CM',3,28,'Itália','🇮🇹','inter',110,9,{pace:68,shooting:63,passing:72,dribbling:66,defending:60,physical:64},'normal'],
  ['fp-cm05','D. Ramírez','Diego Ramírez','CM',3,24,'Argentina','🇦🇷','realmadrid',118,10,{pace:74,shooting:67,passing:76,dribbling:72,defending:62,physical:66},'normal'],
  ['fp-cm06','L. Ferraz','Lucas Ferraz','CM',4,23,'Brasil','🇧🇷','flamengo',205,16,{pace:80,shooting:75,passing:84,dribbling:80,defending:70,physical:74},'normal'],
  ['fp-cm07','J. Whitmore','James Whitmore','CM',4,25,'Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','mancity',198,16,{pace:78,shooting:73,passing:82,dribbling:78,defending:68,physical:72},'normal'],
  ['fp-cm08','A. Nunes','André Nunes','CM',3,30,'Brasil','🇧🇷','gremio',95,7,{pace:66,shooting:61,passing:70,dribbling:65,defending:58,physical:62},'normal'],
  ['fp-cm09','H. Lavalais','Henri Lavalais','CM',3,27,'França','🇫🇷','psg',112,9,{pace:70,shooting:64,passing:74,dribbling:68,defending:60,physical:65},'normal'],
  ['fp-cm10','P. Novak','Pavel Novak','CM',3,26,'Chéquia','🇨🇿','ajax',108,8,{pace:69,shooting:63,passing:72,dribbling:67,defending:59,physical:63},'normal'],
  // ── Meias-Atacantes (6) ────────────────────────────────────────────────────
  ['fp-cam01','R. Costa','Renato Costa','CAM',2,21,'Brasil','🇧🇷','santos',46,4,{pace:64,shooting:64,passing:66,dribbling:68,defending:38,physical:56},'normal'],
  ['fp-cam02','N. Benali','Nadir Benali','CAM',3,25,'Argélia','🇩🇿','psg',115,9,{pace:74,shooting:74,passing:74,dribbling:76,defending:46,physical:62},'normal'],
  ['fp-cam03','I. Kwame','Isaac Kwame','CAM',3,26,'Ghana','🇬🇭','ajax',112,9,{pace:72,shooting:72,passing:72,dribbling:74,defending:44,physical:60},'normal'],
  ['fp-cam04','O. Pérez','Oscar Pérez','CAM',3,27,'Chile','🇨🇱','inter',110,9,{pace:70,shooting:70,passing:70,dribbling:72,defending:43,physical:60},'normal'],
  ['fp-cam05','L. Gonçalves','Luís Gonçalves','CAM',4,24,'Portugal','🇵🇹','benfica',205,16,{pace:80,shooting:82,passing:84,dribbling:86,defending:52,physical:68},'normal'],
  ['fp-cam06','Y. Sato','Yuto Sato','CAM',3,23,'Japão','🇯🇵','ajax',105,8,{pace:72,shooting:70,passing:72,dribbling:74,defending:42,physical:58},'normal'],
  // ── Pontas Esquerdas (7) ───────────────────────────────────────────────────
  ['fp-lw01','T. Melo','Thiago Melo','LW',2,20,'Brasil','🇧🇷','corinthians',45,4,{pace:76,shooting:60,passing:58,dribbling:70,defending:36,physical:56},'normal'],
  ['fp-lw02','D. Osei','David Osei','LW',3,24,'Ghana','🇬🇭','ajax',110,9,{pace:84,shooting:68,passing:65,dribbling:78,defending:42,physical:62},'normal'],
  ['fp-lw03','P. Alves','Pedro Alves','LW',3,26,'Brasil','🇧🇷','palmeiras',115,9,{pace:85,shooting:70,passing:66,dribbling:80,defending:44,physical:64},'normal'],
  ['fp-lw04','F. Ngoma','Fabrice Ngoma','LW',3,27,'Congo','🇨🇩','psg',112,9,{pace:86,shooting:68,passing:64,dribbling:78,defending:40,physical:62},'normal'],
  ['fp-lw05','S. Bastos','Sérgio Bastos','LW',4,22,'Brasil','🇧🇷','flamengo',200,16,{pace:92,shooting:78,passing:74,dribbling:88,defending:48,physical:68},'normal'],
  ['fp-lw06','J. Medina','Javier Medina','LW',4,25,'Colômbia','🇨🇴','atleticomadrid',195,15,{pace:90,shooting:76,passing:72,dribbling:86,defending:46,physical:66},'normal'],
  ['fp-lw07','O. Asante','Owusu Asante','LW',3,22,'Ghana','🇬🇭','arsenal',108,8,{pace:84,shooting:66,passing:62,dribbling:76,defending:40,physical:60},'normal'],
  // ── Pontas Direitas (7) ────────────────────────────────────────────────────
  ['fp-rw01','R. Leal','Rodrigo Leal','RW',2,21,'Brasil','🇧🇷','atleticomg',42,4,{pace:75,shooting:59,passing:57,dribbling:69,defending:35,physical:55},'normal'],
  ['fp-rw02','Y. Al-Hassan','Yusuf Al-Hassan','RW',3,25,'Nigéria','🇳🇬','ajax',112,9,{pace:86,shooting:70,passing:66,dribbling:80,defending:42,physical:63},'normal'],
  ['fp-rw03','D. Park','Daniel Park','RW',3,24,'Coreia do Sul','🇰🇷','arsenal',110,9,{pace:84,shooting:68,passing:64,dribbling:78,defending:40,physical:61},'normal'],
  ['fp-rw04','B. Monteiro','Bruno Monteiro','RW',4,23,'Portugal','🇵🇹','benfica',198,15,{pace:90,shooting:76,passing:72,dribbling:86,defending:46,physical:66},'normal'],
  ['fp-rw05','F. Rossi','Federico Rossi','RW',4,26,'Itália','🇮🇹','juventus',200,16,{pace:91,shooting:77,passing:73,dribbling:87,defending:47,physical:67},'normal'],
  ['fp-rw06','A. Sow','Amadou Sow','RW',3,25,'Senegal','🇸🇳','psg',108,8,{pace:85,shooting:67,passing:63,dribbling:77,defending:39,physical:62},'normal'],
  ['fp-rw07','L. Vargas','Luis Vargas','RW',3,24,'Peru','🇵🇪','atleticomadrid',105,8,{pace:83,shooting:65,passing:62,dribbling:76,defending:38,physical:61},'normal'],
  // ── Centroavantes (12) ─────────────────────────────────────────────────────
  ['fp-st01','W. Costa','Wanderley Costa','ST',2,22,'Brasil','🇧🇷','santos',48,4,{pace:66,shooting:70,passing:52,dribbling:58,defending:32,physical:68},'normal'],
  ['fp-st02','D. Ford','Dylan Ford','ST',2,21,'EUA','🇺🇸','ajax',44,4,{pace:65,shooting:68,passing:50,dribbling:56,defending:30,physical:66},'normal'],
  ['fp-st03','D. Volkov','Dmitri Volkov','ST',3,27,'Rússia','🇷🇺','psg',115,9,{pace:73,shooting:78,passing:60,dribbling:66,defending:38,physical:76},'normal'],
  ['fp-st04','E. Cardozo','Enzo Cardozo','ST',3,25,'Uruguai','🇺🇾','atleticomadrid',118,10,{pace:74,shooting:79,passing:61,dribbling:67,defending:39,physical:77},'normal'],
  ['fp-st05','A. Ogundimu','Ademola Ogundimu','ST',3,26,'Nigéria','🇳🇬','arsenal',120,10,{pace:78,shooting:78,passing:60,dribbling:66,defending:36,physical:75},'normal'],
  ['fp-st06','R. Soares','Rafael Soares','ST',3,24,'Brasil','🇧🇷','corinthians',112,9,{pace:75,shooting:76,passing:58,dribbling:64,defending:35,physical:73},'normal'],
  ['fp-st07','P. Morrison','Patrick Morrison','ST',3,28,'Irlanda','🇮🇪','liverpool',108,9,{pace:72,shooting:74,passing:57,dribbling:62,defending:34,physical:72},'normal'],
  ['fp-st08','G. Cruz','Gabriel Cruz','ST',4,22,'Brasil','🇧🇷','flamengo',210,17,{pace:84,shooting:87,passing:68,dribbling:76,defending:42,physical:84},'normal'],
  ['fp-st09','M. Steiner','Marcus Steiner','ST',4,24,'Áustria','🇦🇹','bayernmunich',205,16,{pace:82,shooting:86,passing:66,dribbling:74,defending:40,physical:82},'normal'],
  ['fp-st10','D. Santos','Diogo Santos','ST',3,29,'Brasil','🇧🇷','palmeiras',105,8,{pace:70,shooting:73,passing:56,dribbling:62,defending:33,physical:71},'normal'],
  ['fp-st11','I. Adeyemi','Ibrahim Adeyemi','ST',3,23,'Nigéria','🇳🇬','mancity',114,9,{pace:80,shooting:76,passing:58,dribbling:66,defending:34,physical:74},'normal'],
  ['fp-st12','H. Lindström','Henrik Lindström','ST',4,26,'Suécia','🇸🇪','liverpool',195,15,{pace:80,shooting:85,passing:65,dribbling:73,defending:39,physical:81},'normal'],
  // ── Centroavantes avançados / CF (6) ──────────────────────────────────────
  ['fp-cf01','V. Lima','Victor Lima','CF',2,20,'Brasil','🇧🇷','santos',45,4,{pace:65,shooting:68,passing:60,dribbling:64,defending:32,physical:64},'normal'],
  ['fp-cf02','C. Guzmán','Carlos Guzmán','CF',3,24,'México','🇲🇽','atleticomadrid',112,9,{pace:72,shooting:75,passing:68,dribbling:72,defending:39,physical:69},'normal'],
  ['fp-cf03','S. Abara','Samuel Abara','CF',3,25,'Nigéria','🇳🇬','ajax',110,9,{pace:74,shooting:74,passing:67,dribbling:70,defending:37,physical:68},'normal'],
  ['fp-cf04','T. Yamazaki','Takeshi Yamazaki','CF',3,26,'Japão','🇯🇵','inter',108,8,{pace:70,shooting:72,passing:68,dribbling:70,defending:38,physical:66},'normal'],
  ['fp-cf05','H. Vilas','Henrique Vilas','CF',4,23,'Brasil','🇧🇷','flamengo',200,16,{pace:80,shooting:84,passing:76,dribbling:80,defending:44,physical:75},'normal'],
  ['fp-cf06','A. Ferretti','Antonio Ferretti','CF',4,27,'Itália','🇮🇹','milan',192,15,{pace:78,shooting:82,passing:74,dribbling:78,defending:42,physical:74},'normal'],

  // ══════════════════════════════════════════════════════════════════════════
  // LENDAS DA LORE — 11 figuras míticas fictícias do universo Lenda da Bola
  // ══════════════════════════════════════════════════════════════════════════
  ['fp-leg01','Il Muro','Giacomo Ferretti','GK',5,38,'Itália','🇮🇹','milan',400000,300,{pace:72,shooting:55,passing:68,dribbling:58,defending:82,physical:84,goalkeeping:95},'legendary','O Muro de Milão. Nas mãos dele, o gol era sagrado. Em 22 temporadas, manteve mais de 400 clean sheets. A perfeição entre os postes.'],
  ['fp-leg02','El Capitán','Rodrigo Vargas','CB',5,35,'Argentina','🇦🇷','atleticomadrid',400000,290,{pace:80,shooting:62,passing:76,dribbling:70,defending:95,physical:88},'legendary','O Capitão Eterno. Ergueu oito troféus consecutivos. Sua liderança era tão afiada quanto seu corte. Nenhum atacante o superou duas vezes.'],
  ['fp-leg03','A Muralha','Heitor Barroso','CB',5,37,'Brasil','🇧🇷','corinthians',400000,285,{pace:78,shooting:60,passing:74,dribbling:68,defending:94,physical:90},'legendary','A Muralha do Parque. Crescido nas ruas de São Paulo, transformou brutalidade em arte defensiva. Ídolo máximo da Fiel Torcida.'],
  ['fp-leg04','O Maestro','Caetano Luz','CDM',5,34,'Brasil','🇧🇷','flamengo',400000,295,{pace:80,shooting:72,passing:95,dribbling:80,defending:90,physical:82},'legendary','O Maestro do Maracanã. Ditava o ritmo sem que o adversário notasse. Suas passes valiam gols antes mesmo de chegar ao atacante.'],
  ['fp-leg05','Der Kaiser II','Hans Vogel','CM',5,32,'Alemanha','🇩🇪','bayernmunich',400000,300,{pace:82,shooting:80,passing:92,dribbling:86,defending:76,physical:82},'legendary','O Novo Kaiser. Assim como seu antecessor, Vogel dominou o meio-campo europeu por uma década com disciplina e visão inigualáveis.'],
  ['fp-leg06','La Brujula','Pablo Soria','CM',5,33,'Argentina','🇦🇷','realmadrid',400000,295,{pace:80,shooting:78,passing:94,dribbling:88,defending:74,physical:78},'legendary','A Bússola. Nunca errava a direção. Conduziu seu time a três finais consecutivas com uma visão de jogo quase sobrenatural.'],
  ['fp-leg07','O Feiticeiro','Zé Mágico','CAM',5,31,'Brasil','🇧🇷','santos',400000,300,{pace:86,shooting:90,passing:92,dribbling:97,defending:40,physical:70},'legendary','O Feiticeiro do Litoral. Seus dribles não tinham nome — eram experiências. Deixou defensores imóveis em quatro continentes.'],
  ['fp-leg08','El Diablo','Ernesto Cruz','LW',5,30,'México','🇲🇽','atleticomadrid',400000,290,{pace:97,shooting:86,passing:80,dribbling:95,defending:42,physical:72},'legendary','El Diablo da Lateral. Velocidade de raio e drible de enlouquecer. O primeiro mexicano a ganhar a Bola de Ouro virtual do jogo.'],
  ['fp-leg09','O Relâmpago','Iago Veloz','RW',5,29,'Brasil','🇧🇷','palmeiras',400000,292,{pace:98,shooting:84,passing:78,dribbling:94,defending:40,physical:70},'legendary','O Relâmpago Verde. Em sua melhor temporada, 38 partidas, 26 gols e 18 assistências. A ponta direita mais desequilibrante já vista.'],
  ['fp-leg10','O Predador','Júnior Caçador','ST',5,32,'Brasil','🇧🇷','flamengo',400000,300,{pace:90,shooting:96,passing:76,dribbling:88,defending:38,physical:86},'legendary','O Predador do Maracanã. Faro de gol sobrenatural. Não importava o ângulo, o marcador ou a pressão — se a bola chegava, o gol entrava.'],
  ['fp-leg11','La Bestia','Carlos Bruto','ST',5,34,'Uruguai','🇺🇾','atleticomadrid',400000,280,{pace:84,shooting:94,passing:72,dribbling:82,defending:40,physical:96},'legendary','La Bestia Celeste. Força bruta aliada a um instinto de artilheiro único. Marcou em oito finais de campeonato — nenhuma perdida.'],
];

export const FICTIONAL_PLAYERS: Player[] = RAW_FICTIONAL.map(buildFP);
