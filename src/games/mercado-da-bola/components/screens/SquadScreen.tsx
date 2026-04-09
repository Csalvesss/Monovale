import React, { useState, useMemo } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import PlayerCard from '../ui/PlayerCard';
import type { Player, Position } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PositionGroup = 'ALL' | 'GK' | 'DEF' | 'MID' | 'ATK';
type SortMode = 'stars' | 'mood' | 'rating';

const GK_POSITIONS: Position[] = ['GK'];
const DEF_POSITIONS: Position[] = ['CB', 'LB', 'RB'];
const MID_POSITIONS: Position[] = ['CDM', 'CM', 'CAM'];
const ATK_POSITIONS: Position[] = ['LW', 'RW', 'ST', 'CF'];

const POSITION_GROUP_LABELS: { key: PositionGroup; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'GK',  label: 'GOL' },
  { key: 'DEF', label: 'DEF' },
  { key: 'MID', label: 'MEI' },
  { key: 'ATK', label: 'ATA' },
];

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'stars',  label: '★ Estrelas' },
  { key: 'mood',   label: '😊 Humor' },
  { key: 'rating', label: '⚡ Rating' },
];

const MOOD_ORDER: Record<string, number> = {
  motivated: 4, happy: 3, neutral: 2, unhappy: 1,
};

const MOOD_EMOJI: Record<string, string> = {
  motivated: '🔥', happy: '😊', neutral: '😐', unhappy: '😤',
};

const POSITION_COLORS: Record<string, string> = {
  GK: '#f59e0b',
  CB: '#3b82f6', LB: '#3b82f6', RB: '#3b82f6',
  CDM: '#10b981', CM: '#10b981', CAM: '#8b5cf6',
  LW: '#ef4444', RW: '#ef4444', ST: '#ef4444', CF: '#ef4444',
};

function playerRating(p: Player): number {
  const a = p.attributes;
  if (p.position === 'GK') {
    return Math.round(((a.goalkeeping ?? 0) * 3 + a.defending + a.physical) / 5);
  }
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

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

// ─── Squad rules check ────────────────────────────────────────────────────────

function squadWarnings(squad: Player[]): string[] {
  const warnings: string[] = [];
  const gks  = squad.filter(p => p.position === 'GK').length;
  const defs  = squad.filter(p => DEF_POSITIONS.includes(p.position)).length;
  const mids  = squad.filter(p => MID_POSITIONS.includes(p.position)).length;
  const atks  = squad.filter(p => ATK_POSITIONS.includes(p.position)).length;

  if (gks < 1)  warnings.push('Nenhum goleiro no elenco!');
  else if (gks < 2) warnings.push('Apenas 1 goleiro — recomendado ter 2+.');
  if (defs < 3) warnings.push(`Apenas ${defs} defensor(es) — mínimo recomendado: 3.`);
  if (mids < 2) warnings.push(`Apenas ${mids} meio-campista(s) — mínimo recomendado: 2.`);
  if (atks < 1) warnings.push('Nenhum atacante no elenco!');
  if (squad.length < 11) warnings.push(`Elenco com ${squad.length} jogadores — mínimo para jogar: 11.`);

  return warnings;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.8px',
      }}>
        {children}
      </div>
      {count !== undefined && (
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#475569',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 99,
          padding: '1px 7px',
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SquadScreen() {
  const { state, selectPlayer } = useMB();
  const { save, selectedPlayerId } = state;

  const [posFilter, setPosFilter] = useState<PositionGroup>('ALL');
  const [sortMode, setSortMode]   = useState<SortMode>('stars');
  const [showSort, setShowSort]   = useState(false);

  if (!save) return null;

  const myTeam = getTeam(save.myTeamId);

  // --- Stats ---
  const squad = save.mySquad;
  const avgStars = squad.length > 0
    ? (squad.reduce((s, p) => s + p.stars, 0) / squad.length).toFixed(1)
    : '0';
  const totalWages = squad.reduce((s, p) => s + p.wage, 0);

  // --- Filter + sort ---
  const filtered = useMemo(() => {
    const f = squad.filter(p => inGroup(p, posFilter));
    return [...f].sort((a, b) => {
      if (sortMode === 'stars')  return b.stars - a.stars || b.level - a.level;
      if (sortMode === 'mood')   return (MOOD_ORDER[b.mood] ?? 0) - (MOOD_ORDER[a.mood] ?? 0);
      if (sortMode === 'rating') return playerRating(b) - playerRating(a);
      return 0;
    });
  }, [squad, posFilter, sortMode]);

  const starters  = filtered.slice(0, 11);
  const reserves  = filtered.slice(11);

  const warnings = squadWarnings(squad);

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortMode)?.label ?? sortMode;

  return (
    <div style={{ padding: '16px', paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header / stats ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: (myTeam?.primaryColor ?? '#2563eb') + '33',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            {myTeam?.badge ?? '⚽'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9' }}>
              {myTeam?.name ?? 'Meu Time'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Gestão do Elenco</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { icon: '👕', value: String(squad.length),      label: 'Jogadores' },
            { icon: '★',  value: avgStars,                  label: 'Média ★' },
            { icon: '💰', value: `$${fmt(totalWages)}k`,    label: 'Salários/sem' },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 10,
              padding: '8px 10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14 }}>{icon}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Position filters */}
        <div style={{ display: 'flex', gap: 5, flex: 1 }}>
          {POSITION_GROUP_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPosFilter(key)}
              style={{
                padding: '5px 10px',
                borderRadius: 8,
                border: posFilter === key ? '1px solid #3b82f6' : '1px solid #334155',
                background: posFilter === key ? '#1d4ed8' : '#1e293b',
                color: posFilter === key ? '#fff' : '#94a3b8',
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowSort(v => !v)}
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {currentSortLabel} ▾
          </button>
          {showSort && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              overflow: 'hidden',
              zIndex: 50,
              minWidth: 130,
            }}>
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setSortMode(key); setShowSort(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '9px 14px',
                    background: sortMode === key ? '#1d4ed833' : 'none',
                    border: 'none',
                    borderBottom: '1px solid #334155',
                    color: sortMode === key ? '#60a5fa' : '#f1f5f9',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {squad.length === 0 && (
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
          color: '#64748b',
          fontSize: 13,
        }}>
          Nenhum jogador no elenco. Vá ao Mercado para contratar!
        </div>
      )}

      {/* ── 11 Titulares ── */}
      {starters.length > 0 && (
        <div>
          <SectionTitle count={starters.length}>11 Titulares</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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

      {/* ── Reservas ── */}
      {reserves.length > 0 && (
        <div>
          <SectionTitle count={reserves.length}>Reservas</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <div style={{
          background: '#431407',
          border: '1px solid #9a3412',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#fdba74', marginBottom: 2 }}>
            ⚠️ Avisos do Elenco
          </div>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: '#fed7aa', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ flexShrink: 0 }}>•</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
