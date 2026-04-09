import React from 'react';
import { useMB } from '../../store/gameStore';
import { ALL_SPONSORS } from '../../data/sponsors';
import type { Sponsor } from '../../types';
import { cn } from '../../../../lib/utils';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import { CheckCircle, Minus, XCircle, Lock, Star, DollarSign, TrendingUp } from 'lucide-react';

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<number, { label: string; color: string; badgeClass: string }> = {
  1: { label: 'Local',    color: '#94a3b8', badgeClass: 'bg-slate-600/20 text-slate-400 border border-slate-600/30' },
  2: { label: 'Regional', color: '#3b82f6', badgeClass: 'bg-blue-600/20 text-blue-400 border border-blue-600/30' },
  3: { label: 'Nacional', color: '#f59e0b', badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
};

// ─── Sponsor card ─────────────────────────────────────────────────────────────

function SponsorCard({ sponsor, active, locked, onSelect }: {
  sponsor: Sponsor; active: boolean; locked: boolean; onSelect: () => void;
}) {
  const tc = TIER_CONFIG[sponsor.tier];

  return (
    <div className={cn(
      'relative rounded-xl border transition-all',
      active  ? 'border-blue-600/50 bg-blue-600/5' : 'border-slate-700 bg-slate-800',
      locked  && 'opacity-50',
    )}>
      {active && (
        <div className="absolute right-3 top-3">
          <Badge variant="default" className="text-[9px] font-black">ATIVO</Badge>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-2xl">
            {sponsor.logo}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-black text-slate-100">{sponsor.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black', tc.badgeClass)}>
                Tier {sponsor.tier} · {tc.label}
              </span>
              <span className="text-xs text-slate-500">{sponsor.industry}</span>
            </div>
          </div>
        </div>

        {/* Fee grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Vitória', value: sponsor.winFee,  Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-600/20' },
            { label: 'Empate',  value: sponsor.drawFee, Icon: Minus,       color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Derrota', value: sponsor.lossFee, Icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-600/10 border-red-600/20' },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={cn('rounded-lg border p-2.5 text-center', bg)}>
              <Icon size={14} className={cn('mx-auto mb-1', color)} />
              <p className={cn('text-sm font-black', color)}>+${value}k</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Action */}
        {locked ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 py-2.5 text-xs text-slate-500">
            <Lock size={12} />
            Reputação mínima: {sponsor.minReputation}
          </div>
        ) : active ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-blue-600/30 bg-blue-600/10 py-2.5 text-xs font-bold text-blue-400">
            <CheckCircle size={12} />
            Patrocínio ativo
          </div>
        ) : (
          <button
            onClick={onSelect}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-black text-white hover:bg-blue-500 active:scale-[0.98] transition-all"
          >
            Fechar Patrocínio
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SponsorScreen() {
  const { state, setSponsor } = useMB();
  const { save } = state;
  if (!save) return null;

  const myStanding     = save.standings.find(s => s.teamId === save.myTeamId);
  const sorted         = [...save.standings].sort((a, b) => b.points - a.points);
  const position       = myStanding ? sorted.findIndex(s => s.teamId === save.myTeamId) + 1 : 10;
  const reputation     = Math.max(20, 80 - (position - 1) * 3 + (myStanding?.won ?? 0) * 2);
  const currentSponsor = ALL_SPONSORS.find(s => s.id === save.sponsorId);

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-black text-slate-100">Patrocínio</h2>
        <div className="flex items-center gap-2 mt-1">
          <Star size={13} className="text-amber-400" />
          <span className="text-xs text-slate-400">Reputação: {reputation}</span>
          <span className="text-slate-700">·</span>
          <span className="text-xs text-slate-500">{currentSponsor ? currentSponsor.name : 'Sem patrocinador'}</span>
        </div>
        <div className="mt-2 space-y-1">
          <Progress value={reputation} color="linear-gradient(90deg, #f59e0b, #d97706)" />
        </div>
      </div>

      {/* ── Active sponsor card ── */}
      {currentSponsor && (
        <div className="rounded-2xl border border-blue-600/30 bg-gradient-to-br from-blue-900/40 to-purple-900/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3">Patrocínio Atual</p>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              {currentSponsor.logo}
            </div>
            <div>
              <p className="text-lg font-black text-white">{currentSponsor.name}</p>
              <p className="text-xs text-blue-300 mt-1">
                +${currentSponsor.winFee}k (V) · +${currentSponsor.drawFee}k (E) · +${currentSponsor.lossFee}k (D)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Sponsor tiers ── */}
      {[3, 2, 1].map(tier => {
        const tc = TIER_CONFIG[tier];
        const sponsors = ALL_SPONSORS.filter(s => s.tier === tier);
        return (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-slate-700" />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: tc.color }}>
                Tier {tier} · {tc.label}
              </span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>
            <div className="flex flex-col gap-3">
              {sponsors.map(sp => (
                <SponsorCard
                  key={sp.id}
                  sponsor={sp}
                  active={save.sponsorId === sp.id}
                  locked={reputation < sp.minReputation}
                  onSelect={() => setSponsor(sp.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
