import React, { useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { useSquadStore } from '../../store/squadStore';
import PitchView from '../ui/PitchView';
import type { Player } from '../../types/game';

const STAT_LABELS: [keyof import('../../types/game').Attributes, string, string][] = [
  ['pace',      'PAC', '#22c55e'],
  ['shooting',  'SHO', '#ef4444'],
  ['passing',   'PAS', '#3b82f6'],
  ['dribbling', 'DRI', '#a855f7'],
  ['defending', 'DEF', '#f59e0b'],
  ['physical',  'PHY', '#64748b'],
];

function PlayerDrawer({ player, onClose, onSwapToLineup }: {
  player: Player; onClose: () => void; onSwapToLineup?: () => void;
}) {
  const isLegendary = player.rarity === 'legendary';
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(2,6,23,0.85)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 500,
          background: 'var(--bg-surface)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--border-mid)',
          borderBottom: 'none',
          padding: '24px 20px 36px',
          animation: 'lenda-slide-up 0.3s var(--ease-out)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 9999, background: 'var(--border-mid)', margin: '0 auto 20px' }} />

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-default)',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>

        {/* Player header */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <img
            src={player.photo}
            alt={player.name}
            style={{
              width: 80, height: 80, borderRadius: 12,
              objectFit: 'cover',
              border: isLegendary ? '2px solid var(--wc-gold)' : '1px solid var(--border-mid)',
              boxShadow: isLegendary ? 'var(--shadow-gold)' : 'none',
            }}
            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.name}&background=1e293b&color=fbbf24`; }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, letterSpacing: '0.05em',
              color: isLegendary ? 'var(--wc-gold)' : 'var(--text-primary)',
            }}>
              {player.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {player.position} · {player.nationality} · {player.age}a
            </div>
            {player.lore && (
              <div style={{
                fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic',
                marginTop: 4, lineHeight: 1.5,
              }}>
                "{player.lore}"
              </div>
            )}
            {/* Stars */}
            <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: i < player.stars ? 'var(--wc-gold)' : 'var(--border-mid)', fontSize: 14 }}>★</span>
              ))}
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {STAT_LABELS.map(([key, label, color]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, fontSize: 10, fontWeight: 800, color, letterSpacing: '0.1em' }}>{label}</div>
              <div className="lenda-stat-bar" style={{ flex: 1 }}>
                <div className="lenda-stat-bar-fill" style={{ width: `${player.attributes[key]}%`, background: color }} />
              </div>
              <div style={{ width: 28, textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-primary)' }}>
                {player.attributes[key]}
              </div>
            </div>
          ))}
        </div>

        {/* Info row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20,
        }}>
          {[
            { label: 'Valor',    value: `€${new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(player.marketValue)}` },
            { label: 'Salário',  value: `€${new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(player.wage)}/sem` },
            { label: 'Moral',    value: `${player.moodPoints}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              textAlign: 'center', padding: '10px 8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-md)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-primary)' }}>{value}</div>
              <div className="lenda-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Swap button */}
        {onSwapToLineup && (
          <button
            onClick={() => { onSwapToLineup(); onClose(); }}
            style={{
              width: '100%', padding: '13px',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--r-md)',
              color: 'var(--wc-gold)',
              fontFamily: 'var(--font-display)',
              fontSize: 17, letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <ArrowLeftRight size={16} /> COLOCAR NO ONZE
          </button>
        )}
      </div>
    </div>
  );
}

export default function SquadScreen() {
  const { lineup, bench, players, swapLineupBench, removePlayer } = useSquadStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);

  const selectedPlayer = selectedId ? players[selectedId] : null;
  const isBenchPlayer  = selectedId ? bench.includes(selectedId) : false;

  function handlePitchClick(id: string) {
    if (swapTarget && bench.includes(swapTarget)) {
      swapLineupBench(id, swapTarget);
      setSwapTarget(null);
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  }

  function handleBenchClick(id: string) {
    setSwapTarget(id);
    setSelectedId(id);
  }

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div className="lenda-section-title">ELENCO & FORMAÇÃO</div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Pitch */}
        <div style={{ flex: 2, minWidth: 0 }}>
          {swapTarget && (
            <div style={{
              marginBottom: 8, padding: '8px 12px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid var(--border-gold)',
              borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--wc-gold)',
              fontWeight: 600,
            }}>
              Selecione um titular para trocar com {players[swapTarget]?.name}
            </div>
          )}
          <PitchView
            lineupIds={lineup}
            players={players}
            selectedId={selectedId}
            onPlayerClick={handlePitchClick}
          />
        </div>

        {/* Bench */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="lenda-label" style={{ marginBottom: 4 }}>RESERVAS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight: 480 }}>
            {bench.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', paddingTop: 20 }}>
                Banco vazio
              </div>
            )}
            {bench.map(id => {
              const p = players[id];
              if (!p) return null;
              const isSelected = id === swapTarget;
              return (
                <div
                  key={id}
                  onClick={() => handleBenchClick(id)}
                  style={{
                    padding: '8px 10px',
                    background: isSelected ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isSelected ? 'var(--border-gold)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  <img
                    src={p.photo}
                    alt={p.name}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.name}&background=1e293b&color=fbbf24`; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: p.rarity === 'legendary' ? 'var(--wc-gold)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{p.position} · ★{p.stars}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Player drawer */}
      {selectedPlayer && (
        <PlayerDrawer
          player={selectedPlayer}
          onClose={() => { setSelectedId(null); setSwapTarget(null); }}
          onSwapToLineup={isBenchPlayer && lineup.length > 0
            ? () => { swapLineupBench(lineup[0], selectedId!); }
            : undefined
          }
        />
      )}
    </div>
  );
}
