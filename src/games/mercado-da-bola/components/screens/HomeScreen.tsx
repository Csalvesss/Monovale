import React from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import TeamBadge from '../ui/TeamBadge';
import MoneyDisplay from '../ui/MoneyDisplay';
import type { FinancialRecord, MatchFixture, NewsPost } from '../../types';
import { LEGENDARY_BASE_CHANCE, LEGENDARY_MAX_CHANCE } from '../../constants';
import { cn } from '../../../../lib/utils';
import {
  BarChart2, Users, Trophy, Play,
  TrendingUp, Home, Plane, DollarSign,
  Heart, MessageCircle, Newspaper, ArrowLeftRight,
  Star, Shirt, RefreshCw,
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

const NEWS_ICONS: Record<string, typeof Newspaper> = {
  transfer: ArrowLeftRight,
  match:    Trophy,
  sponsor:  DollarSign,
  player:   Users,
  legendary: Star,
  stadium:  Home,
  general:  Newspaper,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
      {children}
    </div>
  );
}

// ─── Result Pill ──────────────────────────────────────────────────────────────

function ResultPill({ fixture, myTeamId }: { fixture: MatchFixture; myTeamId: string }) {
  const r = fixture.result!;
  const isHome = fixture.homeTeamId === myTeamId;
  const myGoals = isHome ? r.homeGoals : r.awayGoals;
  const opGoals = isHome ? r.awayGoals : r.homeGoals;
  const opTeamId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
  const opTeam = getTeam(opTeamId);
  const won = myGoals > opGoals;
  const drew = myGoals === opGoals;

  const outcomeVariant = won ? 'win' : drew ? 'draw' : 'loss';
  const outcomeLabel   = won ? 'V' : drew ? 'E' : 'D';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3 hover:border-slate-600 transition-colors">
      <Badge variant={outcomeVariant} className="h-7 w-7 shrink-0 rounded-lg px-0 justify-center text-xs font-black">
        {outcomeLabel}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-100 truncate">
          {isHome ? 'vs' : 'em'} {opTeam?.shortName ?? opTeamId}
        </p>
        <p className="text-[10px] text-slate-500">Rodada {fixture.round}</p>
      </div>
      <span className="shrink-0 text-[15px] font-black text-slate-100">
        {myGoals} <span className="text-slate-600">x</span> {opGoals}
      </span>
    </div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ post }: { post: NewsPost }) {
  const Icon = NEWS_ICONS[post.type] ?? Newspaper;

  const platformColor: Record<string, string> = {
    instagram: 'border-l-pink-500',
    twitter:   'border-l-sky-500',
    report:    'border-l-blue-500',
  };
  const borderColor = platformColor[post.platform] ?? 'border-l-slate-600';

  return (
    <div className={cn('flex gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3 border-l-4', borderColor)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-slate-400">{post.author}</span>
          {post.authorHandle && <span className="text-[10px] text-slate-600">{post.authorHandle}</span>}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{post.content}</p>
        <div className="flex gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <Heart size={9} /> {fmt(post.likes)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <MessageCircle size={9} /> {post.comments}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Finance Row ──────────────────────────────────────────────────────────────

function FinanceRow({ record }: { record: FinancialRecord }) {
  const isPositive = record.amount >= 0;
  const CAT_ICONS: Record<string, typeof DollarSign> = {
    wage: Shirt, transfer: ArrowLeftRight, sponsor: DollarSign,
    ticket: Star, training: TrendingUp, stadium: Home, other: RefreshCw,
  };
  const Icon = CAT_ICONS[record.category] ?? RefreshCw;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-700/50 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
        <Icon size={12} className="text-slate-400" />
      </div>
      <p className="flex-1 min-w-0 text-xs text-slate-400 truncate">{record.description}</p>
      <MoneyDisplay amount={record.amount} showSign size="sm" />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color = '#3b82f6',
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-2 hover:scale-105 transition-transform cursor-default">
      <div className="flex items-center justify-between">
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-xl font-black text-slate-100 leading-none">{value}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { state, setScreen } = useMB();
  const { save } = state;

  if (!save) return null;

  const myTeam = getTeam(save.myTeamId);

  const sortedStandings = [...save.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
  const myPosition = sortedStandings.findIndex(s => s.teamId === save.myTeamId) + 1;
  const myStanding = save.standings.find(s => s.teamId === save.myTeamId);

  const nextFixtureIdx = save.fixtures.findIndex(
    f => !f.played && (f.homeTeamId === save.myTeamId || f.awayTeamId === save.myTeamId)
  );
  const nextFixture = nextFixtureIdx >= 0 ? save.fixtures[nextFixtureIdx] : null;
  const nextOpponentId = nextFixture
    ? (nextFixture.homeTeamId === save.myTeamId ? nextFixture.awayTeamId : nextFixture.homeTeamId)
    : null;
  const nextOpponent = nextOpponentId ? getTeam(nextOpponentId) : null;
  const nextIsHome = nextFixture ? nextFixture.homeTeamId === save.myTeamId : false;

  const recentResults = save.fixtures
    .filter(f => f.played && f.result && (f.homeTeamId === save.myTeamId || f.awayTeamId === save.myTeamId))
    .slice(-3)
    .reverse();

  const recentNews = save.newsFeed.slice(0, 3);
  const legendaryChance = Math.min(LEGENDARY_MAX_CHANCE, LEGENDARY_BASE_CHANCE + save.legendaryChanceBonus);
  const legendaryPct = (legendaryChance / LEGENDARY_MAX_CHANCE) * 100;
  const recentFinances = save.finances.slice(0, 3);

  const positionColor = myPosition <= 4 ? '#22c55e' : myPosition <= 10 ? '#eab308' : '#ef4444';

  // Calc win probability
  const totalGames = (myStanding?.won ?? 0) + (myStanding?.drawn ?? 0) + (myStanding?.lost ?? 0);
  const winPct = totalGames > 0 ? Math.round(((myStanding?.won ?? 0) / totalGames) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">

      {/* ── Club header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-[#0f172a]"
        style={{ borderLeftWidth: 4, borderLeftColor: myTeam?.primaryColor ?? '#3b82f6' }}>
        <div className="flex items-center gap-4 p-4">
          {myTeam ? <TeamBadge team={myTeam} size={56} /> : <div className="h-14 w-14 rounded-xl bg-slate-700" />}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-100 leading-tight truncate"
              style={{ fontFamily: 'var(--font-title)' }}>
              {myTeam?.name ?? 'Meu Time'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">Temporada {save.currentSeason}</Badge>
              <Badge variant="secondary">Rodada {save.currentRound}</Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <MoneyDisplay amount={save.budget} size="md" showIcon />
            <div className="text-[9px] text-slate-500 mt-0.5">orçamento</div>
          </div>
        </div>
      </div>

      {/* ── Quick stats grid ── */}
      <div>
        <SectionTitle>Visão Geral</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={BarChart2} label="Posição"
            value={myPosition ? `${myPosition}°` : '—'}
            sub={`${myStanding?.points ?? 0} pts`}
            color={positionColor}
          />
          <StatCard
            icon={Trophy} label="Vitórias"
            value={String(myStanding?.won ?? 0)}
            sub={`${myStanding?.drawn ?? 0}E · ${myStanding?.lost ?? 0}D`}
            color="#22c55e"
          />
          <StatCard
            icon={Users} label="Elenco"
            value={String(save.mySquad.length)}
            sub="jogadores"
            color="#3b82f6"
          />
          <StatCard
            icon={TrendingUp} label="Aproveitamento"
            value={`${winPct}%`}
            sub={`${totalGames} jogos`}
            color="#a855f7"
          />
        </div>
      </div>

      {/* ── Next match card ── */}
      {nextFixture && nextOpponent && myTeam && (
        <div>
          <SectionTitle>Próxima Partida</SectionTitle>
          <div className="rounded-2xl border border-blue-700/40 bg-gradient-to-br from-[#1e3a5f] to-slate-800 p-4">
            {/* Teams */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 flex flex-col items-center gap-2">
                <TeamBadge team={myTeam} size={48} />
                <span className="text-xs font-black text-slate-100">{myTeam.shortName}</span>
                <Badge variant={nextIsHome ? 'success' : 'secondary'}>
                  {nextIsHome ? <><Home size={9} /> Casa</> : <><Plane size={9} /> Fora</>}
                </Badge>
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-2xl font-black text-slate-600">VS</span>
                <span className="text-[10px] font-bold text-slate-500">Rd.{nextFixture.round}</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2">
                <TeamBadge team={nextOpponent} size={48} />
                <span className="text-xs font-black text-slate-100">{nextOpponent.shortName}</span>
                <Badge variant="secondary">Rep. {nextOpponent.reputation}</Badge>
              </div>
            </div>

            <button
              onClick={() => setScreen('match')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/30"
            >
              <Play size={16} />
              Jogar Agora
            </button>
          </div>
        </div>
      )}

      {/* ── Recent results ── */}
      {recentResults.length > 0 && (
        <div>
          <SectionTitle>Resultados Recentes</SectionTitle>
          <div className="flex flex-col gap-2">
            {recentResults.map((f, i) => (
              <ResultPill key={i} fixture={f} myTeamId={save.myTeamId} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recent news ── */}
      {recentNews.length > 0 && (
        <div>
          <SectionTitle>Notícias Recentes</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {recentNews.map(post => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* ── Legendary chance ── */}
      <div>
        <SectionTitle>Chance de Carta Lendária</SectionTitle>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-slate-100">Carta Lendária</span>
            </div>
            <span className="text-sm font-black text-amber-400">
              {(legendaryChance * 100).toFixed(2)}%
            </span>
          </div>
          <Progress value={legendaryPct} color="linear-gradient(90deg, #f59e0b, #d97706)" />
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>{save.legendaryCardsOwned.length} carta(s) lendária(s) obtida(s)</span>
            <span>Máx. {(LEGENDARY_MAX_CHANCE * 100).toFixed(0)}%</span>
          </div>
        </Card>
      </div>

      {/* ── Finances ── */}
      {recentFinances.length > 0 && (
        <div>
          <SectionTitle>Movimentações Financeiras</SectionTitle>
          <Card className="px-4 py-2">
            {recentFinances.map((r, i) => (
              <FinanceRow key={i} record={r} />
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
