import React, { useState, useMemo } from 'react';
import { useMB } from '../../store/gameStore';
import type { Player, Position, TransferOffer } from '../../types';
import { getTeam } from '../../data/teams';
import {
  Search, Star, DollarSign, ShoppingCart, X,
  AlertCircle, CheckCircle, XCircle, TrendingUp, ArrowLeftRight,
} from 'lucide-react';

const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

// ─── Incoming offer card ──────────────────────────────────────────────────────

function IncomingOfferCard({ offer }: { offer: TransferOffer }) {
  const { state, acceptOffer, rejectOffer } = useMB();
  const save = state.save!;
  const target = save.mySquad.find(p => p.id === offer.playerId);
  const fromTeam = getTeam(offer.fromTeamId);

  if (!target || offer.status !== 'pending') return null;

  return (
    <div style={{
      background: 'var(--ldb-surface)',
      border: '1px solid rgba(255,215,0,0.25)',
      borderRadius: 'var(--ldb-r-lg)',
      overflow: 'hidden',
    }}>
      {/* Alert header */}
      <div style={{
        background: 'rgba(255,215,0,0.08)', padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(255,215,0,0.15)',
      }}>
        <AlertCircle size={12} style={{ color: 'var(--ldb-draw)' }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ldb-draw)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Proposta Recebida
        </span>
        <span style={{ fontSize: 10, color: 'var(--ldb-text-muted)', marginLeft: 'auto' }}>Rd.{offer.round}</span>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* From team */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{fromTeam?.badge ?? '⚽'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ldb-text)' }}>{fromTeam?.name ?? offer.fromTeamId}</div>
            <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>quer contratar</div>
          </div>
          <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 18, color: 'var(--ldb-gold-bright)', letterSpacing: '0.04em' }}>
            ${fmt(offer.offerAmount)}k
          </div>
        </div>

        {/* Target player */}
        <div style={{
          background: 'var(--ldb-elevated)', borderRadius: 'var(--ldb-r-md)',
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid var(--ldb-border)',
        }}>
          <span style={{ fontSize: 18 }}>{target.flag}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ldb-text)' }}>{target.name}</div>
            <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>{target.position} · {'★'.repeat(target.stars)}</div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)', textAlign: 'right' }}>
            <div>Val. mercado</div>
            <div style={{ color: 'var(--ldb-text-mid)', fontWeight: 700 }}>${fmt(target.marketValue)}k</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => rejectOffer(offer.id)}
            style={{
              flex: 1, padding: '10px', borderRadius: 'var(--ldb-r-md)',
              border: '1px solid rgba(255,85,85,0.25)', background: 'rgba(255,85,85,0.08)',
              color: 'var(--ldb-loss)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--ldb-font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <XCircle size={13} /> Recusar
          </button>
          <button
            onClick={() => acceptOffer(offer.id)}
            style={{
              flex: 1, padding: '10px', borderRadius: 'var(--ldb-r-md)',
              border: '1px solid rgba(0,229,122,0.25)', background: 'rgba(0,229,122,0.08)',
              color: 'var(--ldb-win)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--ldb-font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <CheckCircle size={13} /> Aceitar ${fmt(offer.offerAmount)}k
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Player market row ────────────────────────────────────────────────────────

function PlayerMarketRow({ player, action, canAfford, onAction }: {
  player: Player;
  action: 'buy' | 'sell';
  canAfford: boolean;
  onAction: () => void;
}) {
  const isLegendary = player.rarity === 'legendary';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--ldb-surface)',
      border: `1px solid ${isLegendary ? 'var(--ldb-border-gold)' : 'var(--ldb-border)'}`,
      borderRadius: 'var(--ldb-r-md)', padding: '12px 14px',
      transition: 'border-color 200ms',
    }}>
      {/* Flag + position */}
      <div style={{
        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
        background: 'var(--ldb-elevated)', border: '1px solid var(--ldb-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {player.flag}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: isLegendary ? 'var(--ldb-gold-bright)' : 'var(--ldb-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3,
        }}>
          {player.name}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 3,
            background: 'rgba(255,255,255,0.06)', color: 'var(--ldb-text-muted)',
            border: '1px solid var(--ldb-border)',
          }}>
            {player.position}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ldb-gold-bright)' }}>{'★'.repeat(player.stars)}</span>
          <span style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>{player.age}a</span>
        </div>
      </div>

      {/* Price + action */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 15, color: 'var(--ldb-gold-bright)', letterSpacing: '0.04em' }}>
          ${fmt(player.marketValue)}k
        </div>
        <button
          onClick={onAction}
          disabled={action === 'buy' && !canAfford}
          style={{
            padding: '5px 12px', borderRadius: 'var(--ldb-r-sm)',
            background: action === 'buy'
              ? (canAfford ? 'rgba(26,122,64,0.2)' : 'rgba(255,255,255,0.04)')
              : 'rgba(255,85,85,0.1)',
            border: action === 'buy'
              ? `1px solid ${canAfford ? 'rgba(26,122,64,0.4)' : 'var(--ldb-border)'}`
              : '1px solid rgba(255,85,85,0.25)',
            color: action === 'buy'
              ? (canAfford ? 'var(--ldb-text-success)' : 'var(--ldb-text-muted)')
              : 'var(--ldb-loss)',
            fontSize: 11, fontWeight: 700, cursor: canAfford || action === 'sell' ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--ldb-font-body)', transition: 'all 150ms',
          }}
        >
          {action === 'buy' ? 'Comprar' : 'Vender'}
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ player, price, action, onConfirm, onClose }: {
  player: Player; price: number; action: 'buy' | 'sell'; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(5,10,14,0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border-mid)',
        borderRadius: 'var(--ldb-r-lg)', padding: '28px 24px',
        maxWidth: 340, width: '100%',
        animation: 'ldb-scale-in 0.25s var(--ldb-ease-out)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 18, letterSpacing: '0.06em', color: 'var(--ldb-text)' }}>
            {action === 'buy' ? 'CONFIRMAR COMPRA' : 'CONFIRMAR VENDA'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ldb-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Player info */}
        <div style={{
          background: 'var(--ldb-elevated)', borderRadius: 'var(--ldb-r-md)',
          padding: '14px', display: 'flex', gap: 12, marginBottom: 20,
          border: '1px solid var(--ldb-border)',
        }}>
          <span style={{ fontSize: 32 }}>{player.flag}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ldb-text)' }}>{player.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ldb-text-muted)', marginTop: 2 }}>
              {player.position} · {'★'.repeat(player.stars)} · {player.age} anos
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--ldb-text-muted)' }}>
            {action === 'buy' ? 'Custo total:' : 'Você receberá:'}
          </span>
          <span style={{
            fontFamily: 'var(--ldb-font-display)', fontSize: 22,
            color: action === 'buy' ? 'var(--ldb-loss)' : 'var(--ldb-win)',
            letterSpacing: '0.04em',
          }}>
            {action === 'buy' ? '-' : '+'}${fmt(price)}k
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="ldb-btn-ghost" onClick={onClose} style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={action === 'buy' ? 'ldb-btn-primary' : undefined}
            style={action === 'sell' ? {
              flex: 1, padding: '12px', background: 'rgba(0,229,122,0.15)',
              border: '1px solid rgba(0,229,122,0.3)', borderRadius: 'var(--ldb-r-md)',
              color: 'var(--ldb-win)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--ldb-font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            } : { flex: 1, padding: '12px' }}
          >
            {action === 'buy' ? '💰 Comprar' : '✅ Vender'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filters bar ──────────────────────────────────────────────────────────────

function Filters({ search, setSearch, posFilter, setPosFilter, starFilter, setStarFilter, sortBy, setSortBy }: {
  search: string; setSearch: (v: string) => void;
  posFilter: Position | 'ALL'; setPosFilter: (v: Position | 'ALL') => void;
  starFilter: number; setStarFilter: (v: number) => void;
  sortBy: string; setSortBy: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--ldb-text-muted)', pointerEvents: 'none',
        }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar jogador..."
          style={{
            width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
            background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
            borderRadius: 'var(--ldb-r-md)', color: 'var(--ldb-text)', fontSize: 13,
            outline: 'none', fontFamily: 'var(--ldb-font-body)', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Position filter */}
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
        {(['ALL', ...POSITIONS] as const).map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos as Position | 'ALL')}
            style={{
              flexShrink: 0, padding: '4px 10px', borderRadius: 'var(--ldb-r-pill)',
              fontSize: 10, fontWeight: 700,
              background: posFilter === pos ? 'rgba(26,122,64,0.2)' : 'transparent',
              border: posFilter === pos ? '1px solid rgba(26,122,64,0.4)' : '1px solid var(--ldb-border)',
              color: posFilter === pos ? 'var(--ldb-text-success)' : 'var(--ldb-text-muted)',
              cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--ldb-font-body)',
            }}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Stars + sort */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onClick={() => setStarFilter(s)}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: starFilter === s ? 'rgba(255,215,0,0.15)' : 'transparent',
                border: starFilter === s ? '1px solid rgba(255,215,0,0.4)' : '1px solid var(--ldb-border)',
                color: starFilter === s ? 'var(--ldb-gold-bright)' : 'var(--ldb-text-muted)',
                fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--ldb-font-body)',
              }}
            >
              {s === 0 ? 'ALL' : '★'.repeat(s)}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            marginLeft: 'auto', background: 'var(--ldb-surface)',
            border: '1px solid var(--ldb-border)', borderRadius: 'var(--ldb-r-sm)',
            color: 'var(--ldb-text-muted)', fontSize: 11, fontWeight: 600,
            padding: '4px 8px', cursor: 'pointer', outline: 'none',
            fontFamily: 'var(--ldb-font-body)',
          }}
        >
          <option value="stars">★ Estrelas</option>
          <option value="price">💰 Preço</option>
          <option value="age">🎂 Idade</option>
        </select>
      </div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function Tab({ label, active, count, onClick }: { label: string; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 8px',
        background: active ? 'rgba(26,122,64,0.15)' : 'transparent',
        border: 'none', borderBottom: `2px solid ${active ? 'var(--ldb-pitch-bright)' : 'transparent'}`,
        color: active ? 'var(--ldb-text-success)' : 'var(--ldb-text-muted)',
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'var(--ldb-font-body)', transition: 'all 200ms',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span style={{
          minWidth: 18, height: 18, borderRadius: 99, background: 'var(--ldb-loss)',
          color: '#fff', fontSize: 9, fontWeight: 900, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', padding: '0 4px',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MarketScreen() {
  const { state, buyPlayer, sellPlayer } = useMB();
  const { save } = state;

  const [tab, setTab] = useState<'buy' | 'sell' | 'offers'>('buy');
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [starFilter, setStarFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'price' | 'age'>('stars');
  const [preview, setPreview] = useState<{ player: Player; price: number; action: 'buy' | 'sell' } | null>(null);

  if (!save) return null;

  const mySquadIds = new Set(save.mySquad.map(p => p.id));
  const pendingOffers = save.pendingOffers.filter(o => o.status === 'pending');

  const marketPlayers = useMemo(
    () => save.allPlayers.filter(p => !mySquadIds.has(p.id)),
    [save.allPlayers, save.mySquad.length]
  );

  function filterPlayers(players: Player[]) {
    return players
      .filter(p => posFilter === 'ALL' || p.position === posFilter)
      .filter(p => starFilter === 0 || p.stars === starFilter)
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.nationality.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'price') return a.marketValue - b.marketValue;
        if (sortBy === 'age')   return a.age - b.age;
        return b.stars - a.stars;
      });
  }

  function handleAction(player: Player, action: 'buy' | 'sell') {
    const price = action === 'buy'
      ? Math.round(player.marketValue * 1.1)
      : Math.round(player.marketValue * 0.8);
    setPreview({ player, price, action });
  }

  function executeAction() {
    if (!preview) return;
    if (preview.action === 'buy') buyPlayer(preview.player, preview.price);
    else sellPlayer(preview.player.id, preview.price, 'Mercado Livre');
    setPreview(null);
  }

  const displayedPlayers = filterPlayers(tab === 'buy' ? marketPlayers : save.mySquad);

  return (
    <div style={{ background: 'var(--ldb-deep)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10,21,32,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ldb-border)',
      }}>
        <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'rgba(26,122,64,0.15)', border: '1px solid rgba(26,122,64,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeftRight size={14} style={{ color: 'var(--ldb-pitch-bright)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 15, letterSpacing: '0.06em', color: 'var(--ldb-text)' }}>
              MERCADO
            </div>
            <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>
              {marketPlayers.length} jogadores disponíveis
            </div>
          </div>
          <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 16, color: 'var(--ldb-gold-bright)', letterSpacing: '0.04em' }}>
            ${fmt(save.budget)}k
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--ldb-border)', marginTop: 8 }}>
          <Tab label="Comprar" active={tab === 'buy'} onClick={() => setTab('buy')} />
          <Tab label="Vender" active={tab === 'sell'} onClick={() => setTab('sell')} />
          <Tab label="Propostas" active={tab === 'offers'} count={pendingOffers.length} onClick={() => setTab('offers')} />
        </div>
      </div>

      <div style={{ padding: 16, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Offers tab */}
        {tab === 'offers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingOffers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ldb-text-muted)', fontSize: 13 }}>
                Nenhuma proposta recebida
              </div>
            ) : (
              pendingOffers.map(offer => <IncomingOfferCard key={offer.id} offer={offer} />)
            )}
          </div>
        )}

        {/* Buy / Sell tabs */}
        {(tab === 'buy' || tab === 'sell') && (
          <>
            <Filters
              search={search} setSearch={setSearch}
              posFilter={posFilter} setPosFilter={setPosFilter}
              starFilter={starFilter} setStarFilter={setStarFilter}
              sortBy={sortBy} setSortBy={setSortBy}
            />

            {displayedPlayers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ldb-text-muted)', fontSize: 13 }}>
                Nenhum jogador encontrado
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {displayedPlayers.slice(0, 50).map(player => (
                  <PlayerMarketRow
                    key={player.id}
                    player={player}
                    action={tab}
                    canAfford={save.budget >= Math.round(player.marketValue * 1.1)}
                    onAction={() => handleAction(player, tab)}
                  />
                ))}
                {displayedPlayers.length > 50 && (
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ldb-text-muted)', padding: '8px 0' }}>
                    Refine os filtros para ver mais ({displayedPlayers.length - 50} ocultos)
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {preview && (
        <ConfirmModal
          player={preview.player}
          price={preview.price}
          action={preview.action}
          onConfirm={executeAction}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
