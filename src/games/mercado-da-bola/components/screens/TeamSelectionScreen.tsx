import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import { ALL_TEAMS } from '../../data/teams';
import { LEAGUES } from '../../constants';
import { getAvailablePlayers } from '../../data/players';
import TeamBadge from '../ui/TeamBadge';
import { cn } from '../../../../lib/utils';
import type { LeagueId, Team, GameSave, Stadium, PlayerProfile } from '../../types';
import { Users, User, Globe, ChevronLeft, Trophy, DollarSign, ArrowRight, Check } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSquad(team: Team) {
  return getAvailablePlayers(team.id, 16);
}

function generateFixtures(myTeamId: string, leagueTeams: Team[], excludeTeamId?: string) {
  const others = leagueTeams.filter(t => t.id !== myTeamId && t.id !== excludeTeamId);
  const home = others.slice(0, 9).map((t, i) => ({
    round: i + 1, homeTeamId: myTeamId, awayTeamId: t.id, played: false,
  }));
  const away = others.slice(0, 9).map((t, i) => ({
    round: i + 10, homeTeamId: t.id, awayTeamId: myTeamId, played: false,
  }));
  return [...home, ...away];
}

function generateStandings(teams: Team[]) {
  return teams.map(t => ({
    teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));
}

function makeStadium(team: Team): Stadium {
  return {
    name: team.stadiumName,
    capacity: team.stadiumCapacity,
    vipSections: 0, trainingLevel: 0, academyLevel: 0, mediaLevel: 0, ticketPrice: 1,
  };
}

// ─── Team picker ──────────────────────────────────────────────────────────────

function TeamPicker({
  selected, onSelect, disabledTeamId, lockLeague,
}: {
  selected: Team | null;
  onSelect: (t: Team | null) => void;
  disabledTeamId?: string;
  lockLeague?: LeagueId;
}) {
  const [leagueFilter, setLeagueFilter] = useState<LeagueId | 'all'>(lockLeague ?? 'all');

  const filteredTeams = (leagueFilter === 'all' ? ALL_TEAMS : ALL_TEAMS.filter(t => t.leagueId === leagueFilter))
    .filter(t => t.id !== disabledTeamId);

  return (
    <div>
      {/* League filter */}
      {!lockLeague && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setLeagueFilter('all')}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors',
              leagueFilter === 'all'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200',
            )}
          >Todos</button>
          {LEAGUES.map(lg => (
            <button
              key={lg.id}
              onClick={() => setLeagueFilter(lg.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors',
                leagueFilter === lg.id
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200',
              )}
            >{lg.flag} {lg.name}</button>
          ))}
        </div>
      )}

      {/* Team grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredTeams.map(team => {
          const league = LEAGUES.find(l => l.id === team.leagueId);
          const isSelected = selected?.id === team.id;
          return (
            <button
              key={team.id}
              onClick={() => onSelect(isSelected ? null : team)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-600/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600',
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={11} className="text-white" />
                </div>
              )}
              <TeamBadge team={team} size={44} />
              <div className="text-center">
                <p className="text-xs font-black text-slate-100 leading-tight">{team.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{league?.flag} Rep. {team.reputation}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Mode = 'solo' | 'local-multi';
type Step = 'mode' | 'p1' | 'p2' | 'confirm';

interface Props { onBack: () => void; }

export default function TeamSelectionScreen({ onBack }: Props) {
  const { dispatch, setScreen } = useMB();

  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<Step>('mode');
  const [p1Name, setP1Name] = useState('Jogador 1');
  const [p2Name, setP2Name] = useState('Jogador 2');
  const [p1Team, setP1Team] = useState<Team | null>(null);
  const [p2Team, setP2Team] = useState<Team | null>(null);

  // ── Confirm solo ──────────────────────────────────────────────────────────
  function handleSoloConfirm() {
    if (!p1Team) return;
    const leagueTeams = ALL_TEAMS.filter(t => t.leagueId === p1Team.leagueId);
    const squad = generateSquad(p1Team);
    const allPlayers = ALL_TEAMS.flatMap(t => t.id === p1Team.id ? [] : getAvailablePlayers(t.id, 14));

    const save: GameSave = {
      version: '1.0',
      timestamp: Date.now(),
      myTeamId: p1Team.id,
      budget: 500 + p1Team.reputation * 5,
      currentSeason: 1, currentRound: 1,
      mySquad: squad,
      allPlayers: [...squad, ...allPlayers],
      fixtures: generateFixtures(p1Team.id, leagueTeams),
      standings: generateStandings(leagueTeams),
      sponsorId: null, sponsorPoints: 0,
      stadium: makeStadium(p1Team),
      finances: [], newsFeed: [],
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], seasonHistory: [], totalRoundsPlayed: 0,
      mode: 'solo', currentTurn: 1, playerProfiles: null,
      randomSeed: Math.floor(Math.random() * 1_000_000),
    };
    dispatch({ type: 'START_NEW_GAME', save });
  }

  // ── Confirm multi ─────────────────────────────────────────────────────────
  function handleMultiConfirm() {
    if (!p1Team || !p2Team) return;
    const leagueTeams = ALL_TEAMS.filter(t => t.leagueId === p1Team.leagueId);
    const p1Squad = generateSquad(p1Team);
    const p2Squad = generateSquad(p2Team);
    const allPlayers = ALL_TEAMS.flatMap(t => {
      if (t.id === p1Team.id || t.id === p2Team.id) return [];
      return getAvailablePlayers(t.id, 14);
    });

    const p1Profile: PlayerProfile = {
      name: p1Name.trim() || 'Jogador 1',
      teamId: p1Team.id,
      squad: p1Squad,
      budget: 500 + p1Team.reputation * 5,
      stadium: makeStadium(p1Team),
      sponsorId: null, sponsorPoints: 0,
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], finances: [],
      fixtures: generateFixtures(p1Team.id, leagueTeams, p2Team.id),
      currentRound: 1, currentSeason: 1, seasonHistory: [], totalRoundsPlayed: 0,
    };

    const p2Profile: PlayerProfile = {
      name: p2Name.trim() || 'Jogador 2',
      teamId: p2Team.id,
      squad: p2Squad,
      budget: 500 + p2Team.reputation * 5,
      stadium: makeStadium(p2Team),
      sponsorId: null, sponsorPoints: 0,
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], finances: [],
      fixtures: generateFixtures(p2Team.id, leagueTeams, p1Team.id),
      currentRound: 1, currentSeason: 1, seasonHistory: [], totalRoundsPlayed: 0,
    };

    // Active player is P1 — load their data into main GameSave fields
    const save: GameSave = {
      version: '1.0',
      timestamp: Date.now(),
      myTeamId: p1Team.id,
      budget: p1Profile.budget,
      currentSeason: 1, currentRound: 1,
      mySquad: p1Squad,
      allPlayers: [...p1Squad, ...p2Squad, ...allPlayers],
      fixtures: p1Profile.fixtures,
      standings: generateStandings(leagueTeams),
      sponsorId: null, sponsorPoints: 0,
      stadium: makeStadium(p1Team),
      finances: [], newsFeed: [],
      legendaryCardsOwned: [], legendaryChanceBonus: 0,
      pendingOffers: [], seasonHistory: [], totalRoundsPlayed: 0,
      mode: 'local-multi',
      currentTurn: 1,
      playerProfiles: [p1Profile, p2Profile],
      randomSeed: Math.floor(Math.random() * 1_000_000),
    };
    dispatch({ type: 'START_NEW_GAME', save });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-dvh bg-[#0f172a] text-slate-100">

      {/* Header */}
      <div className="bg-gradient-to-b from-[#0d2240] to-[#0f172a] border-b border-slate-800 px-4 pt-safe-top pt-6 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={step === 'mode' ? onBack : () => {
              if (step === 'p1') setStep('mode');
              else if (step === 'p2') setStep('p1');
              else if (step === 'confirm') setStep(mode === 'local-multi' ? 'p2' : 'p1');
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={14} />
            {step === 'mode' ? 'Sair' : 'Voltar'}
          </button>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-blue-400" />
            <span className="font-black text-[15px]" style={{ fontFamily: 'var(--font-title)' }}>
              Lenda da Bola
            </span>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-100">
          {step === 'mode' && 'Como quer jogar?'}
          {step === 'p1' && (mode === 'local-multi' ? `${p1Name || 'Jogador 1'}: Escolha seu time` : 'Escolha seu time')}
          {step === 'p2' && `${p2Name || 'Jogador 2'}: Escolha seu time`}
          {step === 'confirm' && 'Pronto para começar!'}
        </h2>
        {step === 'p2' && p1Team && (
          <p className="text-xs text-slate-500 mt-1">
            Mesma liga do {p1Team.name} · {LEAGUES.find(l => l.id === p1Team.leagueId)?.name}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">

        {/* ── Mode selection ── */}
        {step === 'mode' && (
          <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
            <button
              onClick={() => { setMode('solo'); setStep('p1'); }}
              className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-5 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-600/30">
                <User size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[15px] font-black text-slate-100">Solo</p>
                <p className="text-xs text-slate-500 mt-0.5">Gerencie seu time contra a IA</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-600" />
            </button>

            <button
              onClick={() => { setMode('local-multi'); setStep('p1'); }}
              className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-5 hover:border-purple-500/50 hover:bg-purple-600/5 transition-all text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-600/30">
                <Users size={22} className="text-purple-400" />
              </div>
              <div>
                <p className="text-[15px] font-black text-slate-100">Jogar com Amigo</p>
                <p className="text-xs text-slate-500 mt-0.5">2 jogadores, mesmo dispositivo</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-600" />
            </button>

            <button
              onClick={() => setScreen('online-lobby')}
              className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-5 hover:border-emerald-500/50 hover:bg-emerald-600/5 transition-all text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-600/30">
                <Globe size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[15px] font-black text-slate-100">Jogar Online</p>
                <p className="text-xs text-slate-500 mt-0.5">Liga com amigos em outros dispositivos</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-600" />
            </button>
          </div>
        )}

        {/* ── Player 1 setup ── */}
        {step === 'p1' && (
          <div>
            {mode === 'local-multi' && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Nome do Jogador 1</label>
                <input
                  value={p1Name}
                  onChange={e => setP1Name(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
                  placeholder="Jogador 1"
                />
              </div>
            )}
            <TeamPicker selected={p1Team} onSelect={setP1Team} />
          </div>
        )}

        {/* ── Player 2 setup ── */}
        {step === 'p2' && (
          <div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Nome do Jogador 2</label>
              <input
                value={p2Name}
                onChange={e => setP2Name(e.target.value)}
                maxLength={20}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-100 focus:border-purple-500 focus:outline-none"
                placeholder="Jogador 2"
              />
            </div>
            <TeamPicker
              selected={p2Team}
              onSelect={setP2Team}
              disabledTeamId={p1Team?.id}
              lockLeague={p1Team?.leagueId}
            />
          </div>
        )}

        {/* ── Confirm screen ── */}
        {step === 'confirm' && (
          <div className="flex flex-col gap-4 max-w-sm mx-auto pt-2">
            {mode === 'solo' && p1Team && (
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex items-center gap-4">
                <TeamBadge team={p1Team} size={56} />
                <div>
                  <p className="text-lg font-black text-slate-100">{p1Team.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <DollarSign size={12} className="text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      ${(500 + p1Team.reputation * 5).toLocaleString('pt-BR')}k iniciais
                    </span>
                  </div>
                </div>
              </div>
            )}

            {mode === 'local-multi' && p1Team && p2Team && (
              <>
                {[
                  { name: p1Name || 'Jogador 1', team: p1Team, color: '#3b82f6', label: 'J1' },
                  { name: p2Name || 'Jogador 2', team: p2Team, color: '#a855f7', label: 'J2' },
                ].map(({ name, team, color, label }) => (
                  <div key={label} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 flex items-center gap-4">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: color }}
                    >{label}</div>
                    <TeamBadge team={team} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-100 truncate">{name}</p>
                      <p className="text-xs text-slate-500">{team.name}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 shrink-0">
                      ${(500 + team.reputation * 5).toLocaleString('pt-BR')}k
                    </span>
                  </div>
                ))}
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-center text-xs text-slate-500">
                  {LEAGUES.find(l => l.id === p1Team.leagueId)?.flag} Mesma liga · Turnos alternados
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Sticky footer ── */}
      {step !== 'mode' && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 px-4 py-4 pb-safe-bottom">
          {step === 'p1' && p1Team && (
            <button
              onClick={() => mode === 'local-multi' ? setStep('p2') : setStep('confirm')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white hover:bg-blue-500 transition-colors"
            >
              {p1Team.name}
              <ArrowRight size={16} />
            </button>
          )}

          {step === 'p2' && p2Team && (
            <button
              onClick={() => setStep('confirm')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3.5 text-sm font-black text-white hover:bg-purple-500 transition-colors"
            >
              {p2Team.name}
              <ArrowRight size={16} />
            </button>
          )}

          {step === 'confirm' && (
            <button
              onClick={() => mode === 'local-multi' ? handleMultiConfirm() : handleSoloConfirm()}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white transition-colors"
              style={{
                background: mode === 'local-multi'
                  ? 'linear-gradient(135deg, #3b82f6, #a855f7)'
                  : 'linear-gradient(135deg, #059669, #065f46)',
              }}
            >
              <Trophy size={16} />
              Começar!
            </button>
          )}
        </div>
      )}
    </div>
  );
}
