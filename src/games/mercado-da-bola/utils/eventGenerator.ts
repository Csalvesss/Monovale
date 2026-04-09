import type { Player, NewsPost, GameSave, NewsType } from '../types';

let _newsId = Date.now();
function newsId(): string { return `news-${++_newsId}`; }

const REPORTERS = ['@gazetaesportiva', '@TNT_Sports_BR', '@goal_br', '@ESPN_BR', '@SporTV'];
const IG_ACCOUNTS = ['@futebolnarede', '@transfernews.br', '@mercadodabola.ig', '@torcedores.oficial'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ─── News generators ─────────────────────────────────────────────────────────

export function newsMatchWin(myTeamName: string, opponentName: string, score: string): NewsPost {
  const templates = [
    `🏆 ${myTeamName} vence ${opponentName} por ${score} e sobe na tabela!`,
    `⚽ Show de bola! ${myTeamName} derrota ${opponentName} por ${score}.`,
    `Vitória importante do ${myTeamName} sobre o ${opponentName}: ${score}!`,
  ];
  return {
    id: newsId(), type: 'match', platform: 'report',
    author: pick(REPORTERS), content: pick(templates), imageEmoji: '🏆',
    likes: randInt(150, 2000), comments: randInt(20, 300), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsMatchDraw(myTeamName: string, opponentName: string, score: string): NewsPost {
  return {
    id: newsId(), type: 'match', platform: 'report',
    author: pick(REPORTERS),
    content: `🤝 ${myTeamName} empata com ${opponentName} em ${score}. Um ponto de cada lado.`,
    imageEmoji: '🤝',
    likes: randInt(50, 800), comments: randInt(10, 150), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsMatchLoss(myTeamName: string, opponentName: string, score: string): NewsPost {
  return {
    id: newsId(), type: 'match', platform: 'report',
    author: pick(REPORTERS),
    content: `😢 ${myTeamName} perde para ${opponentName} por ${score}. Torcida cobra postura!`,
    imageEmoji: '😢',
    likes: randInt(80, 1200), comments: randInt(30, 500), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsTransferIn(player: Player, myTeamName: string): NewsPost {
  const templates = [
    `🔴 FECHADO! ${player.name} chega ao ${myTeamName}! Acordo confirmado.`,
    `✍️ ${player.name} assina com ${myTeamName}. Reforço de peso para o elenco!`,
    `📋 Oficial: ${player.name} é o novo jogador do ${myTeamName}!`,
  ];
  const ig: NewsPost = {
    id: newsId(), type: 'transfer', platform: 'instagram',
    author: pick(IG_ACCOUNTS), authorHandle: pick(IG_ACCOUNTS),
    content: `${player.flag} ${player.name} × ${myTeamName} 🤝 #Reforço #Mercado`,
    imageEmoji: '📸',
    likes: randInt(500, 8000), comments: randInt(50, 1000), timestamp: Date.now(), isMyTeam: true,
  };
  const report: NewsPost = {
    id: newsId() + '_r', type: 'transfer', platform: 'report',
    author: pick(REPORTERS), content: pick(templates), imageEmoji: '🔴',
    likes: randInt(300, 5000), comments: randInt(40, 700), timestamp: Date.now(), isMyTeam: true,
  };
  return Math.random() > 0.5 ? ig : report;
}

export function newsTransferOut(player: Player, myTeamName: string, toTeamName: string): NewsPost {
  return {
    id: newsId(), type: 'transfer', platform: 'report',
    author: pick(REPORTERS),
    content: `📤 ${player.name} deixa o ${myTeamName} e assina com o ${toTeamName}. Negócio confirmado!`,
    imageEmoji: '📤',
    likes: randInt(200, 4000), comments: randInt(30, 600), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsSponsorSigned(myTeamName: string, sponsorName: string): NewsPost {
  return {
    id: newsId(), type: 'sponsor', platform: 'report',
    author: pick(REPORTERS),
    content: `💰 ${myTeamName} fecha contrato de patrocínio com ${sponsorName}. Novo parceiro confirmado!`,
    imageEmoji: '🤝',
    likes: randInt(100, 1500), comments: randInt(15, 200), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsLegendaryFound(legendaryName: string, myTeamName: string): NewsPost {
  return {
    id: newsId(), type: 'legendary', platform: 'instagram',
    author: pick(IG_ACCOUNTS), authorHandle: pick(IG_ACCOUNTS),
    content: `🌟✨ CARTA LENDÁRIA! ${legendaryName} aparece no ${myTeamName}! Uma raridade histórica! #Lendário #Futebol`,
    imageEmoji: '⭐',
    likes: randInt(5000, 50000), comments: randInt(500, 5000), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsStadiumUpgrade(myTeamName: string, upgradeType: string): NewsPost {
  const labels: Record<string, string> = {
    capacity: 'ampliação da capacidade',
    vip: 'novos camarotes VIP',
    training: 'modernização do centro de treinamento',
    academy: 'expansão da academia de base',
    media: 'central de mídia e comunicação',
  };
  return {
    id: newsId(), type: 'stadium', platform: 'report',
    author: pick(REPORTERS),
    content: `🏟️ ${myTeamName} investe na ${labels[upgradeType] ?? 'melhoria do estádio'}! Clube cresce nas estruturas.`,
    imageEmoji: '🏗️',
    likes: randInt(200, 3000), comments: randInt(20, 400), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsPlayerInjured(player: Player): NewsPost {
  return {
    id: newsId(), type: 'player', platform: 'twitter',
    author: pick(REPORTERS), authorHandle: pick(REPORTERS),
    content: `🚑 ${player.flag} ${player.name} sofre lesão e deve ficar fora por algumas rodadas. #Lesão`,
    imageEmoji: '🚑',
    likes: randInt(100, 2000), comments: randInt(15, 300), timestamp: Date.now(), isMyTeam: true,
  };
}

export function newsPlayerLevelUp(player: Player): NewsPost {
  const templates = [
    `📈 ${player.name} está em grande fase! O jogador evolui dentro de campo.`,
    `⬆️ Evolução confirmada: ${player.name} sobe de nível com treinos e dedicação!`,
    `🔥 ${player.name} em forma: avaliação cresce após sequência de bons jogos.`,
  ];
  return {
    id: newsId(), type: 'player', platform: 'instagram',
    author: pick(IG_ACCOUNTS), authorHandle: pick(IG_ACCOUNTS),
    content: pick(templates) + ' 💪 #Evolução',
    imageEmoji: '📈',
    likes: randInt(300, 4000), comments: randInt(25, 400), timestamp: Date.now(), isMyTeam: true,
  };
}

// ─── Random world news (other teams) ─────────────────────────────────────────

const WORLD_EVENTS = [
  { t: 'report', c: '🌎 Mercado aquecido: grandes clubes europeus movimentam valores bilionários.', e: '💶' },
  { t: 'report', c: '📊 FIFA divulga ranking atualizado: Brasil mantém posição de destaque.', e: '🌍' },
  { t: 'instagram', c: '🔥 Rivalidade acirrada nas ligas europeias. Torcidas em êxtase! #Futebol', e: '⚽' },
  { t: 'twitter', c: '⚡ URGENTE: Transferência bombástica divulgada pela mídia europeia. Aguardando confirmação oficial.', e: '📰' },
  { t: 'report', c: '🏆 Champions League: os favoritos dão show nas oitavas de final.', e: '🌟' },
  { t: 'instagram', c: '🇧🇷 Seleção Brasileira convoca novos nomes! Renovação na equipe nacional. #Seleção', e: '🟡' },
  { t: 'twitter', c: '📋 Mercado em ebulição: 5 transferências anunciadas nas últimas 24h. #Futebol #Mercado', e: '📋' },
  { t: 'report', c: '👑 Premiação: Bola de Ouro terá novos candidatos após temporada agitada.', e: '🥇' },
];

export function generateWorldNews(): NewsPost {
  const ev = pick(WORLD_EVENTS);
  return {
    id: newsId(), type: 'general', platform: ev.t as 'report' | 'instagram' | 'twitter',
    author: pick([...REPORTERS, ...IG_ACCOUNTS]),
    content: ev.c, imageEmoji: ev.e,
    likes: randInt(500, 15000), comments: randInt(50, 2000), timestamp: Date.now(), isMyTeam: false,
  };
}

// ─── Generate initial news feed ───────────────────────────────────────────────

export function generateInitialFeed(myTeamName: string): NewsPost[] {
  const feed: NewsPost[] = [];
  for (let i = 0; i < 6; i++) feed.push(generateWorldNews());
  feed.push({
    id: newsId(), type: 'general', platform: 'instagram',
    author: '@lendadabola.oficial',
    content: `⚽ Bem-vindo ao ${myTeamName}! A temporada começa agora. Boa sorte, treinador! 🏆 #LendaDaBola`,
    imageEmoji: '🎮',
    likes: randInt(1000, 5000), comments: randInt(100, 500), timestamp: Date.now() - 1000, isMyTeam: true,
  });
  return feed.sort((a, b) => b.timestamp - a.timestamp);
}

// ─── Apply random weekly events to game state ─────────────────────────────────

export function applyRandomEvent(save: GameSave): { save: GameSave; news: NewsPost | null } {
  const roll = Math.random();
  let news: NewsPost | null = null;

  // Injury (5% chance)
  if (roll < 0.05 && save.mySquad.length > 0) {
    const healthy = save.mySquad.filter(p => !p.injured);
    if (healthy.length > 0) {
      const idx = Math.floor(Math.random() * healthy.length);
      const target = healthy[idx];
      const rounds = Math.floor(Math.random() * 3) + 1;
      const updated = save.mySquad.map(p =>
        p.id === target.id ? { ...p, injured: true, injuredForRounds: rounds, mood: 'unhappy' as const, moodPoints: Math.max(0, p.moodPoints - 20) } : p
      );
      news = newsPlayerInjured(target);
      return { save: { ...save, mySquad: updated, newsFeed: [news, ...save.newsFeed].slice(0, 50) }, news };
    }
  }

  // Random world news (30%)
  if (roll < 0.35) {
    news = generateWorldNews();
    return { save: { ...save, newsFeed: [news, ...save.newsFeed].slice(0, 50) }, news };
  }

  return { save, news };
}
