import type { Team } from '../types';

export const ALL_TEAMS: Team[] = [
  // ── BRASILEIRÃO ──────────────────────────────────────────────────────────────
  { id: 'flamengo',       name: 'Flamengo',            shortName: 'FLA', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#000000', reputation: 85, stadiumName: 'Maracanã',               stadiumCapacity: 78838 },
  { id: 'palmeiras',      name: 'Palmeiras',            shortName: 'PAL', leagueId: 'brasileirao', country: 'Brasil',    badge: '🟢', primaryColor: '#006437', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Allianz Parque',         stadiumCapacity: 43713 },
  { id: 'saopaulo',       name: 'São Paulo',            shortName: 'SPF', leagueId: 'brasileirao', country: 'Brasil',    badge: '⚪', primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'MorumBIS',               stadiumCapacity: 72000 },
  { id: 'corinthians',    name: 'Corinthians',          shortName: 'COR', leagueId: 'brasileirao', country: 'Brasil',    badge: '⚫', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 76, stadiumName: 'Neo Química Arena',      stadiumCapacity: 47605 },
  { id: 'atleticmg',      name: 'Atlético Mineiro',    shortName: 'CAM', leagueId: 'brasileirao', country: 'Brasil',    badge: '⚫', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Arena MRV',              stadiumCapacity: 42500 },
  { id: 'botafogo',       name: 'Botafogo',             shortName: 'BOT', leagueId: 'brasileirao', country: 'Brasil',    badge: '⚫', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 74, stadiumName: 'Nilton Santos',          stadiumCapacity: 46000 },
  { id: 'fluminense',     name: 'Fluminense',           shortName: 'FLU', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔴', primaryColor: '#5C1F00', secondaryColor: '#006E33', reputation: 73, stadiumName: 'Maracanã',               stadiumCapacity: 78838 },
  { id: 'internacional',  name: 'Internacional',        shortName: 'INT', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔴', primaryColor: '#E52B2B', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'Beira-Rio',              stadiumCapacity: 50128 },
  { id: 'gremio',         name: 'Grêmio',              shortName: 'GRE', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔵', primaryColor: '#0066CC', secondaryColor: '#000000', reputation: 72, stadiumName: 'Arena do Grêmio',       stadiumCapacity: 55000 },
  { id: 'cruzeiro',       name: 'Cruzeiro',             shortName: 'CRU', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔵', primaryColor: '#0043A0', secondaryColor: '#FFFFFF', reputation: 71, stadiumName: 'Mineirão',               stadiumCapacity: 61846 },
  { id: 'vasco',          name: 'Vasco da Gama',        shortName: 'VAS', leagueId: 'brasileirao', country: 'Brasil',    badge: '⚫', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 68, stadiumName: 'São Januário',           stadiumCapacity: 21880 },
  { id: 'bahia',          name: 'Bahia',                shortName: 'BAH', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔵', primaryColor: '#0000FF', secondaryColor: '#CC0000', reputation: 66, stadiumName: 'Arena Fonte Nova',       stadiumCapacity: 47907 },
  { id: 'fortaleza',      name: 'Fortaleza',            shortName: 'FOR', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#0000FF', reputation: 65, stadiumName: 'Castelão',               stadiumCapacity: 63903 },
  { id: 'bragantino',     name: 'RB Bragantino',        shortName: 'BRG', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 64, stadiumName: 'Nabi Abi Chedid',        stadiumCapacity: 18000 },
  { id: 'athleticopr',    name: 'Athletico-PR',         shortName: 'CAP', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#000000', reputation: 63, stadiumName: 'Ligga Arena',            stadiumCapacity: 42372 },
  { id: 'santos',         name: 'Santos',               shortName: 'SAN', leagueId: 'brasileirao', country: 'Brasil',    badge: '⚫', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 62, stadiumName: 'Vila Belmiro',           stadiumCapacity: 16068 },
  { id: 'ceara',          name: 'Ceará',                shortName: 'CEA', leagueId: 'brasileirao', country: 'Brasil',    badge: '⚫', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 58, stadiumName: 'Castelão',               stadiumCapacity: 63903 },
  { id: 'sport',          name: 'Sport Recife',         shortName: 'SPT', leagueId: 'brasileirao', country: 'Brasil',    badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#000000', reputation: 57, stadiumName: 'Ilha do Retiro',         stadiumCapacity: 22000 },
  { id: 'cuiaba',         name: 'Cuiabá',               shortName: 'CUI', leagueId: 'brasileirao', country: 'Brasil',    badge: '🟡', primaryColor: '#FFD700', secondaryColor: '#008000', reputation: 55, stadiumName: 'Arena Pantanal',         stadiumCapacity: 42968 },
  { id: 'juventude',      name: 'Juventude',            shortName: 'JUV', leagueId: 'brasileirao', country: 'Brasil',    badge: '🟢', primaryColor: '#00A859', secondaryColor: '#FFFFFF', reputation: 54, stadiumName: 'Alfredo Jaconi',         stadiumCapacity: 22000 },

  // ── PREMIER LEAGUE ───────────────────────────────────────────────────────────
  { id: 'mancity',        name: 'Manchester City',      shortName: 'MCI', leagueId: 'premier',     country: 'Inglaterra', badge: '🔵', primaryColor: '#6CABDD', secondaryColor: '#FFFFFF', reputation: 96, stadiumName: 'Etihad Stadium',         stadiumCapacity: 53400 },
  { id: 'arsenal',        name: 'Arsenal',              shortName: 'ARS', leagueId: 'premier',     country: 'Inglaterra', badge: '🔴', primaryColor: '#EF0107', secondaryColor: '#FFFFFF', reputation: 90, stadiumName: 'Emirates Stadium',       stadiumCapacity: 60704 },
  { id: 'liverpool',      name: 'Liverpool',            shortName: 'LIV', leagueId: 'premier',     country: 'Inglaterra', badge: '🔴', primaryColor: '#C8102E', secondaryColor: '#F6EB61', reputation: 91, stadiumName: 'Anfield',                stadiumCapacity: 61276 },
  { id: 'chelsea',        name: 'Chelsea',              shortName: 'CHE', leagueId: 'premier',     country: 'Inglaterra', badge: '🔵', primaryColor: '#034694', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Stamford Bridge',        stadiumCapacity: 40341 },
  { id: 'manutd',         name: 'Manchester United',   shortName: 'MUN', leagueId: 'premier',     country: 'Inglaterra', badge: '🔴', primaryColor: '#DA291C', secondaryColor: '#FFE987', reputation: 84, stadiumName: 'Old Trafford',           stadiumCapacity: 73811 },
  { id: 'tottenham',      name: 'Tottenham',            shortName: 'TOT', leagueId: 'premier',     country: 'Inglaterra', badge: '⚪', primaryColor: '#132257', secondaryColor: '#FFFFFF', reputation: 82, stadiumName: 'Tottenham Hotspur Std.', stadiumCapacity: 62850 },
  { id: 'newcastle',      name: 'Newcastle United',     shortName: 'NEW', leagueId: 'premier',     country: 'Inglaterra', badge: '⚫', primaryColor: '#241F20', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'St. James\' Park',       stadiumCapacity: 52354 },
  { id: 'astonvilla',     name: 'Aston Villa',          shortName: 'AVL', leagueId: 'premier',     country: 'Inglaterra', badge: '🟣', primaryColor: '#95BFE5', secondaryColor: '#670E36', reputation: 79, stadiumName: 'Villa Park',             stadiumCapacity: 42785 },
  { id: 'westham',        name: 'West Ham United',      shortName: 'WHU', leagueId: 'premier',     country: 'Inglaterra', badge: '🟣', primaryColor: '#7A263A', secondaryColor: '#1BB1E7', reputation: 73, stadiumName: 'London Stadium',         stadiumCapacity: 60000 },
  { id: 'brighton',       name: 'Brighton',             shortName: 'BHA', leagueId: 'premier',     country: 'Inglaterra', badge: '🔵', primaryColor: '#0057B8', secondaryColor: '#FFCD00', reputation: 72, stadiumName: 'AMEX Stadium',           stadiumCapacity: 31800 },

  // ── LA LIGA ───────────────────────────────────────────────────────────────────
  { id: 'realmadrid',     name: 'Real Madrid',          shortName: 'RMA', leagueId: 'laliga',      country: 'Espanha',    badge: '⚪', primaryColor: '#FEBE10', secondaryColor: '#FFFFFF', reputation: 99, stadiumName: 'Santiago Bernabéu',     stadiumCapacity: 81044 },
  { id: 'barcelona',      name: 'Barcelona',            shortName: 'BAR', leagueId: 'laliga',      country: 'Espanha',    badge: '🔴', primaryColor: '#A50044', secondaryColor: '#004D98', reputation: 96, stadiumName: 'Spotify Camp Nou',       stadiumCapacity: 99354 },
  { id: 'atleticomad',    name: 'Atlético de Madrid',   shortName: 'ATM', leagueId: 'laliga',      country: 'Espanha',    badge: '🔴', primaryColor: '#CE3524', secondaryColor: '#FFFFFF', reputation: 88, stadiumName: 'Metropolitano',          stadiumCapacity: 68456 },
  { id: 'sevilla',        name: 'Sevilla',              shortName: 'SEV', leagueId: 'laliga',      country: 'Espanha',    badge: '⚪', primaryColor: '#D4001A', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Ramón Sánchez-Pizjuán', stadiumCapacity: 43883 },
  { id: 'realsociedad',   name: 'Real Sociedad',        shortName: 'RSO', leagueId: 'laliga',      country: 'Espanha',    badge: '🔵', primaryColor: '#003DA5', secondaryColor: '#FFFFFF', reputation: 77, stadiumName: 'Reale Arena',            stadiumCapacity: 39500 },
  { id: 'villarreal',     name: 'Villarreal',           shortName: 'VIL', leagueId: 'laliga',      country: 'Espanha',    badge: '🟡', primaryColor: '#FCE300', secondaryColor: '#003B7B', reputation: 76, stadiumName: 'Estadio de la Cerámica', stadiumCapacity: 23000 },

  // ── SERIE A ───────────────────────────────────────────────────────────────────
  { id: 'inter',          name: 'Inter de Milão',       shortName: 'INT', leagueId: 'seriea',      country: 'Itália',     badge: '🔵', primaryColor: '#010E80', secondaryColor: '#000000', reputation: 92, stadiumName: 'Giuseppe Meazza',        stadiumCapacity: 75923 },
  { id: 'milan',          name: 'AC Milan',             shortName: 'MIL', leagueId: 'seriea',      country: 'Itália',     badge: '🔴', primaryColor: '#FB090B', secondaryColor: '#000000', reputation: 89, stadiumName: 'Giuseppe Meazza',        stadiumCapacity: 75923 },
  { id: 'juventus',       name: 'Juventus',             shortName: 'JUV', leagueId: 'seriea',      country: 'Itália',     badge: '⚫', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 87, stadiumName: 'Allianz Stadium',        stadiumCapacity: 41507 },
  { id: 'napoli',         name: 'Napoli',               shortName: 'NAP', leagueId: 'seriea',      country: 'Itália',     badge: '🔵', primaryColor: '#12A0C3', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Diego Armando Maradona', stadiumCapacity: 54726 },
  { id: 'roma',           name: 'Roma',                 shortName: 'ROM', leagueId: 'seriea',      country: 'Itália',     badge: '🟡', primaryColor: '#8E1F2F', secondaryColor: '#F0BC42', reputation: 83, stadiumName: 'Stadio Olimpico',        stadiumCapacity: 70634 },
  { id: 'atalanta',       name: 'Atalanta',             shortName: 'ATA', leagueId: 'seriea',      country: 'Itália',     badge: '🔵', primaryColor: '#0B1B60', secondaryColor: '#000000', reputation: 80, stadiumName: 'Gewiss Stadium',         stadiumCapacity: 21300 },

  // ── BUNDESLIGA ────────────────────────────────────────────────────────────────
  { id: 'bayernmunich',   name: 'Bayern de Munique',   shortName: 'BAY', leagueId: 'bundesliga',  country: 'Alemanha',   badge: '🔴', primaryColor: '#DC052D', secondaryColor: '#0066B2', reputation: 97, stadiumName: 'Allianz Arena',          stadiumCapacity: 75000 },
  { id: 'dortmund',       name: 'Borussia Dortmund',   shortName: 'BVB', leagueId: 'bundesliga',  country: 'Alemanha',   badge: '🟡', primaryColor: '#FDE100', secondaryColor: '#000000', reputation: 88, stadiumName: 'Signal Iduna Park',      stadiumCapacity: 81365 },
  { id: 'leverkusen',     name: 'Bayer Leverkusen',    shortName: 'B04', leagueId: 'bundesliga',  country: 'Alemanha',   badge: '🔴', primaryColor: '#E32221', secondaryColor: '#000000', reputation: 85, stadiumName: 'BayArena',               stadiumCapacity: 30210 },
  { id: 'leipzig',        name: 'RB Leipzig',          shortName: 'RBL', leagueId: 'bundesliga',  country: 'Alemanha',   badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Red Bull Arena',         stadiumCapacity: 47069 },
  { id: 'frankfurt',      name: 'Eintracht Frankfurt', shortName: 'SGE', leagueId: 'bundesliga',  country: 'Alemanha',   badge: '⚫', primaryColor: '#000000', secondaryColor: '#E1001A', reputation: 78, stadiumName: 'Deutsche Bank Park',     stadiumCapacity: 58000 },

  // ── LIGUE 1 ───────────────────────────────────────────────────────────────────
  { id: 'psg',            name: 'Paris Saint-Germain', shortName: 'PSG', leagueId: 'ligue1',      country: 'França',     badge: '🔵', primaryColor: '#004170', secondaryColor: '#DA291C', reputation: 94, stadiumName: 'Parc des Princes',       stadiumCapacity: 47929 },
  { id: 'marseille',      name: 'Olympique Marseille', shortName: 'OM',  leagueId: 'ligue1',      country: 'França',     badge: '⚪', primaryColor: '#2CBFEB', secondaryColor: '#FFFFFF', reputation: 81, stadiumName: 'Orange Vélodrome',       stadiumCapacity: 67394 },
  { id: 'monaco',         name: 'AS Monaco',           shortName: 'MON', leagueId: 'ligue1',      country: 'França',     badge: '🔴', primaryColor: '#CE1126', secondaryColor: '#FFFFFF', reputation: 79, stadiumName: 'Stade Louis II',         stadiumCapacity: 18523 },
  { id: 'lyon',           name: 'Olympique Lyonnais',  shortName: 'OL',  leagueId: 'ligue1',      country: 'França',     badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'Groupama Stadium',       stadiumCapacity: 59186 },
  { id: 'lille',          name: 'Lille OSC',           shortName: 'LIL', leagueId: 'ligue1',      country: 'França',     badge: '🔴', primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Stade Pierre-Mauroy',    stadiumCapacity: 50186 },
];

export function getTeam(id: string): Team | undefined {
  return ALL_TEAMS.find(t => t.id === id);
}

export function getTeamsByLeague(leagueId: string): Team[] {
  return ALL_TEAMS.filter(t => t.leagueId === leagueId);
}
