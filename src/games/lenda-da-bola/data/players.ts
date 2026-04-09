import type { Player, Position } from '../types/game';
import { legendaryAvatarUrl, genericAvatarUrl } from '../utils/playerArt';

const positions: Position[] = ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','CF','ST'];
const nationalities = ['Brazil','Argentina','France','Germany','Spain','Italy','Portugal','England','Netherlands','Belgium','Uruguay','Croatia'];

// Deterministic pseudo-random for consistent player generation
function seededRand(seed: number) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function getInt(rand: () => number, min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function generateGenericPlayers(count: number): Player[] {
  const rand = seededRand(42);
  return Array.from({ length: count }, (_, i) => {
    const stars = getInt(rand, 2, 4);
    const base = stars * 15 + 20;
    return {
      id: `generic-${i}`,
      name: `Jogador ${i + 1}`,
      fullName: `Generic Player ${i + 1}`,
      photo: genericAvatarUrl(`generic-${i}`),
      age: getInt(rand, 18, 35),
      nationality: nationalities[i % nationalities.length],
      position: positions[i % positions.length],
      currentTeamId: 'free-agent',
      stars,
      attributes: {
        pace:      getInt(rand, base - 10, base + 10),
        shooting:  getInt(rand, base - 10, base + 10),
        passing:   getInt(rand, base - 10, base + 10),
        dribbling: getInt(rand, base - 10, base + 10),
        defending: getInt(rand, base - 10, base + 10),
        physical:  getInt(rand, base - 10, base + 10),
      },
      marketValue: stars * 1_000_000,
      wage: stars * 10_000,
      contractExpiresIn: 3,
      moodPoints: 70,
      lifestyle: 'Standard',
      lifestyleMonthlyExpense: 5_000,
      xp: 0,
      level: 1,
      rarity: stars === 4 ? 'rare' : 'common',
      recentForm: [1, 1, 1, 1, 1],
    };
  });
}

export const GENERIC_PLAYERS: Player[] = generateGenericPlayers(84);

export const LEGENDARY_PLAYERS: Player[] = [
  { id: 'pele', name: 'Pelé', fullName: 'Edson Arantes do Nascimento', photo: legendaryAvatarUrl('pele'), age: 29, nationality: 'Brazil', position: 'ST', currentTeamId: 'legend', stars: 5, attributes: { pace:95, shooting:98, passing:92, dribbling:96, defending:50, physical:88 }, marketValue:500_000_000, wage:1_000_000, contractExpiresIn:99, moodPoints:100, lifestyle:'King', lifestyleMonthlyExpense:100_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1970', lore:'O Rei do Futebol. Único jogador a vencer 3 Copas do Mundo.' },
  { id: 'maradona', name: 'Maradona', fullName: 'Diego Armando Maradona', photo: legendaryAvatarUrl('maradona'), age: 26, nationality: 'Argentina', position: 'CAM', currentTeamId: 'legend', stars: 5, attributes: { pace:92, shooting:94, passing:98, dribbling:99, defending:45, physical:85 }, marketValue:450_000_000, wage:900_000, contractExpiresIn:99, moodPoints:100, lifestyle:'God', lifestyleMonthlyExpense:150_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1986', lore:'El Pibe de Oro. Autor do Gol do Século e da Mão de Deus.' },
  { id: 'messi', name: 'Messi', fullName: 'Lionel Andrés Messi', photo: legendaryAvatarUrl('messi'), age: 35, nationality: 'Argentina', position: 'RW', currentTeamId: 'legend', stars: 5, attributes: { pace:88, shooting:95, passing:98, dribbling:99, defending:40, physical:75 }, marketValue:400_000_000, wage:1_200_000, contractExpiresIn:99, moodPoints:100, lifestyle:'GOAT', lifestyleMonthlyExpense:200_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'2022', lore:'O gênio da era moderna. Conquistou o mundo no Catar.' },
  { id: 'cr7', name: 'C. Ronaldo', fullName: 'Cristiano Ronaldo dos Santos Aveiro', photo: legendaryAvatarUrl('cr7'), age: 33, nationality: 'Portugal', position: 'ST', currentTeamId: 'legend', stars: 5, attributes: { pace:92, shooting:98, passing:82, dribbling:88, defending:45, physical:95 }, marketValue:380_000_000, wage:1_500_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Machine', lifestyleMonthlyExpense:300_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'2016', lore:'O maior artilheiro da história. Dedicação e força física.' },
  { id: 'ronaldinho', name: 'Ronaldinho', fullName: 'Ronaldo de Assis Moreira', photo: legendaryAvatarUrl('ronaldinho'), age: 26, nationality: 'Brazil', position: 'CAM', currentTeamId: 'legend', stars: 5, attributes: { pace:90, shooting:88, passing:95, dribbling:99, defending:40, physical:78 }, marketValue:350_000_000, wage:800_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Magic', lifestyleMonthlyExpense:120_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'2002', lore:'O Bruxo. Transformou o futebol em arte com seu sorriso e dribles impossíveis.' },
  { id: 'ronaldo-fenomeno', name: 'Ronaldo', fullName: 'Ronaldo Luís Nazário de Lima', photo: legendaryAvatarUrl('ronaldo-fenomeno'), age: 21, nationality: 'Brazil', position: 'ST', currentTeamId: 'legend', stars: 5, attributes: { pace:98, shooting:97, passing:80, dribbling:98, defending:35, physical:88 }, marketValue:480_000_000, wage:1_100_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Phenomenon', lifestyleMonthlyExpense:200_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1997', lore:'O Fenômeno. O atacante mais imparável que o mundo já viu.' },
  { id: 'zidane', name: 'Zidane', fullName: 'Zinedine Yazid Zidane', photo: legendaryAvatarUrl('zidane'), age: 26, nationality: 'France', position: 'CAM', currentTeamId: 'legend', stars: 5, attributes: { pace:82, shooting:88, passing:99, dribbling:98, defending:65, physical:85 }, marketValue:380_000_000, wage:850_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Maestro', lifestyleMonthlyExpense:100_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1998', lore:'A elegância personificada. Decidiu a Copa de 98 com dois gols de cabeça.' },
  { id: 'neymar', name: 'Neymar Jr', fullName: 'Neymar da Silva Santos Júnior', photo: legendaryAvatarUrl('neymar'), age: 23, nationality: 'Brazil', position: 'LW', currentTeamId: 'legend', stars: 5, attributes: { pace:92, shooting:88, passing:94, dribbling:98, defending:35, physical:70 }, marketValue:320_000_000, wage:1_000_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Star', lifestyleMonthlyExpense:250_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'2015', lore:'O herdeiro do futebol arte brasileiro. Dribles desconcertantes e visão de jogo única.' },
  { id: 'kaka', name: 'Kaká', fullName: 'Ricardo Izecson dos Santos Leite', photo: legendaryAvatarUrl('kaka'), age: 25, nationality: 'Brazil', position: 'CAM', currentTeamId: 'legend', stars: 5, attributes: { pace:94, shooting:88, passing:90, dribbling:92, defending:55, physical:80 }, marketValue:300_000_000, wage:700_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Elegant', lifestyleMonthlyExpense:80_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'2007', lore:"O último humano a vencer o Ballon d'Or antes da era Messi-CR7." },
  { id: 'garrincha', name: 'Garrincha', fullName: 'Manuel Francisco dos Santos', photo: legendaryAvatarUrl('garrincha'), age: 25, nationality: 'Brazil', position: 'RW', currentTeamId: 'legend', stars: 5, attributes: { pace:92, shooting:85, passing:88, dribbling:99, defending:30, physical:75 }, marketValue:330_000_000, wage:600_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Joy', lifestyleMonthlyExpense:50_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1962', lore:'O Anjo das Pernas Tortas. A alegria do povo e o maior driblador de todos os tempos.' },
  { id: 'romario', name: 'Romário', fullName: 'Romário de Souza Faria', photo: legendaryAvatarUrl('romario'), age: 28, nationality: 'Brazil', position: 'ST', currentTeamId: 'legend', stars: 5, attributes: { pace:90, shooting:99, passing:82, dribbling:96, defending:30, physical:78 }, marketValue:370_000_000, wage:900_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Baixinho', lifestyleMonthlyExpense:150_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1994', lore:'O Gênio da Grande Área. Decisivo, letal e inesquecível em 94.' },
  { id: 'cruyff', name: 'Cruyff', fullName: 'Hendrik Johannes Cruijff', photo: legendaryAvatarUrl('cruyff'), age: 27, nationality: 'Netherlands', position: 'CF', currentTeamId: 'legend', stars: 5, attributes: { pace:92, shooting:90, passing:96, dribbling:98, defending:50, physical:78 }, marketValue:420_000_000, wage:800_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Total Football', lifestyleMonthlyExpense:90_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1974', lore:'O arquiteto do Futebol Total. Mudou a forma como o jogo é pensado.' },
  { id: 'beckenbauer', name: 'Beckenbauer', fullName: 'Franz Anton Beckenbauer', photo: legendaryAvatarUrl('beckenbauer'), age: 28, nationality: 'Germany', position: 'CB', currentTeamId: 'legend', stars: 5, attributes: { pace:85, shooting:78, passing:94, dribbling:88, defending:98, physical:88 }, marketValue:380_000_000, wage:750_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Kaiser', lifestyleMonthlyExpense:85_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1974', lore:'Der Kaiser. O líbero perfeito. Liderança e técnica inigualáveis.' },
  { id: 'maldini', name: 'Maldini', fullName: 'Paolo Cesare Maldini', photo: legendaryAvatarUrl('maldini'), age: 26, nationality: 'Italy', position: 'LB', currentTeamId: 'legend', stars: 5, attributes: { pace:88, shooting:65, passing:85, dribbling:82, defending:99, physical:92 }, marketValue:350_000_000, wage:700_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Captain', lifestyleMonthlyExpense:60_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1994', lore:'A personificação da defesa. Elegância e precisão em cada desarme.' },
  { id: 'yashin', name: 'Yashin', fullName: 'Lev Ivanovich Yashin', photo: legendaryAvatarUrl('yashin'), age: 30, nationality: 'Russia', position: 'GK', currentTeamId: 'legend', stars: 5, attributes: { pace:85, shooting:30, passing:75, dribbling:70, defending:99, physical:95 }, marketValue:300_000_000, wage:500_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Spider', lifestyleMonthlyExpense:50_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1963', lore:'O Aranha Negra. Único goleiro a vencer a Bola de Ouro.' },
  { id: 'van-basten', name: 'Van Basten', fullName: 'Marcel van Basten', photo: legendaryAvatarUrl('van-basten'), age: 24, nationality: 'Netherlands', position: 'ST', currentTeamId: 'legend', stars: 5, attributes: { pace:88, shooting:98, passing:85, dribbling:92, defending:40, physical:82 }, marketValue:350_000_000, wage:800_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Swan', lifestyleMonthlyExpense:90_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1988', lore:'O Cisne de Utrecht. Gols acrobáticos e técnica refinada.' },
  { id: 'platini', name: 'Platini', fullName: 'Michel François Platini', photo: legendaryAvatarUrl('platini'), age: 28, nationality: 'France', position: 'CAM', currentTeamId: 'legend', stars: 5, attributes: { pace:80, shooting:94, passing:98, dribbling:92, defending:50, physical:75 }, marketValue:340_000_000, wage:750_000, contractExpiresIn:99, moodPoints:100, lifestyle:'King', lifestyleMonthlyExpense:90_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1984', lore:'O mestre das faltas e da visão de jogo. Liderou a França ao título europeu.' },
  { id: 'puskas', name: 'Puskás', fullName: 'Ferenc Puskás', photo: legendaryAvatarUrl('puskas'), age: 27, nationality: 'Hungary', position: 'ST', currentTeamId: 'legend', stars: 5, attributes: { pace:85, shooting:99, passing:90, dribbling:92, defending:35, physical:82 }, marketValue:360_000_000, wage:700_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Major', lifestyleMonthlyExpense:80_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1954', lore:'O Major Galopante. A perna esquerda mais potente da história.' },
  { id: 'eusebio', name: 'Eusébio', fullName: 'Eusébio da Silva Ferreira', photo: legendaryAvatarUrl('eusebio'), age: 24, nationality: 'Portugal', position: 'ST', currentTeamId: 'legend', stars: 5, attributes: { pace:94, shooting:96, passing:82, dribbling:90, defending:40, physical:88 }, marketValue:320_000_000, wage:650_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Panther', lifestyleMonthlyExpense:70_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'1966', lore:'O Pantera Negra. Explosão e finalização mortal.' },
  { id: 'tevez', name: 'Tevez', fullName: 'Carlos Alberto Tevez', photo: legendaryAvatarUrl('tevez'), age: 24, nationality: 'Argentina', position: 'CF', currentTeamId: 'legend', stars: 5, attributes: { pace:88, shooting:90, passing:82, dribbling:88, defending:60, physical:92 }, marketValue:250_000_000, wage:600_000, contractExpiresIn:99, moodPoints:100, lifestyle:'Warrior', lifestyleMonthlyExpense:70_000, xp:0, level:10, rarity:'legendary', recentForm:[3,3,3,3,3], era:'2008', lore:'O jogador do povo. Raça e técnica em um só atacante.' },
];
