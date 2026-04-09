import type { Card } from '../types';

export const CHANCE_CARDS: Card[] = [
  {
    id: 'ch1',
    deck: 'chance',
    text: 'Avance para o Pedágio da Dutra! Passe pelo início e receba R$200.',
    action: { type: 'advance_to', position: 0, collectGoBonus: true },
  },
  {
    id: 'ch2',
    deck: 'chance',
    text: 'Siga para São Luís do Paraitinga. Se passar pelo Início, receba R$200.',
    action: { type: 'advance_to', position: 39, collectGoBonus: true },
  },
  {
    id: 'ch3',
    deck: 'chance',
    text: 'Avance para Taubaté. Se passar pelo Início, receba R$200.',
    action: { type: 'advance_to', position: 37, collectGoBonus: true },
  },
  {
    id: 'ch4',
    deck: 'chance',
    text: 'Vá para a Estação Cruzeiro. Pague o dobro do aluguel ao chegar!',
    action: { type: 'advance_to_railroad', doubleRent: true },
  },
  {
    id: 'ch5',
    deck: 'chance',
    text: 'Ande 3 casas para trás.',
    action: { type: 'move_back', spaces: 3 },
  },
  {
    id: 'ch6',
    deck: 'chance',
    text: 'Multa na Via Dutra! Vá direto ao DETRAN. Não passe pelo Início.',
    action: { type: 'go_to_jail' },
  },
  {
    id: 'ch7',
    deck: 'chance',
    text: 'Multa de trânsito na Rodovia Presidente Dutra. Pague R$15.',
    action: { type: 'pay', amount: 15 },
  },
  {
    id: 'ch8',
    deck: 'chance',
    text: 'O Banco do Sr. Marinho pagou dividendos! Receba R$50.',
    action: { type: 'collect', amount: 50 },
  },
  {
    id: 'ch9',
    deck: 'chance',
    text: 'O Sr. Marinho aprovou seu crédito imobiliário! Receba R$150.',
    action: { type: 'collect', amount: 150 },
  },
  {
    id: 'ch10',
    deck: 'chance',
    text: 'Festa junina em Aparecida! Contribua R$50 para a festa.',
    action: { type: 'pay', amount: 50 },
  },
  {
    id: 'ch11',
    deck: 'chance',
    text: 'Sua startup no Parque Tecnológico de SJC foi premiada! Receba R$150.',
    action: { type: 'collect', amount: 150 },
  },
  {
    id: 'ch12',
    deck: 'chance',
    text: 'Cartão de saída da cadeia. Guarde para usar quando precisar!',
    action: { type: 'get_out_of_jail_free' },
  },
  {
    id: 'ch13',
    deck: 'chance',
    text: 'Maturidade financeira reconhecida pelo Sr. Marinho. Receba R$100.',
    action: { type: 'collect', amount: 100 },
  },
  {
    id: 'ch14',
    deck: 'chance',
    text: 'Conserto do carro na Dutra: R$25 por casa e R$100 por hotel.',
    action: { type: 'repairs', perHouse: 25, perHotel: 100 },
  },
  {
    id: 'ch15',
    deck: 'chance',
    text: 'Você ganhou no rodeio de Guaratinguetá! Receba R$150.',
    action: { type: 'collect', amount: 150 },
  },
  {
    id: 'ch16',
    deck: 'chance',
    text: 'Dutra interditada por obras. Pague R$50 de multa.',
    action: { type: 'pay', amount: 50 },
  },
];

export const COMMUNITY_CARDS: Card[] = [
  {
    id: 'cc1',
    deck: 'community',
    text: 'Herança de família chegou! Receba R$100 do Sr. Marinho.',
    action: { type: 'collect', amount: 100 },
  },
  {
    id: 'cc2',
    deck: 'community',
    text: 'É festa em São Luís do Paraitinga! Cada jogador te paga R$10.',
    action: { type: 'collect_from_each', amount: 10 },
  },
  {
    id: 'cc3',
    deck: 'community',
    text: 'Consulta médica no HMC de Taubaté. Pague R$50.',
    action: { type: 'pay', amount: 50 },
  },
  {
    id: 'cc4',
    deck: 'community',
    text: 'IPVA do veículo venceu! Pague R$100 ao Sr. Marinho.',
    action: { type: 'pay', amount: 100 },
  },
  {
    id: 'cc5',
    deck: 'community',
    text: 'Fundo Comunitário do Vale distribuiu R$200. Receba!',
    action: { type: 'collect', amount: 200 },
  },
  {
    id: 'cc6',
    deck: 'community',
    text: 'Sua empresa no Parque Tecnológico de SJC prosperou! Receba R$100.',
    action: { type: 'collect', amount: 100 },
  },
  {
    id: 'cc7',
    deck: 'community',
    text: 'Reparos na rodovia: R$40 por casa e R$115 por hotel.',
    action: { type: 'repairs', perHouse: 40, perHotel: 115 },
  },
  {
    id: 'cc8',
    deck: 'community',
    text: 'Avance para o Pedágio da Dutra! Receba R$200 pelo Início.',
    action: { type: 'advance_to', position: 0, collectGoBonus: true },
  },
  {
    id: 'cc9',
    deck: 'community',
    text: 'Cartão de saída do DETRAN grátis. Guarde para usar quando precisar!',
    action: { type: 'get_out_of_jail_free' },
  },
  {
    id: 'cc10',
    deck: 'community',
    text: 'Você foi eleito prefeito! Distribua R$50 a cada jogador.',
    action: { type: 'pay_to_each', amount: 50 },
  },
  {
    id: 'cc11',
    deck: 'community',
    text: 'Prêmio de beleza cênica da Serra da Bocaina! Receba R$20.',
    action: { type: 'collect', amount: 20 },
  },
  {
    id: 'cc12',
    deck: 'community',
    text: 'Saldão na Feira da Lorena! Receba R$25 do Sr. Marinho.',
    action: { type: 'collect', amount: 25 },
  },
  {
    id: 'cc13',
    deck: 'community',
    text: 'Cruzeiro é campeão do Vale! Receba R$100 de cada jogador.',
    action: { type: 'collect_from_each', amount: 100 },
  },
  {
    id: 'cc14',
    deck: 'community',
    text: 'Contribuição ao Fundo Municipal. Pague R$75.',
    action: { type: 'pay', amount: 75 },
  },
  {
    id: 'cc15',
    deck: 'community',
    text: 'Renda do aluguel do mês recebida! Receba R$50.',
    action: { type: 'collect', amount: 50 },
  },
  {
    id: 'cc16',
    deck: 'community',
    text: 'Erro bancário a seu favor! O Sr. Marinho te dá R$200.',
    action: { type: 'collect', amount: 200 },
  },
];

export function shuffleDeck<T>(deck: T[]): T[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
