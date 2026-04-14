import type { Sponsor } from '../types';

export const ALL_SPONSORS: Sponsor[] = [
  // ── Tier 1 (pequenos) ────────────────────────────────────────────────────────
  { id: 'local-padaria',    name: 'Padaria do Zé',      logo: '🍞', industry: 'Alimentação',  winFee: 20,  drawFee: 10,  lossFee: 0,  bonusFee: 30,  tier: 1, minReputation: 0  },
  { id: 'posto-gaspar',     name: 'Posto Gaspar',       logo: '⛽', industry: 'Combustível',  winFee: 25,  drawFee: 12,  lossFee: 0,  bonusFee: 35,  tier: 1, minReputation: 0  },
  { id: 'farmacia-vida',    name: 'Farmácia Vida+',     logo: '💊', industry: 'Farmácia',     winFee: 30,  drawFee: 15,  lossFee: 5,  bonusFee: 40,  tier: 1, minReputation: 10 },
  { id: 'radio-esporte',    name: 'Rádio Esporte FM',   logo: '📻', industry: 'Mídia',        winFee: 35,  drawFee: 17,  lossFee: 5,  bonusFee: 50,  tier: 1, minReputation: 15 },
  { id: 'construtora-sol',  name: 'Construtora Sol',    logo: '🏗️', industry: 'Construção',   winFee: 40,  drawFee: 20,  lossFee: 5,  bonusFee: 60,  tier: 1, minReputation: 20 },

  // ── Tier 2 (médios) ───────────────────────────────────────────────────────────
  { id: 'banco-regional',   name: 'Banco Regional',     logo: '🏦', industry: 'Financeiro',   winFee: 80,  drawFee: 40,  lossFee: 10, bonusFee: 100, tier: 2, minReputation: 35 },
  { id: 'seguradora-ace',   name: 'Seguradora ACE',     logo: '🛡️', industry: 'Seguros',      winFee: 90,  drawFee: 45,  lossFee: 10, bonusFee: 120, tier: 2, minReputation: 40 },
  { id: 'supermercado-bom', name: 'Supermercado Bom',   logo: '🛒', industry: 'Varejo',       winFee: 100, drawFee: 50,  lossFee: 15, bonusFee: 130, tier: 2, minReputation: 45 },
  { id: 'telecom-conecta',  name: 'Conecta Telecom',    logo: '📱', industry: 'Telecom',      winFee: 120, drawFee: 60,  lossFee: 20, bonusFee: 150, tier: 2, minReputation: 50 },
  { id: 'bebidas-arena',    name: 'Bebidas Arena',      logo: '🍺', industry: 'Bebidas',      winFee: 110, drawFee: 55,  lossFee: 15, bonusFee: 140, tier: 2, minReputation: 55 },

  // ── Tier 3 (grandes) ─────────────────────────────────────────────────────────
  { id: 'seguro-max',       name: 'SeguroMax',          logo: '🏛️', industry: 'Seguros',      winFee: 250, drawFee: 125, lossFee: 50, bonusFee: 300, tier: 3, minReputation: 65 },
  { id: 'bank-global',      name: 'Bank Global',        logo: '💳', industry: 'Financeiro',   winFee: 300, drawFee: 150, lossFee: 60, bonusFee: 400, tier: 3, minReputation: 70 },
  { id: 'aerolinhas-vale',  name: 'Aerolinhas Vale',    logo: '✈️', industry: 'Aviação',      winFee: 350, drawFee: 175, lossFee: 70, bonusFee: 450, tier: 3, minReputation: 75 },
  { id: 'energy-sport',     name: 'EnergySport',        logo: '⚡', industry: 'Energia',      winFee: 400, drawFee: 200, lossFee: 80, bonusFee: 500, tier: 3, minReputation: 80 },
  { id: 'tech-futebol',     name: 'TechFutebol',        logo: '🖥️', industry: 'Tecnologia',   winFee: 500, drawFee: 250, lossFee: 100,bonusFee: 600, tier: 3, minReputation: 90 },
];

export function getSponsor(id: string): Sponsor | undefined {
  return ALL_SPONSORS.find(s => s.id === id);
}

export function getAvailableSponsors(reputation: number): Sponsor[] {
  return ALL_SPONSORS.filter(s => s.minReputation <= reputation);
}
