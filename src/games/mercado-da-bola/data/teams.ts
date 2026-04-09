import type { Team } from '../types';

// badge field = visual decoration for SVG shield:
// 'plain' | 'stripe' | 'sash' | 'chevron' | 'thirds' | 'quarters' | 'cross' | 'diagonal'

export const ALL_TEAMS: Team[] = [

  // ── LIGA AURIVERDE ───────────────────────────────────────────────────────────
  { id: 'flamengo',    name: 'Atlético Guanabara',     shortName: 'ATG', leagueId: 'brasileirao', country: 'Auriverde', badge: 'diagonal', primaryColor: '#CC0000', secondaryColor: '#000000', reputation: 85, stadiumName: 'Estádio da Guanabara',    stadiumCapacity: 78000 },
  { id: 'palmeiras',   name: 'Esmeralda FC',            shortName: 'ESM', leagueId: 'brasileirao', country: 'Auriverde', badge: 'plain',    primaryColor: '#006437', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Arena Esmeralda',          stadiumCapacity: 43000 },
  { id: 'saopaulo',    name: 'Metrópolis SC',           shortName: 'MET', leagueId: 'brasileirao', country: 'Auriverde', badge: 'stripe',   primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 78, stadiumName: 'Arena Metrópolis',         stadiumCapacity: 70000 },
  { id: 'corinthians', name: 'Alvinegra FC',            shortName: 'ALV', leagueId: 'brasileirao', country: 'Auriverde', badge: 'quarters', primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 76, stadiumName: 'Estádio Alvinegro',        stadiumCapacity: 47000 },
  { id: 'atleticmg',   name: 'Mineiro Dragão FC',       shortName: 'MDR', leagueId: 'brasileirao', country: 'Auriverde', badge: 'sash',     primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Arena das Gerais',         stadiumCapacity: 42000 },
  { id: 'botafogo',    name: 'Estrela FC',              shortName: 'EST', leagueId: 'brasileirao', country: 'Auriverde', badge: 'chevron',  primaryColor: '#1A1A1A', secondaryColor: '#E0E0E0', reputation: 74, stadiumName: 'Estádio da Estrela',       stadiumCapacity: 46000 },
  { id: 'fluminense',  name: 'Verde-Grenã FC',          shortName: 'VGF', leagueId: 'brasileirao', country: 'Auriverde', badge: 'thirds',   primaryColor: '#5C1F00', secondaryColor: '#006E33', reputation: 73, stadiumName: 'Estádio das Laranjeiras',  stadiumCapacity: 78000 },
  { id: 'internacional', name: 'Gaúcho Vermelho FC',   shortName: 'GVF', leagueId: 'brasileirao', country: 'Auriverde', badge: 'stripe',   primaryColor: '#E52B2B', secondaryColor: '#FFFFFF', reputation: 72, stadiumName: 'Arena do Sul',             stadiumCapacity: 50000 },
  { id: 'gremio',      name: 'Tricolor Rio-Grandense',  shortName: 'TRG', leagueId: 'brasileirao', country: 'Auriverde', badge: 'chevron',  primaryColor: '#0066CC', secondaryColor: '#000000', reputation: 72, stadiumName: 'Arena Rio-Grandense',      stadiumCapacity: 55000 },
  { id: 'cruzeiro',    name: 'Celeste FC',              shortName: 'CEL', leagueId: 'brasileirao', country: 'Auriverde', badge: 'plain',    primaryColor: '#0043A0', secondaryColor: '#FFFFFF', reputation: 71, stadiumName: 'Estádio Celeste',          stadiumCapacity: 61000 },
  { id: 'vasco',       name: 'Cruz Negra FC',           shortName: 'CNF', leagueId: 'brasileirao', country: 'Auriverde', badge: 'cross',    primaryColor: '#000000', secondaryColor: '#FFFFFF', reputation: 68, stadiumName: 'Arena Cruz Negra',         stadiumCapacity: 22000 },
  { id: 'bahia',       name: 'Oceânico FC',             shortName: 'OCE', leagueId: 'brasileirao', country: 'Auriverde', badge: 'diagonal', primaryColor: '#0000CC', secondaryColor: '#CC0000', reputation: 66, stadiumName: 'Arena Oceânica',           stadiumCapacity: 47000 },
  { id: 'fortaleza',   name: 'Leão Nortista FC',        shortName: 'LNF', leagueId: 'brasileirao', country: 'Auriverde', badge: 'sash',     primaryColor: '#CC0000', secondaryColor: '#0000CC', reputation: 65, stadiumName: 'Castelo do Norte',         stadiumCapacity: 63000 },
  { id: 'bragantino',  name: 'Touro Vermelho FC',       shortName: 'TVF', leagueId: 'brasileirao', country: 'Auriverde', badge: 'plain',    primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 64, stadiumName: 'Arena Touro',              stadiumCapacity: 18000 },
  { id: 'athleticopr', name: 'Furacão do Sul FC',       shortName: 'FSF', leagueId: 'brasileirao', country: 'Auriverde', badge: 'stripe',   primaryColor: '#CC0000', secondaryColor: '#000000', reputation: 63, stadiumName: 'Arena Furacão',            stadiumCapacity: 42000 },
  { id: 'santos',      name: 'Praiano FC',              shortName: 'PRA', leagueId: 'brasileirao', country: 'Auriverde', badge: 'plain',    primaryColor: '#1A1A1A', secondaryColor: '#FFFFFF', reputation: 62, stadiumName: 'Estádio da Praia',         stadiumCapacity: 16000 },
  { id: 'ceara',       name: 'Nordestino FC',           shortName: 'NOR', leagueId: 'brasileirao', country: 'Auriverde', badge: 'diagonal', primaryColor: '#111111', secondaryColor: '#CCCCCC', reputation: 58, stadiumName: 'Arena Nordestina',         stadiumCapacity: 63000 },
  { id: 'sport',       name: 'Arrecife FC',             shortName: 'ARR', leagueId: 'brasileirao', country: 'Auriverde', badge: 'sash',     primaryColor: '#CC0000', secondaryColor: '#1A1A1A', reputation: 57, stadiumName: 'Estádio da Ilha',          stadiumCapacity: 22000 },
  { id: 'cuiaba',      name: 'Pantanal FC',             shortName: 'PAN', leagueId: 'brasileirao', country: 'Auriverde', badge: 'chevron',  primaryColor: '#C8A200', secondaryColor: '#006600', reputation: 55, stadiumName: 'Arena Pantanal FC',        stadiumCapacity: 42000 },
  { id: 'juventude',   name: 'Serra Gaúcha FC',         shortName: 'SGF', leagueId: 'brasileirao', country: 'Auriverde', badge: 'plain',    primaryColor: '#007A3D', secondaryColor: '#FFFFFF', reputation: 54, stadiumName: 'Estádio da Serra',         stadiumCapacity: 22000 },

  // ── LIGA ALBION ──────────────────────────────────────────────────────────────
  { id: 'mancity',     name: 'Azure City FC',           shortName: 'AZC', leagueId: 'premier',     country: 'Albion',    badge: 'plain',    primaryColor: '#6CABDD', secondaryColor: '#FFFFFF', reputation: 96, stadiumName: 'Estádio Azure',            stadiumCapacity: 53000 },
  { id: 'arsenal',     name: 'London Cannons FC',        shortName: 'LCF', leagueId: 'premier',     country: 'Albion',    badge: 'sash',     primaryColor: '#EF0107', secondaryColor: '#FFFFFF', reputation: 90, stadiumName: 'Canhões de Londres',       stadiumCapacity: 60000 },
  { id: 'liverpool',   name: 'Mersey Reds FC',           shortName: 'MRF', leagueId: 'premier',     country: 'Albion',    badge: 'diagonal', primaryColor: '#C8102E', secondaryColor: '#F6EB61', reputation: 91, stadiumName: 'Estádio do Mersey',        stadiumCapacity: 61000 },
  { id: 'chelsea',     name: 'Thames Blues FC',          shortName: 'TBF', leagueId: 'premier',     country: 'Albion',    badge: 'stripe',   primaryColor: '#034694', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Arena do Tâmisa',          stadiumCapacity: 40000 },
  { id: 'manutd',      name: 'Northern Devils FC',       shortName: 'NDF', leagueId: 'premier',     country: 'Albion',    badge: 'chevron',  primaryColor: '#DA291C', secondaryColor: '#FFE987', reputation: 84, stadiumName: 'Old Albion Arena',         stadiumCapacity: 73000 },
  { id: 'tottenham',   name: 'Silver Spurs FC',          shortName: 'SSF', leagueId: 'premier',     country: 'Albion',    badge: 'plain',    primaryColor: '#132257', secondaryColor: '#FFFFFF', reputation: 82, stadiumName: 'Arena das Esporas',        stadiumCapacity: 62000 },
  { id: 'newcastle',   name: 'Magpies United FC',        shortName: 'MUF', leagueId: 'premier',     country: 'Albion',    badge: 'quarters', primaryColor: '#241F20', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Estádio do Norte',         stadiumCapacity: 52000 },
  { id: 'astonvilla',  name: 'Claret Lions FC',          shortName: 'CLF', leagueId: 'premier',     country: 'Albion',    badge: 'thirds',   primaryColor: '#670E36', secondaryColor: '#95BFE5', reputation: 79, stadiumName: 'Villa Park Albion',        stadiumCapacity: 42000 },
  { id: 'westham',     name: 'Hammers FC',               shortName: 'HAM', leagueId: 'premier',     country: 'Albion',    badge: 'sash',     primaryColor: '#7A263A', secondaryColor: '#1BB1E7', reputation: 73, stadiumName: 'London Iron Arena',        stadiumCapacity: 60000 },
  { id: 'brighton',    name: 'Seabird FC',               shortName: 'SEA', leagueId: 'premier',     country: 'Albion',    badge: 'stripe',   primaryColor: '#0057B8', secondaryColor: '#FFCD00', reputation: 72, stadiumName: 'Arena Costeira',           stadiumCapacity: 31000 },

  // ── LIGA SOLARIS ─────────────────────────────────────────────────────────────
  { id: 'realmadrid',  name: 'Los Blancos Reales',       shortName: 'LBR', leagueId: 'laliga',      country: 'Solaris',   badge: 'plain',    primaryColor: '#D4AF37', secondaryColor: '#FFFFFF', reputation: 99, stadiumName: 'Gran Estadio Capital',     stadiumCapacity: 81000 },
  { id: 'barcelona',   name: 'Azulgrana FC',             shortName: 'AZG', leagueId: 'laliga',      country: 'Solaris',   badge: 'diagonal', primaryColor: '#A50044', secondaryColor: '#004D98', reputation: 96, stadiumName: 'Camp Solaris',             stadiumCapacity: 99000 },
  { id: 'atleticomad', name: 'Osos Rojos FC',            shortName: 'ORF', leagueId: 'laliga',      country: 'Solaris',   badge: 'stripe',   primaryColor: '#CE3524', secondaryColor: '#FFFFFF', reputation: 88, stadiumName: 'Estadio de los Osos',      stadiumCapacity: 68000 },
  { id: 'sevilla',     name: 'Los Rojiblancos del Sur',  shortName: 'RBS', leagueId: 'laliga',      country: 'Solaris',   badge: 'sash',     primaryColor: '#D4001A', secondaryColor: '#FFFFFF', reputation: 80, stadiumName: 'Estadio del Sur',          stadiumCapacity: 43000 },
  { id: 'realsociedad',name: 'Sociedad Vasca FC',        shortName: 'SVF', leagueId: 'laliga',      country: 'Solaris',   badge: 'plain',    primaryColor: '#003DA5', secondaryColor: '#FFFFFF', reputation: 77, stadiumName: 'Estadio del Norte',        stadiumCapacity: 39000 },
  { id: 'villarreal',  name: 'Submarino Amarelo FC',     shortName: 'SAF', leagueId: 'laliga',      country: 'Solaris',   badge: 'chevron',  primaryColor: '#D4B800', secondaryColor: '#003B7B', reputation: 76, stadiumName: 'Estadio Ceramica',         stadiumCapacity: 23000 },

  // ── CALCIO AZZURRA ───────────────────────────────────────────────────────────
  { id: 'inter',       name: 'Nerazzurri Citta FC',      shortName: 'NCI', leagueId: 'seriea',      country: 'Azzurra',   badge: 'diagonal', primaryColor: '#010E80', secondaryColor: '#333333', reputation: 92, stadiumName: 'Giuseppe Azzurra',         stadiumCapacity: 75000 },
  { id: 'milan',       name: 'Rossoneri FC',             shortName: 'ROS', leagueId: 'seriea',      country: 'Azzurra',   badge: 'diagonal', primaryColor: '#FB090B', secondaryColor: '#1A1A1A', reputation: 89, stadiumName: 'Giuseppe Azzurra',         stadiumCapacity: 75000 },
  { id: 'juventus',    name: 'Bianconeri FC',            shortName: 'BNC', leagueId: 'seriea',      country: 'Azzurra',   badge: 'diagonal', primaryColor: '#111111', secondaryColor: '#FFFFFF', reputation: 87, stadiumName: 'Stadio Bianconero',        stadiumCapacity: 41000 },
  { id: 'napoli',      name: 'Vesuvio Azzurro FC',       shortName: 'VAZ', leagueId: 'seriea',      country: 'Azzurra',   badge: 'plain',    primaryColor: '#12A0C3', secondaryColor: '#FFFFFF', reputation: 85, stadiumName: 'Stadio del Vesuvio',       stadiumCapacity: 54000 },
  { id: 'roma',        name: 'Lupa Azzurra FC',          shortName: 'LAF', leagueId: 'seriea',      country: 'Azzurra',   badge: 'sash',     primaryColor: '#8E1F2F', secondaryColor: '#F0BC42', reputation: 83, stadiumName: 'Stadio della Lupa',        stadiumCapacity: 70000 },
  { id: 'atalanta',    name: 'La Dea FC',                shortName: 'DEA', leagueId: 'seriea',      country: 'Azzurra',   badge: 'plain',    primaryColor: '#0B1B60', secondaryColor: '#1A90C0', reputation: 80, stadiumName: 'Stadio La Dea',            stadiumCapacity: 21000 },

  // ── LIGA NORDENIA ────────────────────────────────────────────────────────────
  { id: 'bayernmunich',name: 'Roten Riesen FC',          shortName: 'RRF', leagueId: 'bundesliga',  country: 'Nordenia',  badge: 'diagonal', primaryColor: '#DC052D', secondaryColor: '#0066B2', reputation: 97, stadiumName: 'Allianz Nordenia',         stadiumCapacity: 75000 },
  { id: 'dortmund',    name: 'Schwarzgelben FC',         shortName: 'SGF', leagueId: 'bundesliga',  country: 'Nordenia',  badge: 'plain',    primaryColor: '#FDE100', secondaryColor: '#1A1A1A', reputation: 88, stadiumName: 'Signal Nordenia Park',     stadiumCapacity: 81000 },
  { id: 'leverkusen',  name: 'Werkself Roten FC',        shortName: 'WRF', leagueId: 'bundesliga',  country: 'Nordenia',  badge: 'sash',     primaryColor: '#E32221', secondaryColor: '#111111', reputation: 85, stadiumName: 'Bay Nordenia Arena',       stadiumCapacity: 30000 },
  { id: 'leipzig',     name: 'Stadtbullen FC',           shortName: 'STB', leagueId: 'bundesliga',  country: 'Nordenia',  badge: 'chevron',  primaryColor: '#CC0000', secondaryColor: '#FFFFFF', reputation: 83, stadiumName: 'Roten Nordenia Arena',     stadiumCapacity: 47000 },
  { id: 'frankfurt',   name: 'Adlerstein FC',            shortName: 'ADS', leagueId: 'bundesliga',  country: 'Nordenia',  badge: 'plain',    primaryColor: '#1A1A1A', secondaryColor: '#E1001A', reputation: 78, stadiumName: 'Deutsche Nordenia Bank',   stadiumCapacity: 58000 },

  // ── LIGUE ATLANTIS ───────────────────────────────────────────────────────────
  { id: 'psg',         name: 'Capital City FC',          shortName: 'CCF', leagueId: 'ligue1',      country: 'Atlantis',  badge: 'stripe',   primaryColor: '#004170', secondaryColor: '#DA291C', reputation: 94, stadiumName: 'Parc Atlantis',            stadiumCapacity: 47000 },
  { id: 'marseille',   name: 'Les Phoceens FC',          shortName: 'PHO', leagueId: 'ligue1',      country: 'Atlantis',  badge: 'plain',    primaryColor: '#2CBFEB', secondaryColor: '#FFFFFF', reputation: 81, stadiumName: 'Orange Atlantis',          stadiumCapacity: 67000 },
  { id: 'monaco',      name: 'Principaute FC',           shortName: 'PRC', leagueId: 'ligue1',      country: 'Atlantis',  badge: 'diagonal', primaryColor: '#CE1126', secondaryColor: '#FFFFFF', reputation: 79, stadiumName: 'Stade Louis Atlantis',     stadiumCapacity: 18000 },
  { id: 'lyon',        name: 'Lions du Rhone FC',        shortName: 'LRF', leagueId: 'ligue1',      country: 'Atlantis',  badge: 'chevron',  primaryColor: '#C8003B', secondaryColor: '#F5A623', reputation: 78, stadiumName: 'Groupama Atlantis',        stadiumCapacity: 59000 },
  { id: 'lille',       name: 'Les Dogues FC',            shortName: 'LDF', leagueId: 'ligue1',      country: 'Atlantis',  badge: 'sash',     primaryColor: '#8B0000', secondaryColor: '#FFFFFF', reputation: 75, stadiumName: 'Atlantis Nord Arena',      stadiumCapacity: 50000 },
];

export function getTeam(id: string): Team | undefined {
  return ALL_TEAMS.find(t => t.id === id);
}

export function getTeamsByLeague(leagueId: string): Team[] {
  return ALL_TEAMS.filter(t => t.leagueId === leagueId);
}
