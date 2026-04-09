import React, { useState, useEffect, useRef } from 'react';
import { useMB } from '../../store/gameStore';
import { calcDefenseTokens, getTeamRating } from '../../utils/matchEngine';
import { getTeam, ALL_TEAMS } from '../../data/teams';
import TeamBadge from '../ui/TeamBadge';
import MoneyDisplay from '../ui/MoneyDisplay';
import MatchEvent from '../ui/MatchEvent';
import type { EventType } from '../ui/MatchEvent';
import type { RoundResultSummary } from '../../types';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Tooltip } from '../../../../components/ui/tooltip';
import { cn } from '../../../../lib/utils';
import {
  Play, Trophy, TrendingUp, Target, Shield,
  Smile, DollarSign, Minus, Home, Plane,
  AlertTriangle, Medal, ChevronRight, Swords, X, BarChart2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvgMorale(squad: import('../../types').Player[]): number {
  if (squad.length === 0) return 0;
  return Math.round(squad.reduce((s, p) => s + p.moodPoints, 0) / squad.length);
}

function resultColor(winner: 'home' | 'away' | 'draw', isHome: boolean) {
  if (winner === 'draw') return { text: 'text-slate-400', bg: 'bg-slate-700/30', border: 'border-slate-600' };
  const iWon = (winner === 'home' && isHome) || (winner === 'away' && !isHome);
  return iWon
    ? { text: 'text-emerald-400', bg: 'bg-emerald-600/10', border: 'border-emerald-600/30' }
    : { text: 'text-red-400',     bg: 'bg-red-600/10',     border: 'border-red-600/30' };
}

function resultLabel(winner: 'home' | 'away' | 'draw', isHome: boolean) {
  if (winner === 'draw') return 'EMPATE';
  const iWon = (winner === 'home' && isHome) || (winner === 'away' && !isHome);
  return iWon ? 'VITÓRIA' : 'DERROTA';
}

function classifyLine(line: string): EventType {
  if (line.includes('GOL') || line.includes('gol') || line.includes('Golaço') || line.includes('placar')) return 'goal';
  if (line.includes('defende') || line.includes('Defesa') || line.includes('goleiro')) return 'defense';
  if (line.includes('bloqueado') || line.includes('Bloqueio') || line.includes('trave')) return 'blocked';
  if (line.includes('adversário') || line.includes('sofre') || line.includes('sofreu')) return 'opponent_goal';
  if (line.includes('ataque') || line.includes('Ataque') || line.includes('chute')) return 'attack';
  return 'info';
}

// ─── Round Results Modal ──────────────────────────────────────────────────────

function RoundResultsModal({ summary, onClose }: { summary: RoundResultSummary; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', padding: 0,
    }}>
      <div style={{
        width: '100%', maxHeight: '80dvh', overflowY: 'auto',
        background: '#0f172a', borderRadius: '20px 20px 0 0',
        border: '1px solid #334155', borderBottom: 'none',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 12px', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0,
          background: '#0f172a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart2 size={16} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#f1f5f9' }}>Resultados da Rodada {summary.round}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{summary.fixtures.length} partidas disputadas</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid #334155',
              background: '#1e293b', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} color="#94a3b8" />
          </button>
        </div>

        {/* Fixtures list */}
        <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summary.fixtures.map((f, i) => {
            const homeTeam = getTeam(f.homeTeamId);
            const awayTeam = getTeam(f.awayTeamId);
            const homeWon = f.homeGoals > f.awayGoals;
            const awayWon = f.awayGoals > f.homeGoals;
            const draw = f.homeGoals === f.awayGoals;
            return (
              <div
                key={i}
                style={{
                  background: '#1e293b', borderRadius: 12, padding: '12px 14px',
                  border: '1px solid #334155',
                  display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center', gap: 12,
                }}
              >
                {/* Home team */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {homeTeam && <TeamBadge team={homeTeam} size={28} />}
                  <span style={{
                    fontSize: 12, fontWeight: homeWon ? 800 : 500,
                    color: homeWon ? '#f1f5f9' : '#64748b',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {homeTeam?.shortName ?? f.homeTeamId}
                  </span>
                </div>

                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 18, fontWeight: 900,
                    color: homeWon ? '#f1f5f9' : '#64748b',
                  }}>{f.homeGoals}</span>
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>×</span>
                  <span style={{
                    fontSize: 18, fontWeight: 900,
                    color: awayWon ? '#f1f5f9' : '#64748b',
                  }}>{f.awayGoals}</span>
                </div>

                {/* Away team */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <span style={{
                    fontSize: 12, fontWeight: awayWon ? 800 : 500,
                    color: awayWon ? '#f1f5f9' : '#64748b', textAlign: 'right',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {awayTeam?.shortName ?? f.awayTeamId}
                  </span>
                  {awayTeam && <TeamBadge team={awayTeam} size={28} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Pre-match panel ──────────────────────────────────────────────────────────

function PreMatchView() {
  const { state, playMatch } = useMB();
  const save = state.save!;
  const [animating, setAnimating] = useState(false);

  const nextFixtureIndex = save.fixtures.findIndex(f => !f.played);
  const fixture = nextFixtureIndex >= 0 ? save.fixtures[nextFixtureIndex] : null;

  if (!fixture) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
        <Trophy size={52} className="text-amber-400" />
        <h3 className="text-xl font-black text-amber-400">Temporada Concluída!</h3>
        <p className="text-sm text-slate-400">Todos os jogos foram disputados.</p>
        <p className="text-xs text-slate-500">Acesse a Tabela para ver a classificação final.</p>
      </div>
    );
  }

  const myTeamId    = save.myTeamId;
  const isHome      = fixture.homeTeamId === myTeamId;
  const opponentId  = isHome ? fixture.awayTeamId : fixture.homeTeamId;
  const myTeam      = getTeam(myTeamId);
  const opponent    = getTeam(opponentId);
  const opponentRating = opponent ? Math.round(opponent.reputation * 0.85) : 60;

  const defTokens  = calcDefenseTokens(save.mySquad);
  const teamRating = getTeamRating(save.mySquad);
  const avgMorale  = getAvgMorale(save.mySquad);

  const ratingDiff  = teamRating - opponentRating;
  const favoriteLabel = ratingDiff > 8 ? 'Favorito' : ratingDiff < -8 ? 'Azarão' : 'Equilíbrado';
  const favoriteVariant = ratingDiff > 8 ? 'success' : ratingDiff < -8 ? 'destructive' : 'default';

  // Win probability estimate
  const winProb = Math.min(90, Math.max(10, 50 + ratingDiff * 1.2));

  function handlePlay() {
    setAnimating(true);
    setTimeout(() => {
      playMatch(nextFixtureIndex);
      setAnimating(false);
    }, 300);
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {/* Round badge */}
      <div className="text-center">
        <Badge variant="secondary" className="px-4 py-1.5 text-xs">
          Rodada {fixture.round} · {isHome ? 'Mandante' : 'Visitante'}
        </Badge>
      </div>

      {/* Match card */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          {/* My team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {myTeam ? <TeamBadge team={myTeam} size={52} /> : <div className="h-13 w-13 rounded-full bg-slate-700" />}
            <span className="text-sm font-black text-slate-100 text-center">{myTeam?.name ?? 'Meu Time'}</span>
            <Badge variant={isHome ? 'success' : 'secondary'}>
              {isHome ? <><Home size={9} /> Casa</> : <><Plane size={9} /> Fora</>}
            </Badge>
          </div>

          {/* VS + favorite */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <span className="text-2xl font-black text-slate-600">VS</span>
            <Badge variant={favoriteVariant}>
              <TrendingUp size={9} />
              {favoriteLabel}
            </Badge>
            <div className="text-center">
              <div className="text-lg font-black" style={{ color: winProb >= 60 ? '#22c55e' : winProb <= 40 ? '#ef4444' : '#eab308' }}>
                {Math.round(winProb)}%
              </div>
              <div className="text-[9px] text-slate-500 whitespace-nowrap">chance de vitória</div>
            </div>
          </div>

          {/* Opponent */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {opponent && <TeamBadge team={opponent} size={52} />}
            <span className="text-sm font-black text-slate-100 text-center">{opponent?.name ?? 'Adversário'}</span>
            <Badge variant="secondary">Rating: {opponentRating}</Badge>
          </div>
        </div>
      </Card>

      {/* Squad stats */}
      <Card className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Seu Elenco</p>
        <div className="grid grid-cols-3 gap-3">
          <StatBlock
            icon={TrendingUp} label="Rating" value={teamRating} color="#60a5fa"
          />
          <Tooltip content="Fichas que bloqueiam posições do gol adversário por partida">
            <StatBlock
              icon={Shield} label="Fichas Def." value={defTokens} color="#f59e0b"
            />
          </Tooltip>
          <StatBlock
            icon={Smile} label="Moral" value={avgMorale}
            color={avgMorale >= 75 ? '#22c55e' : avgMorale >= 50 ? '#eab308' : '#ef4444'}
            unit="%"
          />
        </div>
        {save.mySquad.some(p => p.injured) && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-600/10 border border-red-600/20 px-3 py-2">
            <AlertTriangle size={12} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-400">
              {save.mySquad.filter(p => p.injured).length} jogador(es) lesionado(s)
            </p>
          </div>
        )}
      </Card>

      {/* Play button */}
      <button
        onClick={handlePlay}
        disabled={animating}
        className={cn(
          'flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-xl font-black text-white transition-all',
          'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
          'shadow-xl shadow-blue-600/40 active:scale-[0.98]',
          animating && 'opacity-75 cursor-not-allowed'
        )}
      >
        {animating ? (
          <div className="h-6 w-6 rounded-full border-3 border-white/30 border-t-white animate-spin" />
        ) : (
          <Play size={22} />
        )}
        JOGAR PARTIDA
      </button>

      {/* How it works */}
      <Card className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Como Funciona</p>
        <div className="flex flex-col gap-3">
          {[
            { icon: Swords,  text: '3 fases de ataque por time a cada partida.' },
            { icon: Target,  text: 'Cada ataque mira uma das 16 posições do gol.' },
            { icon: Shield,  text: `Suas ${defTokens} fichas de defesa bloqueiam posições aleatórias do adversário.` },
            { icon: TrendingUp, text: 'Rating do elenco aumenta a chance de gol em cada ataque.' },
            { icon: Smile,   text: 'Jogadores motivados rendem até 10% a mais.' },
            { icon: DollarSign, text: 'Vitórias geram receitas de patrocínio e bilheteria.' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <Icon size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Post-match animated panel ────────────────────────────────────────────────

function PostMatchView() {
  const { state, setScreen, switchTurn } = useMB();
  const save = state.save!;
  const matchData = state.lastMatchResult!;
  const { result, narrative } = matchData;
  const [showingRoundResults, setShowingRoundResults] = useState(false);

  const lastPlayedFixture = [...save.fixtures].reverse().find(f => f.played);
  const myTeamId = save.myTeamId;
  const isHome   = lastPlayedFixture?.homeTeamId === myTeamId;
  const myGoals  = isHome ? result.homeGoals : result.awayGoals;
  const opGoals  = isHome ? result.awayGoals : result.homeGoals;

  const opponentId = lastPlayedFixture
    ? (isHome ? lastPlayedFixture.awayTeamId : lastPlayedFixture.homeTeamId)
    : '';
  const opponent  = getTeam(opponentId);
  const colors    = resultColor(result.winner, isHome ?? true);
  const label     = resultLabel(result.winner, isHome ?? true);

  const xpList = Object.entries(result.xpEarned)
    .map(([id, xp]) => ({ player: save.mySquad.find(p => p.id === id), xp }))
    .filter(e => e.player !== undefined)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3) as { player: import('../../types').Player; xp: number }[];

  // Animated narrative reveal
  const [revealed, setRevealed] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setRevealed(0);
    const reveal = (idx: number) => {
      if (idx >= narrative.length) return;
      timerRef.current = setTimeout(() => {
        setRevealed(idx + 1);
        reveal(idx + 1);
      }, 700);
    };
    reveal(0);
    return () => clearTimeout(timerRef.current);
  }, [narrative]);

  const isVictory = label === 'VITÓRIA';

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">

      {/* ── Result banner ── */}
      <div className={cn('rounded-2xl border p-6 flex flex-col items-center gap-3', colors.bg, colors.border)}>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
          {opponent?.name ?? 'Adversário'}
        </span>
        <div className={cn('text-6xl font-black tracking-widest animate-score-reveal', colors.text)}>
          {myGoals} <span className="text-slate-600 text-5xl">x</span> {opGoals}
        </div>
        <Badge
          className={cn(
            'text-sm px-5 py-1.5 rounded-full font-black',
            isVictory ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' :
            label === 'EMPATE' ? 'bg-slate-600/20 text-slate-400 border-slate-600/30' :
            'bg-red-600/20 text-red-400 border-red-600/30'
          )}
        >
          {label}
        </Badge>
      </div>

      {/* ── Earnings ── */}
      <Card className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Receitas</p>
        <div className="flex flex-col gap-2">
          <EarningRow icon={DollarSign} label="Patrocínio" value={result.sponsorEarned} />
          {result.ticketRevenue > 0 && (
            <EarningRow icon={Trophy} label="Bilheteria" value={result.ticketRevenue} />
          )}
          <div className="border-t border-slate-700 pt-2 mt-1">
            <EarningRow icon={DollarSign} label="Total" value={result.sponsorEarned + result.ticketRevenue} highlight />
          </div>
        </div>
      </Card>

      {/* ── Match narrative timeline ── */}
      <Card className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Lances da Partida</p>
        <div className="relative pl-5">
          {/* Vertical timeline line */}
          <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-700" />
          <div className="flex flex-col gap-2">
            {narrative.slice(0, revealed).map((line, i) => (
              <div key={i} className="relative">
                {/* Timeline dot */}
                <div className={cn(
                  'absolute -left-[18px] top-3 h-2 w-2 rounded-full border',
                  classifyLine(line) === 'goal' ? 'bg-emerald-400 border-emerald-600' :
                  classifyLine(line) === 'defense' ? 'bg-blue-400 border-blue-600' :
                  classifyLine(line) === 'opponent_goal' ? 'bg-red-400 border-red-600' :
                  'bg-slate-600 border-slate-700'
                )} />
                <MatchEvent
                  type={classifyLine(line)}
                  text={line}
                  delay={i * 50}
                />
              </div>
            ))}
            {revealed < narrative.length && (
              <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                Simulando...
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── XP highlights ── */}
      {xpList.length > 0 && revealed >= narrative.length && (
        <Card className="p-4 animate-fade-up">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Destaques da Partida</p>
          <div className="flex flex-col gap-3">
            {xpList.map(({ player, xp }, idx) => {
              const medalColor = idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#cd7f32';
              return (
                <div key={player.id} className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: medalColor }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{player.name}</p>
                    <p className="text-[10px] text-slate-500">{player.position} · Nv.{player.level}</p>
                  </div>
                  <span className="text-sm font-black text-purple-400">+{xp} XP</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Round results button ── */}
      {revealed >= narrative.length && save.lastRoundResults && save.lastRoundResults.fixtures.length > 1 && (
        <Card className="p-4 animate-fade-up border-blue-700/30 bg-blue-600/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-100">Outros resultados da rodada</p>
              <p className="text-xs text-slate-500">{save.lastRoundResults.fixtures.length - 1} outras partidas foram disputadas</p>
            </div>
            <button
              onClick={() => setShowingRoundResults(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600/20 border border-blue-600/30 px-4 py-2 text-sm font-bold text-blue-400 hover:bg-blue-600/30 transition-colors"
            >
              <BarChart2 size={14} /> Ver
            </button>
          </div>
        </Card>
      )}

      {/* ── Action buttons ── */}
      {revealed >= narrative.length && (() => {
        const isMulti = save.mode === 'local-multi';
        const nextTurn: 1 | 2 = save.currentTurn === 1 ? 2 : 1;
        const nextPlayerName = isMulti && save.playerProfiles
          ? save.playerProfiles[nextTurn - 1].name
          : null;
        return (
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            <button
              onClick={isMulti ? switchTurn : () => setScreen('match')}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-700/40 bg-blue-600/10 py-3.5 text-sm font-bold text-blue-400 hover:bg-blue-600/20 transition-colors"
            >
              <Swords size={15} />
              {isMulti && nextPlayerName ? `Vez de ${nextPlayerName}` : 'Próxima'}
            </button>
            <button
              onClick={() => setScreen('standings')}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3.5 text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Trophy size={15} /> Ver Tabela
            </button>
          </div>
        );
      })()}

      {/* ── Round results modal ── */}
      {showingRoundResults && save.lastRoundResults && (
        <RoundResultsModal
          summary={save.lastRoundResults}
          onClose={() => setShowingRoundResults(false)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBlock({ icon: Icon, label, value, color, unit = '' }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: number; color: string; unit?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-[#0f172a] p-3">
      <Icon size={14} style={{ color }} />
      <span className="text-xl font-black" style={{ color }}>{value}{unit}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500 text-center">{label}</span>
    </div>
  );
}

function EarningRow({ icon: Icon, label, value, highlight = false }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: number; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={14} className={highlight ? 'text-emerald-400' : 'text-slate-500'} />
        <span className={cn('text-sm', highlight ? 'font-black text-slate-100' : 'text-slate-400')}>
          {label}
        </span>
      </div>
      <MoneyDisplay amount={value} showSign size={highlight ? 'md' : 'sm'} />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function MatchScreen() {
  const { state } = useMB();

  if (!state.save) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Carregando…
      </div>
    );
  }

  const showResult = state.lastMatchResult !== null && state.matchPhase === 'result';

  return (
    <div className="bg-[#0f172a] min-h-full">
      {/* Screen header */}
      <div className="sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-600/30">
            <Swords size={14} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-black text-slate-100">
              {showResult ? 'Resultado' : 'Próxima Partida'}
            </h2>
            <p className="text-[10px] text-slate-500">
              Temporada {state.save.currentSeason} · Rodada {state.save.currentRound}
            </p>
          </div>
        </div>
      </div>

      {showResult ? <PostMatchView /> : <PreMatchView />}
    </div>
  );
}
