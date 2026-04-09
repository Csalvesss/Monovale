import React, { useState, useEffect } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import type { Standing, MatchFixture } from '../../types';
import type { LeagueStanding } from '../../services/lendaService';
import { listenLeagueStandings } from '../../services/lendaService';
import { cn } from '../../../../lib/utils';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { BarChart2, Trophy, TrendingUp, AlertTriangle, Home, Plane, Globe } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortedStandings(standings: Standing[]): Standing[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const sgA = a.goalsFor - a.goalsAgainst;
    const sgB = b.goalsFor - b.goalsAgainst;
    if (sgB !== sgA) return sgB - sgA;
    return b.goalsFor - a.goalsFor;
  });
}

function getMyResults(fixtures: MatchFixture[], myTeamId: string) {
  return fixtures
    .filter(f => f.played && (f.homeTeamId === myTeamId || f.awayTeamId === myTeamId))
    .slice(-5)
    .reverse()
    .map(f => {
      const isHome = f.homeTeamId === myTeamId;
      const myGoals = isHome ? f.result!.homeGoals : f.result!.awayGoals;
      const opGoals = isHome ? f.result!.awayGoals : f.result!.homeGoals;
      const label: 'V' | 'E' | 'D' = myGoals > opGoals ? 'V' : myGoals === opGoals ? 'E' : 'D';
      return { fixture: f, label, score: `${myGoals}x${opGoals}` };
    });
}

function getUpcomingFixtures(fixtures: MatchFixture[], myTeamId: string) {
  return fixtures
    .filter(f => !f.played && (f.homeTeamId === myTeamId || f.awayTeamId === myTeamId))
    .slice(0, 3);
}

// ─── Table row ────────────────────────────────────────────────────────────────

interface RowProps {
  pos: number;
  standing: Standing;
  myTeamId: string;
  totalTeams: number;
  isLastPromo?: boolean;
  isFirstRelegate?: boolean;
}

function StandingRow({ pos, standing, myTeamId, totalTeams, isLastPromo, isFirstRelegate }: RowProps) {
  const isMe         = standing.teamId === myTeamId;
  const isPromotion  = pos <= 4;
  const isRelegation = pos > totalTeams - 4;
  const team         = getTeam(standing.teamId);
  const sg           = standing.goalsFor - standing.goalsAgainst;

  const posColor = pos === 1 ? '#fde68a' : isPromotion ? '#22c55e' : isRelegation ? '#ef4444' : '#64748b';

  const cell = cn(
    'py-2.5 px-2 text-xs text-center whitespace-nowrap',
    isMe ? 'font-bold text-slate-100' : 'text-slate-400'
  );

  return (
    <>
      {isLastPromo && (
        <tr>
          <td colSpan={10}>
            <div className="h-px bg-emerald-500/40 my-0.5" />
          </td>
        </tr>
      )}
      {isFirstRelegate && (
        <tr>
          <td colSpan={10}>
            <div className="h-px border-t border-red-500/40 border-dashed my-0.5" />
          </td>
        </tr>
      )}
      <tr className={cn(
        'transition-colors',
        isMe ? 'bg-blue-600/10' : isPromotion ? 'bg-emerald-600/5' : isRelegation ? 'bg-red-600/5' : ''
      )}
        style={isMe ? { borderLeft: '3px solid #3b82f6' } : {}}>
        <td className={cn(cell, 'font-black')} style={{ color: posColor }}>{pos}</td>
        <td className={cn(cell, '!text-left pl-3')}>
          <div className="flex items-center gap-2">
            {/* Color dot indicator */}
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: team?.primaryColor ?? '#64748b' }} />
            <span className={cn('truncate max-w-[90px]', isMe ? 'text-white' : 'text-slate-300')}>
              {team?.shortName ?? standing.teamId.toUpperCase()}
            </span>
            {isMe && <Badge variant="default" className="text-[8px] px-1 py-0">EU</Badge>}
          </div>
        </td>
        <td className={cn(cell, 'text-amber-400 font-black text-sm')}>{standing.points}</td>
        <td className={cell}>{standing.played}</td>
        <td className={cn(cell, 'text-emerald-400')}>{standing.won}</td>
        <td className={cn(cell, 'text-blue-400')}>{standing.drawn}</td>
        <td className={cn(cell, 'text-red-400')}>{standing.lost}</td>
        <td className={cell}>{standing.goalsFor}</td>
        <td className={cell}>{standing.goalsAgainst}</td>
        <td className={cn(cell, 'font-bold', sg > 0 ? 'text-emerald-400' : sg < 0 ? 'text-red-400' : 'text-slate-500')}>
          {sg > 0 ? `+${sg}` : sg}
        </td>
      </tr>
    </>
  );
}

// ─── Online league table ──────────────────────────────────────────────────────

function OnlineLeagueTable({ leagueCode, myUid }: { leagueCode: string; myUid: string }) {
  const [standings, setStandings] = useState<LeagueStanding[]>([]);

  useEffect(() => {
    const unsub = listenLeagueStandings(leagueCode, setStandings);
    return unsub;
  }, [leagueCode]);

  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const sgA = a.goalsFor - a.goalsAgainst;
    const sgB = b.goalsFor - b.goalsAgainst;
    if (sgB !== sgA) return sgB - sgA;
    return b.goalsFor - a.goalsFor;
  });

  if (sorted.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center gap-2 text-center">
        <Globe size={32} className="text-slate-600" />
        <p className="text-sm font-bold text-slate-400">Nenhum dado ainda</p>
        <p className="text-xs text-slate-600">Jogue uma partida para aparecer na tabela online</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              {['Pos', 'Jogador', 'P', 'J', 'V', 'E', 'D', 'SG'].map(col => (
                <th
                  key={col}
                  className={cn(
                    'py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-slate-500',
                    col === 'Jogador' ? 'text-left pl-3' : 'text-center'
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, idx) => {
              const isMe = s.uid === myUid;
              const team = getTeam(s.teamId);
              const sg = s.goalsFor - s.goalsAgainst;
              const cell = cn('py-2.5 px-2 text-xs text-center whitespace-nowrap', isMe ? 'font-bold text-slate-100' : 'text-slate-400');
              return (
                <tr key={s.uid} className={cn('transition-colors', isMe ? 'bg-blue-600/10' : '')} style={isMe ? { borderLeft: '3px solid #3b82f6' } : {}}>
                  <td className={cn(cell, 'font-black')} style={{ color: idx === 0 ? '#fde68a' : '#64748b' }}>{idx + 1}</td>
                  <td className={cn(cell, '!text-left pl-3')}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: team?.primaryColor ?? '#64748b' }} />
                      <span className="truncate max-w-[80px]">{s.name}</span>
                      {isMe && <Badge variant="default" className="text-[8px] px-1 py-0">EU</Badge>}
                    </div>
                    <p className="text-[9px] text-slate-600 ml-4">{team?.shortName ?? s.teamId}</p>
                  </td>
                  <td className={cn(cell, 'text-amber-400 font-black text-sm')}>{s.points}</td>
                  <td className={cell}>{s.wins + s.draws + s.losses}</td>
                  <td className={cn(cell, 'text-emerald-400')}>{s.wins}</td>
                  <td className={cn(cell, 'text-blue-400')}>{s.draws}</td>
                  <td className={cn(cell, 'text-red-400')}>{s.losses}</td>
                  <td className={cn(cell, 'font-bold', sg > 0 ? 'text-emerald-400' : sg < 0 ? 'text-red-400' : 'text-slate-500')}>
                    {sg > 0 ? `+${sg}` : sg}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StandingsScreen() {
  const { state } = useMB();
  const [activeTab, setActiveTab] = useState<'league' | 'online'>('league');

  if (!state.save) {
    return <div className="flex h-full items-center justify-center text-slate-500">Carregando…</div>;
  }

  const save       = state.save;
  const myTeamId   = save.myTeamId;
  const sorted     = sortedStandings(save.standings);
  const totalTeams = sorted.length;
  const myResults  = getMyResults(save.fixtures, myTeamId);
  const upcoming   = getUpcomingFixtures(save.fixtures, myTeamId);
  const myTeam     = getTeam(myTeamId);
  const myPos      = sorted.findIndex(s => s.teamId === myTeamId) + 1;
  const myStanding = save.standings.find(s => s.teamId === myTeamId);

  const isInPromotion   = myPos <= 4;
  const isInRelegation  = myPos > totalTeams - 4;

  return (
    <div className="flex flex-col gap-4 p-4 pb-8 bg-[#0f172a] min-h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-600/30">
          <BarChart2 size={16} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-100">Tabela do Campeonato</h2>
          <p className="text-xs text-slate-500">
            Temporada {save.currentSeason} · {save.currentRound} rodadas disputadas
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      {save.onlineLeagueCode && (
        <div className="flex rounded-xl border border-slate-700 overflow-hidden">
          <button
            onClick={() => setActiveTab('league')}
            className={cn(
              'flex-1 py-2 text-xs font-black transition-colors',
              activeTab === 'league' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            Campeonato
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={cn(
              'flex-1 py-2 text-xs font-black flex items-center justify-center gap-1.5 transition-colors',
              activeTab === 'online' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            <Globe size={11} />
            Liga Online
          </button>
        </div>
      )}

      {/* ── Online tab ── */}
      {save.onlineLeagueCode && activeTab === 'online' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-slate-300">Liga Online</p>
            <Badge variant="secondary" className="font-mono text-xs">{save.onlineLeagueCode}</Badge>
          </div>
          <OnlineLeagueTable leagueCode={save.onlineLeagueCode} myUid={save.playerUid ?? ''} />
        </>
      )}

      {/* ── Local league tab (hidden when online tab active) ── */}
      {(!save.onlineLeagueCode || activeTab === 'league') && <>

      {/* ── My team summary ── */}
      <Card className="p-4 border-blue-700/40 bg-blue-600/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-sm"
              style={{
                background: (myTeam?.primaryColor ?? '#3b82f6') + '22',
                border: `2px solid ${(myTeam?.primaryColor ?? '#3b82f6')}44`,
                color: myTeam?.primaryColor ?? '#3b82f6',
              }}
            >
              {myTeam?.shortName?.substring(0, 3) ?? '?'}
            </div>
            <div>
              <p className="text-sm font-black text-white">{myTeam?.name ?? 'Meu Time'}</p>
              <p className="text-xs text-blue-400">{myPos}º lugar · {myStanding?.points ?? 0} pontos</p>
            </div>
          </div>
          <div className="text-right">
            {isInPromotion ? (
              <Badge variant="success"><Trophy size={9} /> Promoção</Badge>
            ) : isInRelegation ? (
              <Badge variant="destructive"><AlertTriangle size={9} /> Rebaixamento</Badge>
            ) : (
              <Badge variant="secondary">Meio da tabela</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* ── Legend ── */}
      <div className="flex gap-3 flex-wrap">
        {[
          { color: '#22c55e', label: 'Promoção (Top 4)' },
          { color: '#ef4444', label: 'Rebaixamento (Últimos 4)' },
          { color: '#3b82f6', label: 'Seu time' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm shrink-0" style={{ background: color }} />
            <span className="text-[10px] text-slate-500 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                {['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GF', 'GA', 'SG'].map(col => (
                  <th
                    key={col}
                    className={cn(
                      'py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-slate-500',
                      col === 'Time' ? 'text-left pl-3' : 'text-center'
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((standing, idx) => (
                <StandingRow
                  key={standing.teamId}
                  pos={idx + 1}
                  standing={standing}
                  myTeamId={myTeamId}
                  totalTeams={totalTeams}
                  isLastPromo={idx === 3}
                  isFirstRelegate={idx === totalTeams - 4}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Recent results ── */}
      {myResults.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Últimos Resultados</p>
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              {myResults.map(({ fixture, label, score }) => {
                const isHome = fixture.homeTeamId === myTeamId;
                const oppId  = isHome ? fixture.awayTeamId : fixture.homeTeamId;
                const opp    = getTeam(oppId);
                return (
                  <div key={`${fixture.round}-${oppId}`} className="flex items-center gap-3">
                    <Badge
                      variant={label === 'V' ? 'win' : label === 'D' ? 'loss' : 'draw'}
                      className="h-7 w-7 shrink-0 rounded-lg px-0 justify-center text-xs font-black"
                    >
                      {label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {isHome ? 'vs' : 'em'} {opp?.name ?? oppId}
                      </p>
                      <p className="text-[10px] text-slate-500">Rodada {fixture.round}</p>
                    </div>
                    <span className={cn(
                      'text-sm font-black',
                      label === 'V' ? 'text-emerald-400' : label === 'D' ? 'text-red-400' : 'text-blue-400'
                    )}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Upcoming ── */}
      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Próximas Partidas</p>
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              {upcoming.map(f => {
                const isHome = f.homeTeamId === myTeamId;
                const oppId  = isHome ? f.awayTeamId : f.homeTeamId;
                const opp    = getTeam(oppId);
                return (
                  <div key={`${f.round}-${oppId}`} className="flex items-center gap-3">
                    <Badge variant="secondary" className="h-7 w-7 shrink-0 rounded-lg px-0 justify-center text-xs font-black">
                      {f.round}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {isHome ? 'vs' : 'em'} {opp?.name ?? oppId}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isHome
                          ? <><Home size={9} className="text-emerald-400" /><span className="text-[10px] text-slate-500">Mandante</span></>
                          : <><Plane size={9} className="text-slate-400" /><span className="text-[10px] text-slate-500">Visitante</span></>
                        }
                        <span className="text-[10px] text-slate-600">· Rep. {opp?.reputation ?? '?'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      </> /* end local league tab */}
    </div>
  );
}
