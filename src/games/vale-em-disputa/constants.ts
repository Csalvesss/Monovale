// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Game Constants
// ─────────────────────────────────────────────────────────────────────────────

import type { FactionId, MissionId, TerritorySymbol } from './types';

// ── Regions ──────────────────────────────────────────────────────────────────

export interface Region {
  id: number;
  name: string;
  color: string;  // subtle background color for SVG
  cities: string[];
}

export const REGIONS: Region[] = [
  {
    id: 1,
    name: 'São José dos Campos',
    color: '#d1fae5',
    cities: [
      'Caçapava', 'Igaratá', 'Jacareí', 'Jambeiro',
      'Monteiro Lobato', 'Paraibuna', 'Santa Branca', 'São José dos Campos',
    ],
  },
  {
    id: 2,
    name: 'Taubaté',
    color: '#dbeafe',
    cities: [
      'Campos do Jordão', 'Natividade da Serra', 'Pindamonhangaba',
      'Redenção da Serra', 'Santo Antônio do Pinhal', 'São Bento do Sapucaí',
      'São Luiz do Paraitinga', 'Taubaté', 'Tremembé',
    ],
  },
  {
    id: 3,
    name: 'Guaratinguetá',
    color: '#fef9c3',
    cities: [
      'Aparecida', 'Cachoeira Paulista', 'Guaratinguetá',
      'Lorena', 'Piquete', 'Roseira',
    ],
  },
  {
    id: 4,
    name: 'Cruzeiro',
    color: '#fee2e2',
    cities: ['Cruzeiro', 'Lavrinhas', 'Queluz'],
  },
  {
    id: 5,
    name: 'Litoral Norte',
    color: '#e0f2fe',
    cities: ['Caraguatatuba', 'Ilhabela', 'São Sebastião', 'Ubatuba'],
  },
];

// city → region id
export const CITY_REGION: Record<string, number> = {};
REGIONS.forEach(r => r.cities.forEach(c => { CITY_REGION[c] = r.id; }));

// ── City Positions (SVG 1000×580 viewbox) ────────────────────────────────────

export const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  // Região 1 — São José dos Campos
  'São José dos Campos': { x: 230, y: 265 },
  'Jacareí':             { x: 170, y: 290 },
  'Caçapava':            { x: 278, y: 248 },
  'Jambeiro':            { x: 208, y: 340 },
  'Igaratá':             { x: 140, y: 248 },
  'Monteiro Lobato':     { x: 188, y: 198 },
  'Paraibuna':           { x: 258, y: 316 },
  'Santa Branca':        { x: 200, y: 265 },

  // Região 2 — Taubaté
  'Taubaté':             { x: 375, y: 265 },
  'Pindamonhangaba':     { x: 408, y: 292 },
  'Tremembé':            { x: 358, y: 238 },
  'Campos do Jordão':    { x: 448, y: 196 },
  'Natividade da Serra': { x: 332, y: 316 },
  'Redenção da Serra':   { x: 312, y: 345 },
  'Santo Antônio do Pinhal': { x: 470, y: 218 },
  'São Bento do Sapucaí':{ x: 500, y: 240 },
  'São Luiz do Paraitinga': { x: 352, y: 352 },

  // Região 3 — Guaratinguetá
  'Guaratinguetá':       { x: 584, y: 280 },
  'Lorena':              { x: 628, y: 295 },
  'Aparecida':           { x: 548, y: 302 },
  'Cachoeira Paulista':  { x: 660, y: 308 },
  'Piquete':             { x: 592, y: 248 },
  'Roseira':             { x: 562, y: 322 },

  // Região 4 — Cruzeiro
  'Cruzeiro':            { x: 718, y: 285 },
  'Queluz':              { x: 752, y: 305 },
  'Lavrinhas':           { x: 738, y: 258 },

  // Região 5 — Litoral Norte
  'Caraguatatuba':       { x: 286, y: 475 },
  'Ubatuba':             { x: 352, y: 505 },
  'São Sebastião':       { x: 205, y: 458 },
  'Ilhabela':            { x: 168, y: 498 },
};

// ── Adjacencies ───────────────────────────────────────────────────────────────

const ADJ: Record<string, string[]> = {
  // Região 1 — internal
  'São José dos Campos': ['Jacareí', 'Santa Branca', 'Caçapava', 'Paraibuna', 'Jambeiro',
                          'Taubaté', 'Caçapava', 'Caraguatatuba'],
  'Jacareí':             ['São José dos Campos', 'Santa Branca', 'Igaratá', 'Natividade da Serra'],
  'Caçapava':            ['São José dos Campos', 'Paraibuna', 'Taubaté'],
  'Jambeiro':            ['São José dos Campos', 'Paraibuna', 'São Sebastião'],
  'Igaratá':             ['Jacareí', 'Santa Branca', 'Monteiro Lobato'],
  'Monteiro Lobato':     ['Igaratá', 'Santa Branca'],
  'Paraibuna':           ['São José dos Campos', 'Santa Branca', 'Caçapava', 'Jambeiro', 'Caraguatatuba'],
  'Santa Branca':        ['São José dos Campos', 'Jacareí', 'Igaratá', 'Monteiro Lobato', 'Paraibuna'],

  // Região 2 — internal
  'Taubaté':             ['Tremembé', 'Pindamonhangaba', 'Natividade da Serra', 'Redenção da Serra',
                          'São Luiz do Paraitinga', 'São José dos Campos', 'Caçapava', 'Aparecida'],
  'Pindamonhangaba':     ['Taubaté', 'Tremembé', 'Campos do Jordão', 'Santo Antônio do Pinhal', 'Roseira'],
  'Tremembé':            ['Taubaté', 'Pindamonhangaba'],
  'Campos do Jordão':    ['Pindamonhangaba', 'Santo Antônio do Pinhal', 'São Bento do Sapucaí'],
  'Natividade da Serra': ['Taubaté', 'Redenção da Serra', 'Jacareí'],
  'Redenção da Serra':   ['Taubaté', 'Natividade da Serra', 'São Luiz do Paraitinga'],
  'Santo Antônio do Pinhal': ['Pindamonhangaba', 'Campos do Jordão', 'São Bento do Sapucaí'],
  'São Bento do Sapucaí': ['Campos do Jordão', 'Santo Antônio do Pinhal'],
  'São Luiz do Paraitinga': ['Taubaté', 'Redenção da Serra', 'Guaratinguetá'],

  // Região 3 — internal
  'Guaratinguetá':       ['Aparecida', 'Roseira', 'Lorena', 'Piquete', 'Taubaté', 'São Luiz do Paraitinga'],
  'Lorena':              ['Guaratinguetá', 'Roseira', 'Cachoeira Paulista', 'Cruzeiro'],
  'Aparecida':           ['Guaratinguetá', 'Roseira', 'Taubaté'],
  'Cachoeira Paulista':  ['Lorena', 'Queluz'],
  'Piquete':             ['Guaratinguetá', 'Lavrinhas'],
  'Roseira':             ['Guaratinguetá', 'Aparecida', 'Lorena', 'Pindamonhangaba'],

  // Região 4 — internal
  'Cruzeiro':            ['Queluz', 'Lavrinhas', 'Lorena'],
  'Queluz':              ['Cruzeiro', 'Lavrinhas', 'Cachoeira Paulista'],
  'Lavrinhas':           ['Cruzeiro', 'Queluz', 'Piquete'],

  // Região 5 — internal
  'Caraguatatuba':       ['São Sebastião', 'Ubatuba', 'São José dos Campos', 'Paraibuna'],
  'Ubatuba':             ['Caraguatatuba'],
  'São Sebastião':       ['Caraguatatuba', 'Ilhabela', 'Jambeiro'],
  'Ilhabela':            ['São Sebastião'],
};

// Deduplicate adjacency list
export const ADJACENCIES: Record<string, string[]> = {};
for (const [city, neighbors] of Object.entries(ADJ)) {
  ADJACENCIES[city] = [...new Set(neighbors)];
}

export function areAdjacent(a: string, b: string): boolean {
  return (ADJACENCIES[a] ?? []).includes(b);
}

// ── City Gold Values ──────────────────────────────────────────────────────────

export const CITY_GOLD: Record<string, number> = {
  'São José dos Campos': 3, 'Taubaté': 3, 'Guaratinguetá': 3,
  'Caraguatatuba': 3, 'Ubatuba': 3,
  'Jacareí': 2, 'Pindamonhangaba': 2, 'Lorena': 2, 'São Sebastião': 2,
  'Campos do Jordão': 2, 'Aparecida': 2, 'Ilhabela': 2,
};
// All other cities = 1 gold (default if not in map above)
export function getCityGold(city: string): number {
  return CITY_GOLD[city] ?? 1;
}

// ── Territory Card Symbols ────────────────────────────────────────────────────

const ALL_CITIES = Object.keys(CITY_POSITIONS);
const SYMBOLS: TerritorySymbol[] = ['square', 'triangle', 'circle'];

export const TERRITORY_CARD_SYMBOL: Record<string, TerritorySymbol> = {};
ALL_CITIES.forEach((city, i) => {
  TERRITORY_CARD_SYMBOL[city] = SYMBOLS[i % 3];
});

// Trade bonus table (progressive — grows by 2 each time globally)
export function getTradeBonus(tradeCount: number): number {
  return 4 + tradeCount * 2;
}

// ── Factions ──────────────────────────────────────────────────────────────────

export interface Faction {
  id: FactionId;
  name: string;
  color: string;
  textColor: string;
  emoji: string;
  passive: string;
  active: string;
  region: number; // primary region
}

export const FACTIONS: Record<FactionId, Faction> = {
  industriais: {
    id: 'industriais',
    name: 'Industriais de SJC',
    color: '#166534',
    textColor: '#fff',
    emoji: '🏭',
    passive: '+1 tropa ao reforçar cidades da Região 1',
    active: 'Mover tropas entre 2 cidades suas não adjacentes como se fossem vizinhas',
    region: 1,
  },
  serranos: {
    id: 'serranos',
    name: 'Serranos de Taubaté',
    color: '#1e3a8a',
    textColor: '#fff',
    emoji: '⛰️',
    passive: 'Atacante precisa vencer por diferença de 2 no dado para conquistar sua cidade',
    active: 'Cancelar o efeito de uma carta de evento nesse turno',
    region: 2,
  },
  historicos: {
    id: 'historicos',
    name: 'Históricos de Guaratinguetá',
    color: '#b45309',
    textColor: '#fff',
    emoji: '⛪',
    passive: 'Começa com 1 carta de território bônus na mão',
    active: 'Congelar 1 cidade sua — não pode ser atacada até o próximo turno',
    region: 3,
  },
  fronteiristas: {
    id: 'fronteiristas',
    name: 'Fronteiristas de Cruzeiro',
    color: '#991b1b',
    textColor: '#fff',
    emoji: '⚔️',
    passive: '+1 tropa ao reforçar cidades que fazem fronteira entre regiões diferentes',
    active: 'Roubar 1 tropa de uma cidade adversária adjacente à qualquer cidade sua',
    region: 4,
  },
  litoraneos: {
    id: 'litoraneos',
    name: 'Litorâneos de Ubatuba',
    color: '#0c4a6e',
    textColor: '#fff',
    emoji: '🌊',
    passive: 'Cidades do Litoral Norte só podem ser atacadas por cidades da Região 1 e 2',
    active: 'Atacar qualquer cidade costeira do mapa sem precisar de adjacência',
    region: 5,
  },
};

export const FACTION_LIST = Object.values(FACTIONS);

// ── Missions ──────────────────────────────────────────────────────────────────

export const MISSIONS: Record<MissionId, { title: string; description: string }> = {
  control_r1_r5: {
    title: 'Domínio do Vale e do Mar',
    description: 'Controlar as regiões 1 (SJC) e 5 (Litoral Norte) completas com ao menos 2 tropas em cada cidade.',
  },
  eliminate_player: {
    title: 'Eliminação Adversária',
    description: 'Eliminar completamente a facção de um adversário específico (sorteado na largada).',
  },
  control_18_cities: {
    title: 'Grande Império do Vale',
    description: 'Controlar 18 cidades quaisquer do mapa.',
  },
  control_r3_r4: {
    title: 'Soberania do Leste',
    description: 'Dominar as regiões 3 (Guaratinguetá) e 4 (Cruzeiro) completas.',
  },
  control_12_with_3: {
    title: 'Presença Fortalecida',
    description: 'Controlar 12 cidades com ao menos 3 tropas cada.',
  },
  accumulate_gold: {
    title: 'Barão do Vale',
    description: 'Acumular 45 ouros (missão econômica alternativa).',
  },
};

// ── Event Cards ───────────────────────────────────────────────────────────────

export interface EventCard {
  id: string;
  title: string;
  description: string;
  type: 'benefit' | 'penalty' | 'neutral';
  effect: string; // key for the engine to resolve
}

export const EVENT_CARDS: EventCard[] = [
  // BENEFÍCIOS (1-20)
  { id: 'ev01', type: 'benefit', effect: 'voo_embraer',           title: 'Voo da Embraer',            description: 'Faça 1 ataque contra qualquer cidade do mapa, ignorando adjacência.' },
  { id: 'ev02', type: 'benefit', effect: 'reforco_dutra',         title: 'Reforço da Dutra',           description: 'Receba +3 tropas para distribuir como quiser entre suas cidades.' },
  { id: 'ev03', type: 'benefit', effect: 'fortaleza_jacarei',     title: 'Fortaleza de Jacareí',       description: '1 cidade sua não pode ser atacada até o próximo turno.' },
  { id: 'ev04', type: 'benefit', effect: 'temporada_ilhabela',    title: 'Temporada em Ilhabela',      description: 'Ganhe +1 tropa em cada cidade que você controla.' },
  { id: 'ev05', type: 'benefit', effect: 'carnaval_campos',       title: 'Carnaval de Campos do Jordão', description: 'Receba +3 tropas, todas no mesmo território.' },
  { id: 'ev06', type: 'benefit', effect: 'rota_aguas',            title: 'Rota das Águas',             description: 'Mova tropas entre quaisquer 2 cidades suas sem adjacência nesse turno.' },
  { id: 'ev07', type: 'benefit', effect: 'mercado_taubate',       title: 'Mercado de Taubaté',         description: 'Troque 1 carta de território por 2 tropas agora, fora do momento normal.' },
  { id: 'ev08', type: 'benefit', effect: 'festa_aparecida',       title: 'Festa de Aparecida',         description: 'Cada cidade sua que faz fronteira com adversário recebe +1 tropa de defesa até o fim da rodada.' },
  { id: 'ev09', type: 'benefit', effect: 'polo_industrial',       title: 'Polo Industrial de SJC',     description: 'Receba +1 tropa para cada 3 cidades que você controla agora.' },
  { id: 'ev10', type: 'benefit', effect: 'trem_pao',              title: 'Trem do Pão',                description: 'Conecte 2 cidades suas — tropas se movem entre elas como adjacentes nesse turno.' },
  { id: 'ev11', type: 'benefit', effect: 'alianca_vale',          title: 'Aliança do Vale',            description: 'Escolha outro jogador — nenhum de vocês ataca o outro até o fim da rodada. Ambos ganham +2 tropas.' },
  { id: 'ev12', type: 'benefit', effect: 'batalhao_guaratingueta',title: 'Batalhão de Guaratinguetá',  description: 'Em qualquer combate nesse turno, relance 1 dado de ataque uma vez por batalha.' },
  { id: 'ev13', type: 'benefit', effect: 'pico_mantiqueira',      title: 'Pico da Mantiqueira',        description: '1 cidade sua exige diferença de 2 no dado para ser conquistada até o próximo turno.' },
  { id: 'ev14', type: 'benefit', effect: 'blitz_relampago',       title: 'Blitz Relâmpago',            description: 'Ataque o mesmo território duas vezes seguidas sem precisar vencer no primeiro.' },
  { id: 'ev15', type: 'benefit', effect: 'espionagem_vale',       title: 'Espionagem no Vale',         description: 'Revele a missão secreta de 1 adversário. Só você vê.' },
  { id: 'ev16', type: 'benefit', effect: 'reserva_estrategica',   title: 'Reserva Estratégica',        description: 'Guarde esta carta e use em qualquer turno futuro para receber +3 tropas antes de atacar.' },
  { id: 'ev17', type: 'benefit', effect: 'quarteirao_lorena',     title: 'Quarteirão de Lorena',       description: 'Reconquiste 1 cidade perdida nos últimos 2 turnos com +2 tropas de apoio gratuitas.' },
  { id: 'ev18', type: 'benefit', effect: 'posto_avancado',        title: 'Posto Avançado de Cruzeiro', description: 'Coloque +1 tropa em cada cidade sua que faz fronteira com outros jogadores.' },
  { id: 'ev19', type: 'benefit', effect: 'hidrovia_paraiba',      title: 'Hidrovia do Paraíba',        description: 'Nesse turno, seu maior dado de ataque conta +1 em todas as batalhas.' },
  { id: 'ev20', type: 'benefit', effect: 'marcha_forcada',        title: 'Marcha Forçada',             description: 'Após conquistar uma cidade, mova até 3 tropas extras para ela imediatamente.' },

  // PENALIDADES (21-40)
  { id: 'ev21', type: 'penalty', effect: 'neblina_anchieta',      title: 'Neblina na Anchieta',        description: '1 adversário não pode atacar cidades costeiras até o próximo turno.' },
  { id: 'ev22', type: 'penalty', effect: 'blitz_dutra',           title: 'Blitz na Dutra',             description: '1 adversário perde 1 tropa de cada cidade que possui (máximo 5 tropas perdidas).' },
  { id: 'ev23', type: 'penalty', effect: 'apagao_taubate',        title: 'Apagão em Taubaté',          description: '1 adversário não pode usar o poder ativo da facção no próximo turno.' },
  { id: 'ev24', type: 'penalty', effect: 'seca_serra',            title: 'Seca na Serra',              description: '1 adversário perde o bônus de região completa em 1 área sua até o fim da rodada.' },
  { id: 'ev25', type: 'penalty', effect: 'enchente_jacarei',      title: 'Enchente em Jacareí',        description: '1 adversário não pode reforçar cidades que fazem fronteira com as suas no próximo turno.' },
  { id: 'ev26', type: 'penalty', effect: 'desvio_carvalho',       title: 'Desvio na Carvalho Pinto',   description: '1 adversário não pode mover tropas no reagrupamento do próximo turno.' },
  { id: 'ev27', type: 'penalty', effect: 'traicao_vale',          title: 'Traição do Vale',            description: 'Roube 2 tropas de qualquer cidade adversária que faça fronteira com uma sua.' },
  { id: 'ev28', type: 'penalty', effect: 'sabotagem_pinda',       title: 'Sabotagem em Pindamonhangaba', description: '1 adversário perde 1 carta de território aleatória da mão.' },
  { id: 'ev29', type: 'penalty', effect: 'boicote_lorena',        title: 'Boicote de Lorena',          description: '1 adversário não pode trocar cartas por tropas no próximo turno.' },
  { id: 'ev30', type: 'penalty', effect: 'cerco_guaratingueta',   title: 'Cerco de Guaratinguetá',     description: '1 cidade adversária não pode receber reforços nesse turno.' },
  { id: 'ev31', type: 'penalty', effect: 'emboscada_serra',       title: 'Emboscada na Serra',         description: 'No próximo ataque de 1 adversário, ele usa 1 dado a menos de ataque.' },
  { id: 'ev32', type: 'penalty', effect: 'isolamento_ubatuba',    title: 'Isolamento de Ubatuba',      description: '1 adversário não pode atacar cidades costeiras nesse turno.' },
  { id: 'ev33', type: 'penalty', effect: 'corte_abastecimento',   title: 'Corte de Abastecimento',     description: '1 adversário recebe metade dos reforços normais no próximo turno (mínimo 3).' },
  { id: 'ev34', type: 'penalty', effect: 'golpe_diplomatico',     title: 'Golpe Diplomático',          description: 'Cancele qualquer efeito de carta ativa de 1 adversário imediatamente.' },
  { id: 'ev35', type: 'penalty', effect: 'espiao_campo',          title: 'Espião em Campo',            description: 'Veja o número exato de tropas em cada cidade de 1 adversário por 1 turno.' },
  { id: 'ev36', type: 'penalty', effect: 'desercao_cruzeiro',     title: 'Deserção em Cruzeiro',       description: '1 adversário perde 2 tropas de 1 cidade sua que faça fronteira com outro jogador.' },
  { id: 'ev37', type: 'penalty', effect: 'propaganda_lorena',     title: 'Propaganda de Lorena',       description: '1 adversário não pode atacar suas cidades no próximo turno.' },
  { id: 'ev38', type: 'penalty', effect: 'disturbio_piquete',     title: 'Distúrbio em Piquete',       description: '1 cidade adversária fica bloqueada para receber qualquer tropa nesse turno.' },
  { id: 'ev39', type: 'penalty', effect: 'interdicao_queluz',     title: 'Interdição de Queluz',       description: '1 adversário não ganha carta de território nesse turno, mesmo conquistando cidades.' },
  { id: 'ev40', type: 'penalty', effect: 'revolta_roseira',       title: 'Revolta em Roseira',         description: 'Se 1 adversário controla uma região inteira, ele perde 1 cidade aleatória dela (volta a neutro).' },

  // NEUTROS (41-50)
  { id: 'ev41', type: 'neutral', effect: 'neblina_geral',         title: 'Neblina Geral',              description: 'Ninguém vê o número de tropas dos outros até o fim da rodada.' },
  { id: 'ev42', type: 'neutral', effect: 'tregua_vale',           title: 'Trégua do Vale',             description: 'Nenhum jogador ataca nesse turno. Todos recebem +2 tropas.' },
  { id: 'ev43', type: 'neutral', effect: 'redistribuicao_terras', title: 'Redistribuição de Terras',   description: 'Você troca 1 cidade sua por 1 cidade de 1 adversário. Ambas com exatamente 1 tropa.' },
  { id: 'ev44', type: 'neutral', effect: 'congresso_vale',        title: 'Congresso do Vale',          description: 'Todos votam em 1 cidade neutra. A mais votada recebe 3 tropas e fica disponível para conquista.' },
  { id: 'ev45', type: 'neutral', effect: 'fronteira_aberta',      title: 'Fronteira Aberta',           description: 'Qualquer jogador pode mover tropas entre territórios não adjacentes nesse turno.' },
  { id: 'ev46', type: 'neutral', effect: 'crise_regional',        title: 'Crise Regional',             description: 'Todos perdem 1 tropa de 1 cidade à escolha. Quem tem menos cidades fica imune.' },
  { id: 'ev47', type: 'neutral', effect: 'leilao_cruzeiro',       title: 'Leilão de Cruzeiro',         description: '1 cidade é leiloada com lances abertos. Quem der o maior lance paga o ouro e conquista a cidade.' },
  { id: 'ev48', type: 'neutral', effect: 'pacto_serra',           title: 'Pacto da Serra',             description: 'Você e 1 adversário trocam 1 carta de território cada um.' },
  { id: 'ev49', type: 'neutral', effect: 'caos_vale',             title: 'Caos no Vale',               description: 'Cada jogador move 2 tropas de qualquer cidade sua para qualquer outra cidade sua, simultaneamente.' },
  { id: 'ev50', type: 'neutral', effect: 'profecia_aparecida',    title: 'Profecia de Aparecida',      description: 'Revele as missões de todos por 1 rodada. Ninguém pode atacar quem está a 1 cidade de cumprir.' },
];

export const EVENT_CARD_MAP: Record<string, EventCard> = {};
EVENT_CARDS.forEach(c => { EVENT_CARD_MAP[c.id] = c; });

// ── Coastal cities (Litoral Norte + all R5) ────────────────────────────────────
export const COASTAL_CITIES = new Set<string>(REGIONS[4].cities);
// Litorâneos passive: R5 can only be attacked from R1 or R2
export const LITORAL_NORTE_CITIES = new Set<string>(REGIONS[4].cities);

// ── Border cities between regions ─────────────────────────────────────────────
// A city that has at least one neighbor in a different region
export function isBorderCity(city: string): boolean {
  const region = CITY_REGION[city];
  return (ADJACENCIES[city] ?? []).some(n => CITY_REGION[n] !== region);
}

// ── All city names ────────────────────────────────────────────────────────────
export const ALL_CITY_NAMES = Object.keys(CITY_POSITIONS);
