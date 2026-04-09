import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import { cn } from '../../../../lib/utils';
import StatBar from '../ui/StatBar';
import RatingBadge from '../ui/RatingBadge';
import MoneyDisplay from '../ui/MoneyDisplay';
import { MoodBadge, POSITION_COLORS, POSITION_VARIANT } from '../ui/PlayerCard';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Progress } from '../../../../components/ui/progress';
import { Card } from '../../../../components/ui/card';
import { AlertDialog } from '../../../../components/ui/dialog';
import { Tooltip } from '../../../../components/ui/tooltip';
import {
  ChevronRight, TrendingUp, BarChart2, Dumbbell,
  DollarSign, AlertTriangle, Calendar, Hash, Star, Crown,
  Flame, Smile, Frown, Meh, Home, Shield,
} from 'lucide-react';

const LIFESTYLE_LABEL: Record<string, string> = {
  poor: 'Humilde', modest: 'Modesto', comfortable: 'Confortável',
  luxury: 'Luxo', superstar: 'Superestrela',
};
const LIFESTYLE_ICON: Record<string, typeof Home> = {
  poor: Home, modest: Home, comfortable: Crown, luxury: Crown, superstar: Crown,
};

const ATTR_FULL: Record<string, string> = {
  RIT: 'Ritmo', FIN: 'Finalização', PAS: 'Passe', DRI: 'Drible',
  DEF: 'Defesa', FÍS: 'Físico', GOL: 'Goleiro',
};

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerDetailScreen() {
  const { state, selectPlayer, trainPlayer, sellPlayer } = useMB();
  const { save, selectedPlayerId } = state;
  const [sellConfirm, setSellConfirm] = useState(false);

  if (!save || !selectedPlayerId) return null;
  const player = save.mySquad.find(p => p.id === selectedPlayerId);
  if (!player) return null;

  const posColor   = POSITION_COLORS[player.position] ?? '#94a3b8';
  const posVariant = POSITION_VARIANT[player.position] ?? 'secondary';
  const isLegendary = player.rarity === 'legendary';

  const xpInLevel  = player.xp % 500;
  const xpProgress = xpInLevel / 500;
  const xpToNext   = 500 - xpInLevel;
  const trainCost  = 50 * player.level;
  const canTrain   = save.budget >= trainCost && player.level < 10;

  const attrs = player.attributes;
  const attrList: [string, string, number, string][] = player.position === 'GK'
    ? [['GOL', 'Goleiro',      attrs.goalkeeping ?? 60, '#f59e0b'],
       ['DEF', 'Defesa',       attrs.defending,         '#3b82f6'],
       ['FÍS', 'Físico',       attrs.physical,          '#8b5cf6'],
       ['PAS', 'Passe',        attrs.passing,           '#10b981']]
    : [['RIT', 'Ritmo',        attrs.pace,              '#ef4444'],
       ['FIN', 'Finalização',  attrs.shooting,          '#f59e0b'],
       ['PAS', 'Passe',        attrs.passing,           '#10b981'],
       ['DRI', 'Drible',       attrs.dribbling,         '#8b5cf6'],
       ['DEF', 'Defesa',       attrs.defending,         '#3b82f6'],
       ['FÍS', 'Físico',       attrs.physical,          '#64748b']];

  const sellPrice = Math.round(player.marketValue * 0.8);

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1 text-xs text-slate-500">
        <button onClick={() => selectPlayer(null)} className="flex items-center gap-1 hover:text-slate-300 transition-colors font-semibold">
          <Shield size={12} />
          Elenco
        </button>
        <ChevronRight size={12} />
        <span className="text-slate-300 font-bold truncate">{player.name}</span>
      </nav>

      {/* ── Player hero card ── */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-5',
          isLegendary
            ? 'border-amber-600/50 bg-gradient-to-br from-amber-950/70 to-slate-800'
            : 'border-slate-700 bg-gradient-to-br from-slate-800 to-[#0f172a]'
        )}
      >
        {isLegendary && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(217,119,6,0.2),transparent_70%)] pointer-events-none" />
        )}
        <div className="flex items-center gap-4 mb-4">
          {/* Big avatar */}
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black"
            style={{
              background: isLegendary ? 'linear-gradient(135deg, #d97706, #92400e)' : posColor + '22',
              border: `2px solid ${isLegendary ? '#d97706' : posColor + '55'}`,
              color: isLegendary ? '#fff' : posColor,
            }}
          >
            {getInitials(player.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-100 leading-tight">
              {player.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{player.fullName}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              <Badge variant={posVariant} className="text-xs px-2 py-0.5">{player.position}</Badge>
              <RatingBadge rating={player.stars} size={13} />
              {isLegendary && <Badge variant="legendary">LENDÁRIO</Badge>}
              {player.injured && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle size={9} /> Lesionado
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Calendar,   label: 'Idade',   value: `${player.age}a` },
            { icon: TrendingUp, label: 'Nível',   value: `Nv.${player.level}` },
            { icon: DollarSign, label: 'Valor',   value: `$${player.marketValue}k` },
            { icon: Hash,       label: 'Salário', value: `$${player.wage}k/s` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-[#0f172a] p-3">
              <Icon size={13} className="text-slate-500" />
              <span className="text-xs font-black text-slate-100">{value}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── XP / Evolution ── */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-purple-400" />
          <span className="text-sm font-black text-slate-100">Evolução</span>
          <span className="ml-auto text-xs text-slate-500">
            {player.level < 10 ? `${xpToNext} XP para nível ${player.level + 1}` : 'Nível MÁXIMO'}
          </span>
        </div>
        <Progress
          value={player.level < 10 ? xpProgress * 100 : 100}
          color="linear-gradient(90deg, #7c3aed, #a855f7)"
          className="h-3"
        />
        <div className="flex justify-between mt-2 text-[10px] text-slate-500">
          <span>XP: {player.xp}</span>
          <span>Nível {player.level} / 10</span>
        </div>
      </Card>

      {/* ── Attributes ── */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={15} className="text-blue-400" />
          <span className="text-sm font-black text-slate-100">Atributos</span>
        </div>
        <div className="flex flex-col gap-3">
          {attrList.map(([short, full, val, col]) => (
            <StatBar key={short} label={short} fullLabel={full} value={val} color={col} />
          ))}
        </div>
      </Card>

      {/* ── Mood + Lifestyle ── */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">HUMOR</p>
          <MoodBadge mood={player.mood} />
          <div className="mt-3 space-y-1">
            <Progress
              value={player.moodPoints}
              color={
                player.mood === 'motivated' ? '#22c55e' :
                player.mood === 'happy'     ? '#3b82f6' :
                player.mood === 'neutral'   ? '#eab308' : '#ef4444'
              }
            />
            <p className="text-[10px] text-slate-500">{player.moodPoints}/100</p>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">ESTILO</p>
          {(() => {
            const Icon = LIFESTYLE_ICON[player.lifestyle] ?? Home;
            return (
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-amber-400 shrink-0" />
                <span className="text-sm font-bold text-slate-100">
                  {LIFESTYLE_LABEL[player.lifestyle] ?? player.lifestyle}
                </span>
              </div>
            );
          })()}
          <p className="text-xs text-red-400 mt-2">-${player.lifestyleExpenses}k/mês</p>
        </Card>
      </div>

      {/* ── Legendary card info ── */}
      {isLegendary && player.legendaryCard && (
        <div className="rounded-2xl border border-amber-600/50 bg-gradient-to-br from-amber-950/60 to-slate-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              CARTA LENDÁRIA · {player.legendaryCard.visual.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-amber-100 italic mb-3">"{player.legendaryCard.lore}"</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="warning">Era: {player.legendaryCard.era}</Badge>
            <Badge variant="success">
              +{Math.round((player.legendaryCard.boostMultiplier - 1) * 100)}% atributos
            </Badge>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <Tooltip content={canTrain ? `Custa $${trainCost}k · +200 XP` : 'Sem orçamento ou nível máximo'}>
          <Button
            variant="default"
            size="lg"
            className="flex-1 flex-col h-auto py-3 gap-1"
            disabled={!canTrain}
            onClick={() => { if (canTrain) trainPlayer(player.id, trainCost); }}
          >
            <Dumbbell size={16} />
            <span>Treino Extra</span>
            <span className="text-[10px] font-semibold opacity-75">+200 XP · ${trainCost}k</span>
          </Button>
        </Tooltip>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 flex-col h-auto py-3 gap-1 border-red-700/50 text-red-400 hover:bg-red-600/10"
          onClick={() => setSellConfirm(true)}
        >
          <DollarSign size={16} />
          <span>Vender</span>
          <MoneyDisplay amount={sellPrice} size="sm" className="opacity-75" />
        </Button>
      </div>

      {/* ── Sell confirmation ── */}
      <AlertDialog
        open={sellConfirm}
        onOpenChange={setSellConfirm}
        title={`Vender ${player.name}?`}
        description={`Você receberá $${sellPrice}k pela venda. Esta ação não pode ser desfeita.`}
        confirmLabel="Vender!"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={() => {
          sellPlayer(player.id, sellPrice, 'Mercado Livre');
          selectPlayer(null);
        }}
      />
    </div>
  );
}
