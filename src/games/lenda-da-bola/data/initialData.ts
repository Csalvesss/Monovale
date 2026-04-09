import type { Team, Sponsor } from '../types/game';

export const TEAMS: Team[] = [
  { id: 'brazil',      name: 'Brasil',          shortName: 'BRA', badge: '🇧🇷', flag: 'https://flagcdn.com/br.svg',     leagueId: 'world-cup', budget: 100_000_000, reputation: 95, players: [], group: 'A', isUserControlled: true },
  { id: 'argentina',   name: 'Argentina',        shortName: 'ARG', badge: '🇦🇷', flag: 'https://flagcdn.com/ar.svg',     leagueId: 'world-cup', budget:  90_000_000, reputation: 94, players: [], group: 'A' },
  { id: 'france',      name: 'França',           shortName: 'FRA', badge: '🇫🇷', flag: 'https://flagcdn.com/fr.svg',     leagueId: 'world-cup', budget:  95_000_000, reputation: 93, players: [], group: 'B' },
  { id: 'germany',     name: 'Alemanha',         shortName: 'GER', badge: '🇩🇪', flag: 'https://flagcdn.com/de.svg',     leagueId: 'world-cup', budget:  85_000_000, reputation: 92, players: [], group: 'B' },
  { id: 'portugal',    name: 'Portugal',         shortName: 'POR', badge: '🇵🇹', flag: 'https://flagcdn.com/pt.svg',     leagueId: 'world-cup', budget:  80_000_000, reputation: 90, players: [], group: 'C' },
  { id: 'england',     name: 'Inglaterra',       shortName: 'ENG', badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flag: 'https://flagcdn.com/gb-eng.svg', leagueId: 'world-cup', budget:  88_000_000, reputation: 91, players: [], group: 'C' },
  { id: 'spain',       name: 'Espanha',          shortName: 'ESP', badge: '🇪🇸', flag: 'https://flagcdn.com/es.svg',     leagueId: 'world-cup', budget:  82_000_000, reputation: 89, players: [], group: 'D' },
  { id: 'italy',       name: 'Itália',           shortName: 'ITA', badge: '🇮🇹', flag: 'https://flagcdn.com/it.svg',     leagueId: 'world-cup', budget:  78_000_000, reputation: 88, players: [], group: 'D' },
  { id: 'netherlands', name: 'Holanda',          shortName: 'NED', badge: '🇳🇱', flag: 'https://flagcdn.com/nl.svg',     leagueId: 'world-cup', budget:  76_000_000, reputation: 87, players: [], group: 'E' },
  { id: 'belgium',     name: 'Bélgica',          shortName: 'BEL', badge: '🇧🇪', flag: 'https://flagcdn.com/be.svg',     leagueId: 'world-cup', budget:  74_000_000, reputation: 86, players: [], group: 'E' },
  { id: 'uruguay',     name: 'Uruguai',          shortName: 'URU', badge: '🇺🇾', flag: 'https://flagcdn.com/uy.svg',     leagueId: 'world-cup', budget:  60_000_000, reputation: 82, players: [], group: 'F' },
  { id: 'croatia',     name: 'Croácia',          shortName: 'CRO', badge: '🇭🇷', flag: 'https://flagcdn.com/hr.svg',     leagueId: 'world-cup', budget:  55_000_000, reputation: 80, players: [], group: 'F' },
  { id: 'mexico',      name: 'México',           shortName: 'MEX', badge: '🇲🇽', flag: 'https://flagcdn.com/mx.svg',     leagueId: 'world-cup', budget:  58_000_000, reputation: 79, players: [], group: 'G' },
  { id: 'usa',         name: 'Estados Unidos',   shortName: 'USA', badge: '🇺🇸', flag: 'https://flagcdn.com/us.svg',     leagueId: 'world-cup', budget:  62_000_000, reputation: 78, players: [], group: 'G' },
  { id: 'senegal',     name: 'Senegal',          shortName: 'SEN', badge: '🇸🇳', flag: 'https://flagcdn.com/sn.svg',     leagueId: 'world-cup', budget:  40_000_000, reputation: 75, players: [], group: 'H' },
  { id: 'japan',       name: 'Japão',            shortName: 'JPN', badge: '🇯🇵', flag: 'https://flagcdn.com/jp.svg',     leagueId: 'world-cup', budget:  45_000_000, reputation: 74, players: [], group: 'H' },
];

export const SPONSORS: Sponsor[] = [
  {
    id: 'adidas',
    name: 'Adidas',
    logo: '⚽',
    reward: 5_000_000,
    requirement: 'Vença 3 partidas consecutivas',
    perks: ['Kit exclusivo para o elenco', '+10% na venda de jogadores'],
    color: '#000000',
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    logo: '🥤',
    reward: 3_000_000,
    requirement: 'Classifique-se para o mata-mata',
    perks: ['Moral da equipe +20 pts', 'Receita semanal aumentada em 15%'],
    color: '#DC143C',
  },
  {
    id: 'visa',
    name: 'Visa',
    logo: '💳',
    reward: 8_000_000,
    requirement: 'Chegue à semifinal da Copa',
    perks: ['Bônus de transferência duplicado', 'Acesso ao mercado premium de lendas'],
    color: '#1A1F71',
  },
];

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function getTeamsByGroup(group: string): Team[] {
  return TEAMS.filter(t => t.group === group);
}
