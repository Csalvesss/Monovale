import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import { STADIUM_UPGRADE_COSTS } from '../../constants';
import type { StadiumUpgrade } from '../../types';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { Slider } from '../../../../components/ui/slider';
import { AlertDialog } from '../../../../components/ui/dialog';
import {
  Building2, Crown, Dumbbell, GraduationCap, Tv,
  Users, DollarSign, ArrowUp, CheckCircle, Shirt,
  Ticket,
} from 'lucide-react';

// ─── Upgrade config ───────────────────────────────────────────────────────────

interface UpgradeConfig {
  type: StadiumUpgrade;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  statKey: 'capacity' | 'vipSections' | 'trainingLevel' | 'academyLevel' | 'mediaLevel';
}

const UPGRADES: UpgradeConfig[] = [
  { type: 'capacity', label: 'Capacidade',   icon: Building2,     description: 'Mais torcedores, mais renda por partida', statKey: 'capacity' },
  { type: 'vip',      label: 'Camarotes VIP', icon: Crown,         description: 'Renda extra com camarotes exclusivos',   statKey: 'vipSections' },
  { type: 'training', label: 'Treinamento',  icon: Dumbbell,      description: 'Centro de treino: +XP por partida',      statKey: 'trainingLevel' },
  { type: 'academy',  label: 'Academia',     icon: GraduationCap, description: 'Base de formação: jovens de maior nível', statKey: 'academyLevel' },
  { type: 'media',    label: 'Mídia',        icon: Tv,            description: 'Mais visibilidade e seguidores',         statKey: 'mediaLevel' },
];

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

// ─── Upgrade card ─────────────────────────────────────────────────────────────

function UpgradeCard({
  config, currentLevel, budget, onUpgrade,
}: {
  config: UpgradeConfig; currentLevel: number; budget: number; onUpgrade: (t: StadiumUpgrade) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isMaxed   = currentLevel >= 5;
  const cost      = isMaxed ? 0 : (STADIUM_UPGRADE_COSTS[config.type]?.[currentLevel] ?? 9999);
  const canAfford = budget >= cost;
  const Icon      = config.icon;

  return (
    <>
      <div className={cn(
        'flex flex-col gap-4 rounded-xl border p-4 transition-colors',
        isMaxed ? 'border-emerald-600/30 bg-emerald-600/5' : 'border-slate-700 bg-slate-800'
      )}>
        {/* Top row */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-700">
            <Icon size={18} className={isMaxed ? 'text-emerald-400' : 'text-blue-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-black text-slate-100">{config.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
          </div>
          <Badge variant={isMaxed ? 'success' : 'secondary'} className="shrink-0">
            {isMaxed ? 'MAX' : `Nv. ${currentLevel}`}
          </Badge>
        </div>

        {/* Level dots + bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-colors',
                    i < currentLevel ? 'bg-blue-500' : 'bg-slate-700'
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500">{currentLevel}/5</span>
          </div>
          <Progress value={(currentLevel / 5) * 100}
            color={currentLevel >= 4 ? '#22c55e' : currentLevel >= 2 ? '#f59e0b' : '#3b82f6'}
          />
        </div>

        {/* Cost + button */}
        {!isMaxed && (
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('text-[15px] font-black', canAfford ? 'text-amber-400' : 'text-red-400')}>
                ${fmt(cost)}k
              </p>
              <p className="text-[10px] text-slate-500">custo de melhoria</p>
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canAfford}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-black transition-all',
                canAfford
                  ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98]'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              )}
            >
              <ArrowUp size={14} />
              Melhorar
            </button>
          </div>
        )}
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Melhorar ${config.label}?`}
        description={`Isso custará $${fmt(cost)}k do seu orçamento.`}
        confirmLabel="Confirmar"
        onConfirm={() => onUpgrade(config.type)}
      />
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StadiumScreen() {
  const { state, upgradeStadium, dispatch } = useMB();
  const { save } = state;

  if (!save) return null;

  const { stadium, budget } = save;

  const estimatedMatchIncome = Math.round(stadium.capacity * 0.7 * stadium.ticketPrice * 0.001);
  const weeklyWages          = save.mySquad.reduce((sum, p) => sum + p.wage, 0);
  const balance              = estimatedMatchIncome - weeklyWages;

  const [ticketPrice, setTicketPrice] = useState(stadium.ticketPrice);

  function handleTicketChange(val: number) {
    setTicketPrice(val);
    dispatch({ type: 'UPDATE_SAVE', save: { ...save, stadium: { ...stadium, ticketPrice: val } } });
  }

  const sliderIncome = Math.round(stadium.capacity * 0.7 * ticketPrice * 0.001);

  return (
    <div className="flex flex-col gap-5 p-4 pb-8 bg-[#0f172a] min-h-full">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-700/40 bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] p-5 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-600/30">
            <Building2 size={32} className="text-blue-400" />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-100" style={{ fontFamily: 'var(--font-title)' }}>
          {stadium.name}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Users size={13} className="text-slate-400" />
          <span className="text-sm text-slate-400">
            Capacidade: <strong className="text-blue-400">{fmt(stadium.capacity)}</strong>
          </span>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600/10 border border-emerald-600/20 px-5 py-2.5">
          <DollarSign size={14} className="text-emerald-400" />
          <span className="text-lg font-black text-emerald-400">${fmt(estimatedMatchIncome)}k</span>
          <span className="text-xs text-slate-500">por partida</span>
        </div>
      </div>

      {/* ── Ticket slider ── */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Ticket size={15} className="text-amber-400" />
          <p className="text-sm font-black text-slate-100">Preço do Ingresso</p>
        </div>
        <Slider
          min={50} max={500} step={10}
          value={ticketPrice}
          onValueChange={handleTicketChange}
          minLabel="$50k (mais público)"
          maxLabel="$500k (mais renda)"
        />
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2.5">
          <span className="text-xs text-slate-400">Público estimado</span>
          <span className="text-xs font-bold text-blue-400">
            {fmt(Math.round(stadium.capacity * 0.7))} → ${fmt(sliderIncome)}k
          </span>
        </div>
      </Card>

      {/* ── Upgrades ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Melhorias do Estádio</p>
        <div className="flex flex-col gap-3">
          {UPGRADES.map(cfg => {
            const currentLevel = (stadium as Record<string, number>)[cfg.statKey] as number ?? 0;
            return (
              <UpgradeCard
                key={cfg.type}
                config={cfg}
                currentLevel={currentLevel}
                budget={budget}
                onUpgrade={upgradeStadium}
              />
            );
          })}
        </div>
      </div>

      {/* ── Financial summary ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Resumo Financeiro</p>
        <Card className="p-4 space-y-3">
          {[
            { icon: Shirt,    label: 'Salários semanais', sub: `${save.mySquad.length} jogadores`, value: -weeklyWages,           color: 'text-red-400' },
            { icon: Ticket,   label: 'Receita por partida', sub: 'bilheteria + camarotes',         value: estimatedMatchIncome,  color: 'text-emerald-400' },
          ].map(({ icon: Icon, label, sub, value, color }) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-3">
              <div className="flex items-center gap-3">
                <Icon size={15} className="text-slate-500 shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-slate-200">{label}</p>
                  <p className="text-[10px] text-slate-500">{sub}</p>
                </div>
              </div>
              <span className={cn('text-sm font-black', color)}>
                {value >= 0 ? '+' : ''}${fmt(Math.abs(value))}k
              </span>
            </div>
          ))}

          {/* Balance */}
          <div className={cn(
            'flex items-center justify-between rounded-xl border px-3 py-3',
            balance >= 0 ? 'border-emerald-600/30 bg-emerald-600/10' : 'border-red-600/30 bg-red-600/10'
          )}>
            <span className="text-sm font-bold text-slate-400">Saldo estimado / semana</span>
            <span className={cn('text-[15px] font-black', balance >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {balance >= 0 ? '+' : ''}${fmt(Math.abs(balance))}k
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
