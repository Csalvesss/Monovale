import React, { useState, useMemo } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import PlayerCard from '../ui/PlayerCard';
import type { Player, Position } from '../../types';
import { cn } from '../../../../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { AlertTriangle, Users, Star, DollarSign, ChevronDown, Flame, Smile, Meh } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PositionGroup = 'ALL' | 'GK' | 'DEF' | 'MID' | 'ATK';
type SortMode = 'stars' | 'mood' | 'rating';

const GK_POSITIONS: Position[]  = ['GK'];
const DEF_POSITIONS: Position[] = ['CB', 'LB', 'RB'];
const MID_POSITIONS: Position[] = ['CDM', 'CM', 'CAM'];
const ATK_POSITIONS: Position[] = ['LW', 'RW', 'ST', 'CF'];

const MOOD_ORDER: Record<string, number> = { motivated: 4, happy: 3, neutral: 2, unhappy: 1 };

function playerRating(p: Player): number {
  const a = p.attributes;
  if (p.position === 'GK') return Math.round(((a.goalkeeping ?? 0) * 3 + a.defending + a.physical) / 5);
  return Math.round((a.pace + a.shooting + a.passing + a.dribbling + a.defending + a.physical) / 6);
}

function inGroup(p: Player, group: PositionGroup): boolean {
  if (group === 'ALL') return true;
  if (group === 'GK')  return GK_POSITIONS.includes(p.position);
  if (group === 'DEF') return DEF_POSITIONS.includes(p.position);
  if (group === 'MID') return MID_POSITIONS.includes(p.position);
  if (group === 'ATK') return ATK_POSITIONS.includes(p.position);
  return true;
}

function squadWarnings(squad: Player[]): string[] {
  const warnings: string[] = [];
  const gks  = squad.filter(p => p.position === 'GK').length;
  const defs  = squad.filter(p => DEF_POSITIONS.includes(p.position)).length;
  const mids  = squad.filter(p => MID_POSITIONS.includes(p.position)).length;
  const atks  = squad.filter(p => ATK_POSITIONS.includes(p.position)).length;

  if (gks < 1)   warnings.push('Nenhum goleiro no elenco!');
  else if (gks < 2) warnings.push('Apenas 1 goleiro — recomendado ter 2+.');
  if (defs < 3)  warnings.push(`Apenas ${defs} defensor(es) — mínimo: 3.`);
  if (mids < 2)  warnings.push(`Apenas ${mids} meia(s) — mínimo: 2.`);
  if (atks < 1)  warnings.push('Nenhum atacante no elenco!');
  if (squad.length < 11) warnings.push(`Elenco com ${squad.length} jogadores — mínimo para jogar: 11.`);
  return warnings;
}

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SquadScreen() {
  const { state, selectPlayer } = useMB();
  const { save, selectedPlayerId } = state;

  const [sortMode, setSortMode] = useState<SortMode>('stars');
  const [showSort, setShowSort] = useState(false);

  if (!save) return null;

  const myTeam = getTeam(save.myTeamId);
  const squad  = save.mySquad;

  const avgStars = squad.length > 0
    ? (squad.reduce((s, p) => s + p.stars, 0) / squad.length) / 5
    : 0;
  const totalWages = squad.reduce((s, p) => s + p.wage, 0);

  const sortSquad = (players: Player[]) => [...players].sort((a, b) => {
    if (sortMode === 'stars')  return b.stars - a.stars || b.level - a.level;
    if (sortMode === 'mood')   return (MOOD_ORDER[b.mood] ?? 0) - (MOOD_ORDER[a.mood] ?? 0);
    if (sortMode === 'rating') return playerRating(b) - playerRating(a);
    return 0;
  });

  const warnings = squadWarnings(squad);

  const sortLabels: Record<SortMode, string> = {
    stars: 'Estrelas', mood: 'Humor', rating: 'Rating',
  };
  const SortIcons: Record<SortMode, React.ComponentType<{ size?: number; className?: string }>> = {
    stars: Star, mood: Smile, rating: Flame,
  };
  const CurrentSortIcon = SortIcons[sortMode];

  function PlayerGroup({ filter }: { filter: PositionGroup }) {
    const filtered = useMemo(
      () => sortSquad(squad.filter(p => inGroup(p, filter))),
      [squad, filter, sortMode]
    );

    if (filtered.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-slate-500">
          Nenhum jogador nesta posição.
        </div>
      );
    }

    const starters = filtered.slice(0, 11);
    const reserves = filtered.slice(11);

    return (
      <div className="flex flex-col gap-4 pt-3">
        {starters.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Titulares
              </span>
              <Badge variant="secondary">{starters.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {starters.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  compact
                  selected={selectedPlayerId === player.id}
                  onClick={() => selectPlayer(player.id)}
                />
              ))}
            </div>
          </div>
        )}
        {reserves.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Reservas
              </span>
              <Badge variant="secondary">{reserves.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {reserves.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  compact
                  selected={selectedPlayerId === player.id}
                  onClick={() => selectPlayer(player.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">

      {/* ── Header card ── */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: (myTeam?.primaryColor ?? '#2563eb') + '22',
                     border: `2px solid ${(myTeam?.primaryColor ?? '#2563eb')}44` }}
          >
            <Users size={20} style={{ color: myTeam?.primaryColor ?? '#2563eb' }} />
          </div>
          <div>
            <div className="text-base font-black text-slate-100">
              {myTeam?.name ?? 'Meu Time'}
            </div>
            <div className="text-[11px] text-slate-500">Gestão do Elenco</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { icon: Users,       value: String(squad.length),      label: 'Jogadores', color: '#3b82f6' },
            { icon: Star,        value: (squad.reduce((s, p) => s + p.stars, 0) / Math.max(1, squad.length)).toFixed(1), label: 'Média ★', color: '#f59e0b' },
            { icon: DollarSign,  value: `$${fmt(totalWages)}k`,    label: 'Salários/sem', color: '#22c55e' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-slate-900 p-3">
              <Icon size={14} style={{ color }} />
              <span className="text-sm font-black text-slate-100">{value}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Squad avg star bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Média do Elenco</span>
            <span>{(avgStars * 100).toFixed(0)}%</span>
          </div>
          <Progress value={avgStars * 100} color="linear-gradient(90deg, #f59e0b, #d97706)" />
        </div>
      </Card>

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-orange-700/50 bg-orange-950/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-orange-400 shrink-0" />
            <span className="text-xs font-black text-orange-400">Avisos do Elenco</span>
          </div>
          <ul className="space-y-1.5">
            {warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-orange-200">
                <span className="mt-0.5 shrink-0 text-orange-500">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Filters + sort ── */}
      <div className="flex items-center gap-2">
        <div className="relative shrink-0 ml-auto">
          <button
            onClick={() => setShowSort(v => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <CurrentSortIcon size={12} />
            {sortLabels[sortMode]}
            <ChevronDown size={12} />
          </button>
          {showSort && (
            <div className="absolute top-full right-0 mt-1 z-50 min-w-[130px] rounded-xl border border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
              {(['stars', 'mood', 'rating'] as SortMode[]).map(key => {
                const Icon = SortIcons[key];
                return (
                  <button
                    key={key}
                    onClick={() => { setSortMode(key); setShowSort(false); }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2.5 text-xs font-bold text-left transition-colors border-b border-slate-700 last:border-0',
                      sortMode === key ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700'
                    )}
                  >
                    <Icon size={12} />
                    {sortLabels[key]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Player tabs ── */}
      {squad.length === 0 ? (
        <Card className="p-8 text-center">
          <Users size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum jogador no elenco.</p>
          <p className="text-xs text-slate-600 mt-1">Vá ao Mercado para contratar!</p>
        </Card>
      ) : (
        <Tabs defaultValue="ALL">
          <TabsList className="w-full justify-start gap-1">
            {[
              { key: 'ALL', label: 'Todos' },
              { key: 'GK',  label: 'GOL' },
              { key: 'DEF', label: 'DEF' },
              { key: 'MID', label: 'MEI' },
              { key: 'ATK', label: 'ATA' },
            ].map(({ key, label }) => (
              <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
            ))}
          </TabsList>
          {(['ALL', 'GK', 'DEF', 'MID', 'ATK'] as PositionGroup[]).map(key => (
            <TabsContent key={key} value={key}>
              <PlayerGroup filter={key} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
