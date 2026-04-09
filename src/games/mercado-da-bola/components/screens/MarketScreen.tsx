import React, { useState, useMemo } from 'react';
import { useMB } from '../../store/gameStore';
import PlayerCard from '../ui/PlayerCard';
import StatBar from '../ui/StatBar';
import RatingBadge from '../ui/RatingBadge';
import MoneyDisplay from '../ui/MoneyDisplay';
import { POSITION_COLORS, POSITION_VARIANT } from '../ui/PlayerCard';
import type { Player, Position, TransferOffer } from '../../types';
import { getTeam } from '../../data/teams';
import TeamBadge from '../ui/TeamBadge';
import { cn } from '../../../../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../../components/ui/dialog';
import { Search, ShoppingCart, DollarSign, Users, TrendingUp, Star, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

// ─── Incoming Offer Card ─────────────────────────────────────────────────────

function IncomingOfferCard({ offer }: { offer: TransferOffer }) {
  const { state, acceptOffer, rejectOffer } = useMB();
  const save = state.save!;
  const targetPlayer = save.mySquad.find(p => p.id === offer.playerId);
  const fromTeam = getTeam(offer.fromTeamId);

  if (!targetPlayer || offer.status !== 'pending') return null;

  return (
    <div style={{
      background: '#1e293b', borderRadius: 14,
      border: '1px solid rgba(234,179,8,0.3)',
      overflow: 'hidden',
    }}>
      {/* Alert bar */}
      <div style={{
        background: 'rgba(234,179,8,0.1)', padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(234,179,8,0.2)',
      }}>
        <AlertCircle size={13} color="#eab308" />
        <span style={{ fontSize: 11, fontWeight: 800, color: '#eab308' }}>
          PROPOSTA RECEBIDA
        </span>
        <span style={{ fontSize: 10, color: '#64748b', marginLeft: 'auto' }}>
          Rodada {offer.round}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Teams */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {fromTeam && <TeamBadge team={fromTeam} size={32} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f1f5f9' }}>
              {fromTeam?.name ?? offer.fromTeamId}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>quer contratar:</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fde68a' }}>
              ${new Intl.NumberFormat('pt-BR').format(offer.offerAmount)}k
            </div>
          </div>
        </div>

        {/* Player target */}
        <div style={{
          background: '#0f172a', borderRadius: 10, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid #334155',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: (POSITION_COLORS[targetPlayer.position] ?? '#94a3b8') + '22',
            border: `1px solid ${(POSITION_COLORS[targetPlayer.position] ?? '#94a3b8')}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 900, color: POSITION_COLORS[targetPlayer.position] ?? '#94a3b8',
          }}>
            {targetPlayer.position}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {targetPlayer.flag} {targetPlayer.name}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              {'★'.repeat(targetPlayer.stars)} · {targetPlayer.age} anos
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, color: '#64748b' }}>
            <div>Val. mercado</div>
            <div style={{ color: '#94a3b8', fontWeight: 700 }}>${new Intl.NumberFormat('pt-BR').format(targetPlayer.marketValue)}k</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => rejectOffer(offer.id)}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)', color: '#f87171', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <XCircle size={14} /> Recusar
          </button>
          <button
            onClick={() => acceptOffer(offer.id)}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)',
              background: 'rgba(16,185,129,0.08)', color: '#10b981', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <CheckCircle size={14} /> Aceitar ${new Intl.NumberFormat('pt-BR').format(offer.offerAmount)}k
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketScreen() {
  const { state, buyPlayer, sellPlayer } = useMB();
  const { save } = state;

  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [starFilter, setStarFilter] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'price' | 'age'>('stars');
  const [preview, setPreview] = useState<{ player: Player; price: number; action: 'buy' | 'sell' } | null>(null);

  if (!save) return null;

  const mySquadIds = new Set(save.mySquad.map(p => p.id));

  const marketPlayers = useMemo(
    () => save.allPlayers.filter(p => !mySquadIds.has(p.id)),
    [save.allPlayers, save.mySquad.length]
  );

  const filterPlayers = (players: Player[]) =>
    players
      .filter(p => posFilter === 'ALL' || p.position === posFilter)
      .filter(p => starFilter === 0 || p.stars === starFilter)
      .filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.nationality.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stars - a.stars;
        if (sortBy === 'price') return a.marketValue - b.marketValue;
        return a.age - b.age;
      });

  const handleAction = (player: Player, action: 'buy' | 'sell') => {
    const price = action === 'buy' ? Math.round(player.marketValue * 1.1) : Math.round(player.marketValue * 0.8);
    setPreview({ player, price, action });
  };

  const executeAction = () => {
    if (!preview) return;
    if (preview.action === 'buy') buyPlayer(preview.player, preview.price);
    else sellPlayer(preview.player.id, preview.price, 'Mercado Livre');
    setPreview(null);
  };

  function PlayerList({ tab }: { tab: 'buy' | 'sell' }) {
    const base = tab === 'buy' ? marketPlayers : save.mySquad;
    const displayed = filterPlayers(base);

    if (displayed.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Users size={32} className="text-slate-600" />
          <p className="text-sm text-slate-500">Nenhum jogador encontrado</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 mt-3">
        {displayed.map(player => {
          const price = tab === 'buy' ? Math.round(player.marketValue * 1.1) : Math.round(player.marketValue * 0.8);
          const canAfford = tab === 'sell' || save.budget >= price;
          return (
            <PlayerCard
              key={player.id}
              player={player}
              compact
              showPrice
              price={price}
              actionLabel={tab === 'buy' ? 'Contratar' : 'Vender'}
              actionDisabled={!canAfford}
              onAction={() => handleAction(player, tab)}
              onClick={() => handleAction(player, tab)}
            />
          );
        })}
      </div>
    );
  }

  const previewAttrs = preview?.player.attributes;
  const previewAttrList: [string, number, string][] = preview
    ? preview.player.position === 'GK'
      ? [['GK', previewAttrs?.goalkeeping ?? 0, '#f59e0b'], ['DEF', previewAttrs?.defending ?? 0, '#3b82f6'], ['FÍS', previewAttrs?.physical ?? 0, '#8b5cf6']]
      : [['RIT', previewAttrs?.pace ?? 0, '#ef4444'], ['FIN', previewAttrs?.shooting ?? 0, '#f59e0b'], ['PAS', previewAttrs?.passing ?? 0, '#10b981'],
         ['DRI', previewAttrs?.dribbling ?? 0, '#8b5cf6'], ['DEF', previewAttrs?.defending ?? 0, '#3b82f6']]
    : [];

  const pendingOffers = save.pendingOffers.filter(o => o.status === 'pending');

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">

      {/* ── Incoming offers ── */}
      {pendingOffers.length > 0 && (
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 mb-2 flex items-center gap-2">
            <AlertCircle size={11} className="text-amber-500" />
            Propostas Recebidas ({pendingOffers.length})
          </div>
          <div className="flex flex-col gap-2">
            {pendingOffers.map(offer => (
              <IncomingOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-slate-100">Mercado</h2>
            <p className="text-xs text-slate-500">
              Elenco: {save.mySquad.length} · Disponíveis: {marketPlayers.length}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <DollarSign size={13} className="text-amber-400" />
            <span className="text-sm font-black text-amber-400">${fmt(save.budget)}k</span>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar jogador ou país..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={14} />}
          className="mb-3"
        />

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={posFilter}
            onChange={e => setPosFilter(e.target.value as Position | 'ALL')}
          >
            <option value="ALL">Todas posições</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select
            value={starFilter}
            onChange={e => setStarFilter(Number(e.target.value))}
          >
            <option value={0}>Todas ★</option>
            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{'★'.repeat(s)}</option>)}
          </Select>
          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'stars' | 'price' | 'age')}
          >
            <option value="stars">Por Estrelas</option>
            <option value="price">Por Preço</option>
            <option value="age">Por Idade</option>
          </Select>
        </div>
      </Card>

      {/* ── Tabs ── */}
      <Tabs defaultValue="buy">
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">
            <ShoppingCart size={13} /> Comprar
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">
            <DollarSign size={13} /> Vender
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buy"><PlayerList tab="buy" /></TabsContent>
        <TabsContent value="sell"><PlayerList tab="sell" /></TabsContent>
      </Tabs>

      {/* ── Player preview dialog ── */}
      {preview && (
        <Dialog open={true} onOpenChange={() => setPreview(null)}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {preview.action === 'buy' ? 'Contratar Jogador' : 'Vender Jogador'}
              </DialogTitle>
            </DialogHeader>
            <DialogClose onClose={() => setPreview(null)} />

            {/* Player card preview */}
            <div className={cn(
              'relative rounded-xl border p-4 mb-4',
              preview.player.rarity === 'legendary'
                ? 'border-amber-600/50 bg-gradient-to-br from-amber-950/60 to-slate-800'
                : 'border-slate-700 bg-slate-900'
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                  style={{
                    background: (POSITION_COLORS[preview.player.position] ?? '#94a3b8') + '22',
                    border: `2px solid ${(POSITION_COLORS[preview.player.position] ?? '#94a3b8')}44`,
                    color: POSITION_COLORS[preview.player.position] ?? '#94a3b8',
                  }}
                >
                  {preview.player.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-slate-100 truncate">{preview.player.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={POSITION_VARIANT[preview.player.position] ?? 'secondary'}>
                      {preview.player.position}
                    </Badge>
                    <RatingBadge rating={preview.player.stars} size={11} />
                  </div>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-2 mb-3">
                {previewAttrList.map(([lbl, val, col]) => (
                  <StatBar key={lbl} label={lbl} value={val} color={col} />
                ))}
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>{preview.player.nationality} · {preview.player.age} anos</span>
                <span>Nível {preview.player.level}</span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 mb-4 text-center">
              <p className="text-2xl font-black text-amber-400 mb-1">
                ${fmt(preview.price)}k
              </p>
              <p className="text-xs text-slate-500">
                {preview.action === 'buy'
                  ? `Orçamento restante: $${fmt(save.budget - preview.price)}k`
                  : `Após venda: $${fmt(save.budget + preview.price)}k`}
              </p>
              {preview.action === 'buy' && save.budget < preview.price && (
                <p className="mt-2 text-xs font-bold text-red-400">Orçamento insuficiente!</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-transparent py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                disabled={preview.action === 'buy' && save.budget < preview.price}
                className={cn(
                  'flex-1 rounded-xl py-3 text-sm font-black text-white transition-colors',
                  preview.action === 'buy'
                    ? 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500'
                    : 'bg-red-600 hover:bg-red-500'
                )}
              >
                {preview.action === 'buy' ? 'Contratar!' : 'Vender!'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
