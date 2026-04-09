import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import { STADIUM_UPGRADE_COSTS } from '../../constants';
import type { StadiumUpgrade } from '../../types';

// ─── Types & constants ────────────────────────────────────────────────────────

interface UpgradeConfig {
  type: StadiumUpgrade;
  label: string;
  icon: string;
  description: string;
  statKey: 'capacity' | 'vipSections' | 'trainingLevel' | 'academyLevel' | 'mediaLevel';
}

const UPGRADES: UpgradeConfig[] = [
  {
    type: 'capacity',
    label: 'Capacidade',
    icon: '🏟️',
    description: 'Mais torcedores, mais renda',
    statKey: 'capacity',
  },
  {
    type: 'vip',
    label: 'Camarotes VIP',
    icon: '🎩',
    description: 'Camarotes VIP: renda extra',
    statKey: 'vipSections',
  },
  {
    type: 'training',
    label: 'Treinamento',
    icon: '🏋️',
    description: 'Centro de treinamento: +XP',
    statKey: 'trainingLevel',
  },
  {
    type: 'academy',
    label: 'Academia',
    icon: '🌱',
    description: 'Base: melhores jovens',
    statKey: 'academyLevel',
  },
  {
    type: 'media',
    label: 'Mídia',
    icon: '📡',
    description: 'Visibilidade: mais seguidores',
    statKey: 'mediaLevel',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

function LevelDots({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < level ? '#3b82f6' : '#334155',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = pct >= 80 ? '#4ade80' : pct >= 50 ? '#facc15' : '#3b82f6';
  return (
    <div style={{
      width: '100%', height: 6, borderRadius: 3,
      background: '#1e293b', overflow: 'hidden',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 3,
        background: color, transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

// ─── Upgrade card ─────────────────────────────────────────────────────────────

function UpgradeCard({
  config,
  currentLevel,
  budget,
  onUpgrade,
}: {
  config: UpgradeConfig;
  currentLevel: number;
  budget: number;
  onUpgrade: (type: StadiumUpgrade) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const isMaxed = currentLevel >= 5;
  const cost = isMaxed ? 0 : (STADIUM_UPGRADE_COSTS[config.type]?.[currentLevel] ?? 9999);
  const canAfford = budget >= cost;

  function handleClick() {
    if (isMaxed) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onUpgrade(config.type);
  }

  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${confirming ? '#d97706' : '#334155'}`,
      borderRadius: 14,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'border-color 0.2s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: '#0f172a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {config.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>{config.label}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{config.description}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 800,
            color: isMaxed ? '#4ade80' : '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.3px',
          }}>
            {isMaxed ? 'Máximo' : `Nível ${currentLevel}`}
          </div>
        </div>
      </div>

      {/* Level dots + progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LevelDots level={currentLevel} />
          <span style={{ fontSize: 10, color: '#475569' }}>{currentLevel}/5</span>
        </div>
        <ProgressBar value={currentLevel} max={5} />
      </div>

      {/* Cost & button */}
      {!isMaxed && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 900,
              color: canAfford ? '#fde68a' : '#ef4444',
            }}>
              ${fmt(cost)}k
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>custo de melhoria</div>
          </div>
          <button
            onClick={handleClick}
            disabled={!canAfford}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: confirming
                ? 'linear-gradient(90deg, #d97706, #b45309)'
                : canAfford
                  ? 'linear-gradient(90deg, #2563eb, #1d4ed8)'
                  : '#374151',
              color: !canAfford ? '#6b7280' : '#fff',
              fontWeight: 800,
              fontSize: 13,
              cursor: !canAfford ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {confirming ? '✅ Confirmar' : 'Melhorar'}
          </button>
        </div>
      )}

      {confirming && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#451a03',
          border: '1px solid #d97706',
          borderRadius: 8,
          padding: '8px 12px',
        }}>
          <span style={{ fontSize: 12, color: '#fde68a' }}>
            Confirmar melhoria? -${fmt(cost)}k
          </span>
          <button
            onClick={() => setConfirming(false)}
            style={{
              background: 'none', border: 'none',
              color: '#94a3b8', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-body)', padding: '2px 6px',
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StadiumScreen() {
  const { state, upgradeStadium, dispatch } = useMB();
  const { save } = state;

  if (!save) return null;

  const { stadium, budget } = save;

  // Estimated income per match: capacity * 0.7 * ticketPrice * 0.001
  const estimatedMatchIncome = Math.round(stadium.capacity * 0.7 * stadium.ticketPrice * 0.001);

  // Weekly wages
  const weeklyWages = save.mySquad.reduce((sum, p) => sum + p.wage, 0);

  // Ticket price slider state (stored in save, but driven locally until saved)
  const [ticketPrice, setTicketPrice] = useState(stadium.ticketPrice);

  function handleTicketPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setTicketPrice(val);
    // Persist to save immediately
    dispatch({
      type: 'UPDATE_SAVE',
      save: { ...save, stadium: { ...stadium, ticketPrice: val } },
    });
  }

  const sliderIncome = Math.round(stadium.capacity * 0.7 * ticketPrice * 0.001);

  return (
    <div style={{
      padding: '16px',
      paddingBottom: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      background: '#0f172a',
      minHeight: '100%',
    }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
        border: '1px solid #1d4ed8',
        borderRadius: 18,
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>🏟️</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>{stadium.name}</div>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>
          Capacidade: <strong style={{ color: '#60a5fa' }}>{fmt(stadium.capacity)}</strong> torcedores
        </div>
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 10,
          padding: '8px 18px',
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80' }}>
            ${fmt(estimatedMatchIncome)}k
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>receita estimada por partida</div>
        </div>
      </div>

      {/* ── Ticket price ── */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: '16px',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 12,
        }}>
          🎟️ Preço do Ingresso
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Valor atual</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fde68a' }}>
            ${ticketPrice}k
          </span>
        </div>

        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={ticketPrice}
          onChange={handleTicketPriceChange}
          style={{
            width: '100%',
            accentColor: '#3b82f6',
            cursor: 'pointer',
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#475569',
          marginTop: 4,
        }}>
          <span>$50k (mais público)</span>
          <span>$500k (mais renda)</span>
        </div>

        <div style={{
          marginTop: 12,
          padding: '8px 12px',
          background: '#0f172a',
          borderRadius: 8,
          fontSize: 12,
          color: '#94a3b8',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Público estimado</span>
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>
            {fmt(Math.round(stadium.capacity * 0.7))} pessoas → ${fmt(sliderIncome)}k
          </span>
        </div>
      </div>

      {/* ── Upgrades ── */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 12,
        }}>
          🔧 Melhorias do Estádio
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

      {/* ── Income summary ── */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: '16px',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 12,
        }}>
          💰 Resumo Financeiro
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: '#0f172a',
            borderRadius: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>👕</span>
              <div>
                <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>Salários semanais</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{save.mySquad.length} jogadores</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#f87171' }}>
              -${fmt(weeklyWages)}k
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: '#0f172a',
            borderRadius: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🎟️</span>
              <div>
                <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>Receita por partida</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>bilheteria + camarotes</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#4ade80' }}>
              +${fmt(estimatedMatchIncome)}k
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: estimatedMatchIncome >= weeklyWages ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${estimatedMatchIncome >= weeklyWages ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
              Saldo estimado por semana
            </div>
            <div style={{
              fontSize: 15, fontWeight: 900,
              color: estimatedMatchIncome >= weeklyWages ? '#4ade80' : '#f87171',
            }}>
              {estimatedMatchIncome >= weeklyWages ? '+' : ''}${fmt(estimatedMatchIncome - weeklyWages)}k
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
