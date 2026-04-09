import React, { useState, useMemo } from 'react';
import { useMB } from '../../store/gameStore';
import PlayerCard from '../ui/PlayerCard';
import type { Player, Position } from '../../types';

const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];

export default function MarketScreen() {
  const { state, buyPlayer, sellPlayer } = useMB();
  const { save } = state;
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [starFilter, setStarFilter] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'price' | 'age'>('stars');
  const [confirm, setConfirm] = useState<{ player: Player; price: number; action: 'buy' | 'sell' } | null>(null);

  if (!save) return null;

  const mySquadIds = new Set(save.mySquad.map(p => p.id));

  const marketPlayers = useMemo(() => {
    return save.allPlayers.filter(p => !mySquadIds.has(p.id));
  }, [save.allPlayers, save.mySquad.length]);

  const filterPlayers = (players: Player[]) => {
    return players
      .filter(p => posFilter === 'ALL' || p.position === posFilter)
      .filter(p => starFilter === 0 || p.stars === starFilter)
      .filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.nationality.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stars - a.stars;
        if (sortBy === 'price') return a.marketValue - b.marketValue;
        return a.age - b.age;
      });
  };

  const displayed = tab === 'buy' ? filterPlayers(marketPlayers) : filterPlayers(save.mySquad);

  const handleBuy = (player: Player) => {
    const price = Math.round(player.marketValue * 1.1);
    setConfirm({ player, price, action: 'buy' });
  };

  const handleSell = (player: Player) => {
    const price = Math.round(player.marketValue * 0.8);
    setConfirm({ player, price, action: 'sell' });
  };

  const executeAction = () => {
    if (!confirm) return;
    if (confirm.action === 'buy') {
      buyPlayer(confirm.player, confirm.price);
    } else {
      sellPlayer(confirm.player.id, confirm.price, 'Mercado Livre');
    }
    setConfirm(null);
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>🔄 Mercado</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Elenco: {save.mySquad.length} · Disponíveis: {marketPlayers.length}
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fde68a' }}>
          💰 ${save.budget.toLocaleString('pt-BR')}k
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {(['buy', 'sell'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: tab === t ? '#2563eb' : '#1e293b',
            color: tab === t ? '#fff' : '#94a3b8',
            fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-body)',
          }}>
            {t === 'buy' ? '🛒 Comprar' : '💸 Vender'}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Buscar jogador ou país..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
          padding: '10px 14px', color: '#f1f5f9', fontSize: 13,
          fontFamily: 'var(--font-body)', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <select value={posFilter} onChange={e => setPosFilter(e.target.value as Position | 'ALL')}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', padding: '6px 10px', fontSize: 12, fontFamily: 'var(--font-body)', flexShrink: 0 }}>
          <option value="ALL">Todas posições</option>
          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={starFilter} onChange={e => setStarFilter(Number(e.target.value))}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', padding: '6px 10px', fontSize: 12, fontFamily: 'var(--font-body)', flexShrink: 0 }}>
          <option value={0}>Todas estrelas</option>
          {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{'★'.repeat(s)}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'stars' | 'price' | 'age')}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', padding: '6px 10px', fontSize: 12, fontFamily: 'var(--font-body)', flexShrink: 0 }}>
          <option value="stars">Por Estrelas</option>
          <option value="price">Por Preço</option>
          <option value="age">Por Idade</option>
        </select>
      </div>

      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 32, fontSize: 13 }}>
          Nenhum jogador encontrado
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                onAction={() => tab === 'buy' ? handleBuy(player) : handleSell(player)}
              />
            );
          })}
        </div>
      )}

      {confirm && (
        <div onClick={() => setConfirm(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 16,
            padding: 24, maxWidth: 340, width: '100%',
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9', marginBottom: 12 }}>
              {confirm.action === 'buy' ? '🛒 Confirmar Contratação' : '💸 Confirmar Venda'}
            </div>
            <PlayerCard player={confirm.player} compact />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fde68a' }}>
                ${confirm.price.toLocaleString('pt-BR')}k
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {confirm.action === 'buy'
                  ? `Restante: $${(save.budget - confirm.price).toLocaleString('pt-BR')}k`
                  : `Após venda: $${(save.budget + confirm.price).toLocaleString('pt-BR')}k`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setConfirm(null)} style={{
                flex: 1, padding: 12, borderRadius: 10, border: '1px solid #334155',
                background: '#0f172a', color: '#94a3b8', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>Cancelar</button>
              <button onClick={executeAction} style={{
                flex: 1, padding: 12, borderRadius: 10, border: 'none',
                background: confirm.action === 'buy' ? '#2563eb' : '#dc2626',
                color: '#fff', fontWeight: 800, fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                {confirm.action === 'buy' ? 'Contratar!' : 'Vender!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
