import React, { useState, useMemo } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import PitchView from '../ui/PitchView';
import type { Player, Position } from '../../types';
import { getEffectiveRating } from '../../utils/matchEngine';
import { calcDefenseTokens } from '../../utils/matchEngine';
import {
  AlertTriangle, Users, Star, DollarSign, Flame, Smile,
  ChevronRight, Shield, TrendingUp, Heart,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PositionGroup = 'ALL' | 'GK' | 'DEF' | 'MID' | 'ATK';
type SortMode = 'stars' | 'mood' | 'rating';

const GK_POS:  Position[] = ['GK'];
const DEF_POS: Position[] = ['CB', 'LB', 'RB'];
const MID_POS: Position[] = ['CDM', 'CM', 'CAM'];
const ATK_POS: Position[] = ['LW', 'RW', 'ST', 'CF'];

const MOOD_ORDER: Record<string, number> = { motivated: 4, happy: 3, neutral: 2, unhappy: 1 };

function inGroup(p: Player, group: PositionGroup): boolean {
  if (group === 'ALL') return true;
  if (group === 'GK')  return GK_POS.includes(p.position);
  if (group === 'DEF') return DEF_POS.includes(p.position);
  if (group === 'MID') return MID_POS.includes(p.position);
  if (group === 'ATK') return ATK_POS.includes(p.position);
  return true;
}

function squadWarnings(squad: Player[]): string[] {
  const w: string[] = [];
  const gks  = squad.filter(p => p.position === 'GK').length;
  const defs  = squad.filter(p => DEF_POS.includes(p.position)).length;
  const mids  = squad.filter(p => MID_POS.includes(p.position)).length;
  const atks  = squad.filter(p => ATK_POS.includes(p.position)).length;
  if (gks < 1)       w.push('Nenhum goleiro!');
  if (defs < 3)      w.push(`Apenas ${defs} defensores (mín. 3).`);
  if (mids < 2)      w.push(`Apenas ${mids} meias (mín. 2).`);
  if (atks < 1)      w.push('Nenhum atacante!');
  if (squad.length < 11) w.push(`${squad.length} jogadores (mín. 11 para jogar).`);
  return w;
}

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

function moodEmoji(mood: string) {
  if (mood === 'motivated') return '😄';
  if (mood === 'happy') return '🙂';
  if (mood === 'neutral') return '😐';
  return '😞';
}

function moodColor(mood: string): string {
  if (mood === 'motivated') return 'var(--ldb-win)';
  if (mood === 'happy') return '#60A5FA';
  if (mood === 'neutral') return 'var(--ldb-text-muted)';
  return 'var(--ldb-loss)';
}

// ─── Player row ───────────────────────────────────────────────────────────────

function PlayerRow({ player, isSelected, onClick }: {
  player: Player;
  isSelected: boolean;
  onClick: () => void;
}) {
  const mc = moodColor(player.mood);
  const isLegendary = player.rarity === 'legendary';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px',
        background: isSelected ? 'var(--ldb-elevated)' : 'var(--ldb-surface)',
        border: `1px solid ${isSelected ? 'var(--ldb-border-mid)' : 'var(--ldb-border)'}`,
        borderLeft: `3px solid ${isSelected ? 'var(--ldb-pitch-bright)' : isLegendary ? 'var(--ldb-gold-bright)' : 'transparent'}`,
        borderRadius: 'var(--ldb-r-md)',
        cursor: 'pointer',
        transition: 'all 200ms var(--ldb-ease-out)',
      }}
    >
      {/* Flag + name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13 }}>{player.flag}</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: isLegendary ? 'var(--ldb-gold-bright)' : 'var(--ldb-text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {player.name}
          </span>
          {isLegendary && <span style={{ fontSize: 10 }}>⭐</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 3,
            background: 'rgba(255,255,255,0.06)', color: 'var(--ldb-text-muted)',
            border: '1px solid var(--ldb-border)',
          }}>
            {player.position}
          </span>
          <span style={{ fontSize: 10, color: 'var(--ldb-gold-bright)' }}>{'★'.repeat(player.stars)}</span>
          {player.injured && <span style={{ fontSize: 9, color: 'var(--ldb-loss)' }}>🏥</span>}
          {player.suspended && <span style={{ fontSize: 9, color: 'var(--ldb-draw)' }}>🟥</span>}
        </div>
      </div>

      {/* Mood */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14 }}>{moodEmoji(player.mood)}</span>
        <div style={{ fontSize: 9, color: mc, fontWeight: 700, width: 28, textAlign: 'center' }}>
          {player.moodPoints}
        </div>
      </div>

      {/* Level */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
        background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 6, padding: '4px 8px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ldb-xp)', lineHeight: 1 }}>{player.level}</div>
        <div style={{ fontSize: 8, color: 'var(--ldb-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nv</div>
      </div>

      <ChevronRight size={14} style={{ color: 'var(--ldb-text-muted)', flexShrink: 0 }} />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function PositionTabs({ active, onChange }: {
  active: PositionGroup;
  onChange: (g: PositionGroup) => void;
}) {
  const tabs: { id: PositionGroup; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'GK',  label: 'GL' },
    { id: 'DEF', label: 'Def' },
    { id: 'MID', label: 'Meio' },
    { id: 'ATK', label: 'Atk' },
  ];
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flexShrink: 0, padding: '5px 12px', borderRadius: 'var(--ldb-r-pill)',
            fontSize: 11, fontWeight: 700,
            background: active === t.id ? 'rgba(26,122,64,0.2)' : 'transparent',
            border: active === t.id ? '1px solid rgba(26,122,64,0.4)' : '1px solid var(--ldb-border)',
            color: active === t.id ? 'var(--ldb-text-success)' : 'var(--ldb-text-muted)',
            cursor: 'pointer', transition: 'all 200ms',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Squad summary bar ────────────────────────────────────────────────────────

function SquadSummary({ squad }: { squad: Player[] }) {
  const defTokens = calcDefenseTokens(squad);
  const totalStars = squad.reduce((s, p) => s + p.stars, 0);
  const avgMood = squad.length > 0 ? Math.round(squad.reduce((s, p) => s + p.moodPoints, 0) / squad.length) : 0;
  const totalWages = squad.reduce((s, p) => s + p.wage, 0);

  const items = [
    { label: 'Jogadores', value: squad.length, icon: Users, color: 'var(--ldb-text-mid)' },
    { label: 'Fichas Def.', value: defTokens, icon: Shield, color: 'var(--ldb-gold-bright)' },
    { label: 'Total Stars', value: totalStars, icon: Star, color: 'var(--ldb-gold-bright)' },
    { label: 'Moral Méd.', value: `${avgMood}%`, icon: Heart, color: avgMood >= 70 ? 'var(--ldb-win)' : avgMood >= 50 ? 'var(--ldb-draw)' : 'var(--ldb-loss)' },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
    }}>
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} style={{
          background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
          borderRadius: 'var(--ldb-r-md)', padding: '10px 8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        }}>
          <Icon size={12} style={{ color }} />
          <div style={{
            fontFamily: 'var(--ldb-font-display)', fontSize: 18, letterSpacing: '0.03em', color,
            lineHeight: 1,
          }}>
            {value}
          </div>
          <div style={{ fontSize: 8, color: 'var(--ldb-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SquadScreen() {
  const { state, selectPlayer, setScreen } = useMB();
  const { save, selectedPlayerId } = state;

  const [group, setGroup] = useState<PositionGroup>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('stars');
  const [viewMode, setViewMode] = useState<'list' | 'pitch'>('list');

  if (!save) return null;

  const myTeam = getTeam(save.myTeamId);
  const squad = save.mySquad;
  const teamColor = myTeam?.primaryColor ?? '#1A7A40';

  const sortedFiltered = useMemo(() => {
    let players = squad.filter(p => inGroup(p, group));
    return players.sort((a, b) => {
      if (sortMode === 'stars')  return b.stars - a.stars || b.level - a.level;
      if (sortMode === 'mood')   return (MOOD_ORDER[b.mood] ?? 0) - (MOOD_ORDER[a.mood] ?? 0);
      if (sortMode === 'rating') return getEffectiveRating(b) - getEffectiveRating(a);
      return 0;
    });
  }, [squad, group, sortMode]);

  const warnings = squadWarnings(squad);

  function handlePlayerSelect(id: string) {
    selectPlayer(id);
    setScreen('player-detail');
  }

  return (
    <div style={{ background: 'var(--ldb-deep)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10,21,32,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ldb-border)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'rgba(26,122,64,0.15)', border: '1px solid rgba(26,122,64,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Users size={14} style={{ color: 'var(--ldb-pitch-bright)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 15, letterSpacing: '0.06em', color: 'var(--ldb-text)' }}>
            ELENCO
          </div>
          <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>
            {squad.length} jogadores
          </div>
        </div>
        {/* View toggle */}
        <div style={{
          display: 'flex', background: 'var(--ldb-surface)', borderRadius: 8,
          border: '1px solid var(--ldb-border)', overflow: 'hidden',
        }}>
          {(['list', 'pitch'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '5px 12px', border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 700,
                background: viewMode === mode ? 'rgba(26,122,64,0.25)' : 'transparent',
                color: viewMode === mode ? 'var(--ldb-text-success)' : 'var(--ldb-text-muted)',
                transition: 'all 150ms',
                fontFamily: 'var(--ldb-font-body)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              {mode === 'list' ? '☰ Lista' : '🟩 Campo'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Squad summary */}
        <SquadSummary squad={squad} />

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{
            background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)',
            borderRadius: 'var(--ldb-r-md)', padding: '12px 14px',
          }}>
            {warnings.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < warnings.length - 1 ? 6 : 0 }}>
                <AlertTriangle size={12} style={{ color: 'var(--ldb-loss)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--ldb-loss)', lineHeight: 1.4 }}>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pitch view */}
        {viewMode === 'pitch' && (
          <div>
            <div className="ldb-section-label" style={{ marginBottom: 10 }}>
              Campo — Toque num jogador para ver detalhes
            </div>
            <PitchView
              squad={squad}
              selectedId={selectedPlayerId}
              onSelect={handlePlayerSelect}
              teamColor={teamColor}
            />
            {selectedPlayerId && (
              <div style={{ marginTop: 12 }}>
                {(() => {
                  const p = squad.find(pl => pl.id === selectedPlayerId);
                  if (!p) return null;
                  return (
                    <div
                      onClick={() => handlePlayerSelect(selectedPlayerId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border-mid)',
                        borderRadius: 'var(--ldb-r-md)', padding: '14px 16px', cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{p.flag}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ldb-text)' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ldb-text-muted)' }}>{p.position} · {'★'.repeat(p.stars)}</div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--ldb-pitch-bright)', fontWeight: 700 }}>Ver detalhes →</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <PositionTabs active={group} onChange={setGroup} />
              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as SortMode)}
                style={{
                  background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
                  borderRadius: 'var(--ldb-r-sm)', color: 'var(--ldb-text-muted)',
                  fontSize: 11, fontWeight: 600, padding: '5px 8px', cursor: 'pointer',
                  outline: 'none', fontFamily: 'var(--ldb-font-body)',
                  flexShrink: 0,
                }}
              >
                <option value="stars">★ Estrelas</option>
                <option value="mood">😊 Humor</option>
                <option value="rating">⚡ Rating</option>
              </select>
            </div>

            {sortedFiltered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ldb-text-muted)', fontSize: 13 }}>
                Nenhum jogador nesta posição
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedFiltered.map(player => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayerId === player.id}
                    onClick={() => handlePlayerSelect(player.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
