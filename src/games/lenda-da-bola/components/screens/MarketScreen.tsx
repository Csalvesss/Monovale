import React, { useState, useMemo } from 'react';
import { Search, X, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSquadStore } from '../../store/squadStore';
import { GENERIC_PLAYERS, LEGENDARY_PLAYERS } from '../../data/players';
import PlayerCard from '../ui/PlayerCard';
import type { Player } from '../../types/game';

type BuyState = 'idle' | 'confirming' | 'buying' | 'success' | 'error';

const ALL_MARKET_PLAYERS = [...LEGENDARY_PLAYERS.slice(0, 5), ...GENERIC_PLAYERS.slice(15, 40)];

function BuyModal({ player, budget, onConfirm, onClose }: {
  player: Player; budget: number; onConfirm: () => void; onClose: () => void;
}) {
  const [state, setState] = useState<BuyState>('confirming');
  const canAfford = budget >= player.marketValue;

  function handleBuy() {
    setState('buying');
    setTimeout(() => {
      if (canAfford) {
        onConfirm();
        setState('success');
      } else {
        setState('error');
      }
    }, 2000);
  }

  function handleClose() {
    if (state === 'buying') return;
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(2,6,23,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        padding: 20,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 360,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--r-lg)',
          padding: '28px 24px',
          animation: 'lenda-pop-in 0.35s var(--ease-out)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}
        onClick={e => e.stopPropagation()}
      >
        {state === 'success' ? (
          <>
            <CheckCircle size={48} style={{ color: '#22c55e' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.08em', color: '#22c55e' }}>
              CONTRATADO!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
              {player.name} foi adicionado ao seu banco.
            </div>
            <button className="lenda-btn-gold" style={{ width: '100%', padding: '12px', fontSize: 18, borderRadius: 'var(--r-md)' }} onClick={onClose}>
              OK
            </button>
          </>
        ) : state === 'error' ? (
          <>
            <AlertCircle size={48} style={{ color: '#ef4444' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.08em', color: '#ef4444' }}>
              SEM VERBA
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
              Orçamento insuficiente para contratar {player.name}.
            </div>
            <button className="lenda-btn-ghost" style={{ width: '100%', padding: '12px', fontSize: 14, borderRadius: 'var(--r-md)' }} onClick={onClose}>
              Fechar
            </button>
          </>
        ) : (
          <>
            <PlayerCard player={player} size="md" />

            {/* Value comparison */}
            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-md)',
              padding: '12px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Valor do jogador</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-primary)' }}>
                  €{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(player.marketValue)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Seu orçamento</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 16,
                  color: canAfford ? '#22c55e' : '#ef4444',
                }}>
                  €{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(budget)}
                </span>
              </div>
              {!canAfford && (
                <div style={{
                  marginTop: 8, fontSize: 11, color: '#ef4444',
                  padding: '6px 10px',
                  background: 'rgba(239,68,68,0.1)',
                  borderRadius: 6,
                }}>
                  ⚠️ Orçamento insuficiente
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button className="lenda-btn-ghost" style={{ flex: 1, padding: '12px', fontSize: 14, borderRadius: 'var(--r-md)' }} onClick={onClose}>
                Cancelar
              </button>
              <button
                onClick={handleBuy}
                disabled={state === 'buying'}
                className="lenda-btn-gold"
                style={{
                  flex: 2, padding: '12px', fontSize: 18,
                  borderRadius: 'var(--r-md)',
                  opacity: state === 'buying' ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {state === 'buying' ? (
                  <><div className="lenda-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />CONTRATANDO...</>
                ) : (
                  <><ShoppingCart size={16} /> CONTRATAR</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MarketScreen() {
  const { budget, setGameData } = useGameStore();
  const { players: squadPlayers, addPlayer } = useSquadStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'legendary' | 'rare' | 'common'>('all');
  const [buying, setBuying] = useState<Player | null>(null);

  const available = useMemo(() => {
    return ALL_MARKET_PLAYERS.filter(p => {
      if (squadPlayers[p.id]) return false; // already in squad
      if (filter !== 'all' && p.rarity !== filter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.nationality.toLowerCase().includes(search.toLowerCase()) &&
          !p.position.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filter, squadPlayers]);

  function handleBuy(player: Player) {
    addPlayer(player);
    setGameData({ budget: budget - player.marketValue });
    setBuying(null);
  }

  const budgetStr = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(budget);

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="lenda-section-title" style={{ marginBottom: 0 }}>MERCADO DE JOGADORES</div>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--r-pill)',
          fontFamily: 'var(--font-display)',
          fontSize: 16, color: 'var(--wc-gold)',
          letterSpacing: '0.05em',
        }}>
          €{budgetStr}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="lenda-input"
          placeholder="Buscar por nome, nação ou posição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
          }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['all', 'legendary', 'rare', 'common'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              background: filter === f ? 'var(--wc-gold)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#000' : 'var(--text-muted)',
              border: `1px solid ${filter === f ? 'var(--wc-gold)' : 'var(--border-default)'}`,
              borderRadius: 'var(--r-pill)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {f === 'all' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {available.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: 14, paddingTop: 40,
        }}>
          Nenhum jogador encontrado.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
          gap: 12,
        }}>
          {available.map((p, i) => (
            <div
              key={p.id}
              className="lenda-anim-fade-up"
              style={{ animationDelay: `${i * 30}ms`, display: 'flex', justifyContent: 'center' }}
            >
              <PlayerCard
                player={p}
                size="sm"
                onClick={() => setBuying(p)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Buy modal */}
      {buying && (
        <BuyModal
          player={buying}
          budget={budget}
          onConfirm={() => handleBuy(buying)}
          onClose={() => setBuying(null)}
        />
      )}
    </div>
  );
}
