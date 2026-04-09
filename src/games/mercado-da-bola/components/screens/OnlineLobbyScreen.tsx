import React, { useState, useEffect, useRef } from 'react';
import { useMB } from '../../store/gameStore';
import { useAuth } from '../../../../contexts/AuthContext';
import { ALL_TEAMS } from '../../data/teams';
import { LEAGUES } from '../../constants';
import { getAvailablePlayers } from '../../data/players';
import TeamBadge from '../ui/TeamBadge';
import {
  createLeague, joinLeague, listenLeague, updateLeagueTeam, startLeague, loadOnlineSave,
  type LeagueDoc,
} from '../../services/lendaService';
import type { LeagueId, Team, GameSave, Stadium } from '../../types';
import { cn } from '../../../../lib/utils';
import {
  Globe, ChevronLeft, Copy, Check, Users, Play,
  Trophy, Wifi, WifiOff, Loader, ArrowRight,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStadium(team: Team): Stadium {
  return {
    name: team.stadiumName, capacity: team.stadiumCapacity,
    vipSections: 0, trainingLevel: 0, academyLevel: 0, mediaLevel: 0, ticketPrice: 1,
  };
}

function buildOnlineSave(
  team: Team,
  uid: string,
  displayName: string,
  leagueCode: string,
): GameSave {
  const leagueTeams = ALL_TEAMS.filter(t => t.leagueId === team.leagueId);
  const squad = getAvailablePlayers(team.id, 16);
  const allPlayers = ALL_TEAMS.flatMap(t => t.id === team.id ? [] : getAvailablePlayers(t.id, 14));
  const fixtures = leagueTeams
    .filter(t => t.id !== team.id)
    .flatMap((t, i) => [
      { round: i + 1,     homeTeamId: team.id, awayTeamId: t.id,   played: false },
      { round: i + 10,    homeTeamId: t.id,    awayTeamId: team.id, played: false },
    ]);
  return {
    version: '1.0',
    timestamp: Date.now(),
    myTeamId: team.id,
    budget: 500 + team.reputation * 5,
    currentSeason: 1, currentRound: 1,
    mySquad: squad,
    allPlayers: [...squad, ...allPlayers],
    fixtures,
    standings: leagueTeams.map(t => ({
      teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
    })),
    sponsorId: null, sponsorPoints: 0,
    stadium: makeStadium(team),
    finances: [], newsFeed: [],
    legendaryCardsOwned: [], legendaryChanceBonus: 0,
    pendingOffers: [], seasonHistory: [], totalRoundsPlayed: 0,
    mode: 'online',
    currentTurn: 1,
    playerProfiles: null,
    randomSeed: Math.floor(Math.random() * 1_000_000),
    onlineLeagueCode: leagueCode,
    playerUid: uid,
    playerDisplayName: displayName,
  };
}

// ─── Team selector (compact) ──────────────────────────────────────────────────

function CompactTeamPicker({
  selected, onSelect,
}: {
  selected: Team | null;
  onSelect: (t: Team) => void;
}) {
  const [leagueFilter, setLeagueFilter] = useState<LeagueId | 'all'>('all');
  const teams = leagueFilter === 'all' ? ALL_TEAMS : ALL_TEAMS.filter(t => t.leagueId === leagueFilter);

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => setLeagueFilter('all')}
          className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors',
            leagueFilter === 'all' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
          )}>Todos</button>
        {LEAGUES.map(lg => (
          <button key={lg.id} onClick={() => setLeagueFilter(lg.id)}
            className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors',
              leagueFilter === lg.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
            )}>{lg.flag}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
        {teams.map(team => (
          <button
            key={team.id}
            onClick={() => onSelect(team)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border p-2 transition-all',
              selected?.id === team.id
                ? 'border-blue-500 bg-blue-600/15'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600',
            )}
          >
            <TeamBadge team={team} size={32} />
            <p className="text-[9px] font-bold text-slate-300 text-center leading-tight line-clamp-2">{team.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Step = 'entry' | 'lobby';

interface Props { onBack: () => void; }

export default function OnlineLobbyScreen({ onBack }: Props) {
  const { dispatch } = useMB();
  const { user, profile } = useAuth();

  const displayName = profile?.displayName ?? user?.displayName ?? 'Jogador';
  const uid = user?.uid ?? '';

  const [step, setStep] = useState<Step>('entry');
  const [codeInput, setCodeInput] = useState('');
  const [leagueCode, setLeagueCode] = useState('');
  const [league, setLeague] = useState<LeagueDoc | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  // Listen to league changes once code is set
  useEffect(() => {
    if (!leagueCode) return;
    unsubRef.current?.();
    unsubRef.current = listenLeague(leagueCode, async (data) => {
      setLeague(data);
      // When host starts the game, each player builds their save and starts
      if (data.status === 'playing') {
        const me = data.players.find(p => p.uid === uid);
        const teamId = me?.teamId;
        if (!teamId) return;
        // Try loading existing online save first
        const existing = await loadOnlineSave(leagueCode, uid);
        if (existing) {
          dispatch({ type: 'START_NEW_GAME', save: existing });
          return;
        }
        const team = ALL_TEAMS.find(t => t.id === teamId);
        if (!team) return;
        const save = buildOnlineSave(team, uid, displayName, leagueCode);
        dispatch({ type: 'START_NEW_GAME', save });
      }
    });
    return () => { unsubRef.current?.(); };
  }, [leagueCode, uid, displayName, dispatch]);

  async function handleCreate() {
    setLoading(true); setError('');
    try {
      const code = await createLeague(uid, displayName);
      setLeagueCode(code);
      setStep('lobby');
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function handleJoin() {
    if (!codeInput.trim()) return;
    setLoading(true); setError('');
    try {
      await joinLeague(codeInput.trim(), uid, displayName);
      setLeagueCode(codeInput.trim().toUpperCase());
      setStep('lobby');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    setLoading(false);
  }

  async function handleTeamSelect(team: Team) {
    setSelectedTeam(team);
    if (leagueCode && uid) {
      await updateLeagueTeam(leagueCode, uid, team.id);
    }
  }

  async function handleStartLeague() {
    if (!leagueCode) return;
    await startLeague(leagueCode);
    // Firestore listener will trigger each player's game start
  }

  function copyCode() {
    navigator.clipboard.writeText(leagueCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isHost = league?.hostUid === uid;
  const allReady = league ? league.players.every(p => p.ready) : false;
  const myEntry = league?.players.find(p => p.uid === uid);

  return (
    <div className="flex flex-col min-h-dvh bg-[#0f172a] text-slate-100">

      {/* Header */}
      <div className="bg-gradient-to-b from-[#0d2240] to-[#0f172a] border-b border-slate-800 px-4 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={step === 'entry' ? onBack : () => { setStep('entry'); setLeague(null); setLeagueCode(''); }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={14} />
            {step === 'entry' ? 'Voltar' : 'Sair da Liga'}
          </button>
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-blue-400" />
            <span className="font-black text-[15px]" style={{ fontFamily: 'var(--font-title)' }}>
              Liga Online
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {step === 'entry'
            ? 'Crie ou entre em uma liga com seus amigos'
            : `Liga ${leagueCode} · ${league?.players.length ?? 1} jogador(es)`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">

        {/* ── Entry step ── */}
        {step === 'entry' && (
          <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-5 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all text-left disabled:opacity-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-600/30">
                {loading ? <Loader size={22} className="text-blue-400 animate-spin" /> : <Trophy size={22} className="text-blue-400" />}
              </div>
              <div>
                <p className="text-[15px] font-black text-slate-100">Criar Liga</p>
                <p className="text-xs text-slate-500 mt-0.5">Gere um código e convide amigos</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-600" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-700" />
              <span className="text-xs text-slate-600">ou</span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-purple-400" />
                <p className="text-[15px] font-black text-slate-100">Entrar em Liga</p>
              </div>
              <input
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="Código de 6 letras"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-black text-slate-100 tracking-widest text-center uppercase focus:border-purple-500 focus:outline-none mb-3"
              />
              <button
                onClick={handleJoin}
                disabled={loading || codeInput.length < 6}
                className="w-full rounded-xl bg-purple-600 py-3 text-sm font-black text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-700/40 bg-red-600/10 px-4 py-3 text-xs font-bold text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Lobby step ── */}
        {step === 'lobby' && (
          <div className="flex flex-col gap-4">
            {/* Code pill */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20">
                {league?.status === 'playing'
                  ? <Wifi size={16} className="text-emerald-400" />
                  : <WifiOff size={16} className="text-blue-400" />}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Código da liga</p>
                <p className="text-lg font-black tracking-widest text-white">{leagueCode}</p>
              </div>
              <button onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-600 transition-colors">
                {copied ? <><Check size={12} />Copiado</> : <><Copy size={12} />Copiar</>}
              </button>
            </div>

            {/* Players list */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Jogadores</p>
              <div className="flex flex-col gap-2">
                {(league?.players ?? []).map(p => {
                  const team = p.teamId ? ALL_TEAMS.find(t => t.id === p.teamId) : null;
                  return (
                    <div key={p.uid}
                      className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                      {team
                        ? <TeamBadge team={team} size={32} />
                        : <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">?</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate">
                          {p.name}
                          {p.uid === league?.hostUid && <span className="ml-1.5 text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">HOST</span>}
                        </p>
                        <p className="text-xs text-slate-500">{team?.name ?? 'Escolhendo time…'}</p>
                      </div>
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        p.ready ? 'bg-emerald-400' : 'bg-slate-600 animate-pulse'
                      )} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team selection for current player */}
            {!myEntry?.ready && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Escolha seu time</p>
                <CompactTeamPicker selected={selectedTeam} onSelect={handleTeamSelect} />
              </div>
            )}

            {myEntry?.ready && !isHost && (
              <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-4 py-4 text-center">
                <p className="text-sm font-bold text-emerald-300">Time selecionado!</p>
                <p className="text-xs text-slate-500 mt-1">Aguardando o host iniciar a liga…</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {step === 'lobby' && isHost && allReady && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 px-4 py-4">
          <button
            onClick={handleStartLeague}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-sm font-black text-white hover:opacity-90 transition-all shadow-lg shadow-blue-600/30"
          >
            <Play size={16} />
            Iniciar Liga ({league?.players.length} jogadores)
          </button>
        </div>
      )}

      {step === 'lobby' && isHost && !allReady && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 px-4 py-4">
          <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-4 text-sm font-bold text-slate-500">
            <Loader size={14} className="animate-spin" />
            Aguardando todos escolherem seu time…
          </div>
        </div>
      )}
    </div>
  );
}
