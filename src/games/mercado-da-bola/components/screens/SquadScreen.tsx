import React, { useState, useMemo } from 'react';
import { useMB } from '../../store/gameStore';
import { getTeam } from '../../data/teams';
import { LEGENDARY_PLAYERS } from '../../data/legendary-players';
import { FICTIONAL_PLAYERS } from '../../data/players';
import PitchView from '../ui/PitchView';
import type { Player, Position } from '../../types';
import { getEffectiveRating } from '../../utils/matchEngine';
import { calcDefenseTokens } from '../../utils/matchEngine';
import {
  AlertTriangle, Users, Star, DollarSign, Flame, Smile,
  ChevronRight, Shield, TrendingUp, Heart, BookOpen, User,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PositionGroup = 'ALL' | 'GK' | 'DEF' | 'MID' | 'ATK';
type SortMode     = 'stars' | 'mood' | 'rating';
type ViewMode     = 'list' | 'pitch' | 'album';

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

function moodEmoji(mood: string) {
  if (mood === 'motivated') return '😄';
  if (mood === 'happy') return '🙂';
  if (mood === 'neutral') return '😐';
  return '😞';
}

function moodColor(mood: string): string {
  if (mood === 'motivated') return 'var(--ldb-pitch-bright)';
  if (mood === 'happy') return '#60A5FA';
  if (mood === 'neutral') return 'var(--ldb-text-muted)';
  return 'var(--ldb-loss)';
}

function computeOVR(p: Player): number {
  const a = p.attributes;
  const vals = [a.pace, a.shooting, a.passing, a.dribbling, a.defending, a.physical,
                ...(a.goalkeeping !== undefined ? [a.goalkeeping] : [])];
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

// ─── Visual gradient per legendary card type ──────────────────────────────────

const VISUAL_GRADIENT: Record<string, string> = {
  gold:     'linear-gradient(160deg, rgba(251,245,183,0.15) 0%, rgba(212,175,55,0.08) 100%)',
  platinum: 'linear-gradient(160deg, rgba(244,244,244,0.12) 0%, rgba(176,184,196,0.06) 100%)',
  ruby:     'linear-gradient(160deg, rgba(255,179,179,0.12) 0%, rgba(220,38,38,0.06) 100%)',
  sapphire: 'linear-gradient(160deg, rgba(191,219,254,0.12) 0%, rgba(59,130,246,0.06) 100%)',
};

const VISUAL_BORDER: Record<string, string> = {
  gold:     'rgba(212,175,55,0.5)',
  platinum: 'rgba(176,184,196,0.5)',
  ruby:     'rgba(220,38,38,0.5)',
  sapphire: 'rgba(59,130,246,0.5)',
};

const VISUAL_GLOW: Record<string, string> = {
  gold:     '0 0 16px rgba(212,175,55,0.25)',
  platinum: '0 0 16px rgba(176,184,196,0.2)',
  ruby:     '0 0 16px rgba(220,38,38,0.25)',
  sapphire: '0 0 16px rgba(59,130,246,0.25)',
};

// ─── Album Card ───────────────────────────────────────────────────────────────

function AlbumCard({ player, owned, index }: { player: Player; owned: boolean; index: number }) {
  const vis = player.legendaryCard?.visual ?? 'gold';

  if (!owned) {
    return (
      <div style={{
        aspectRatio: '3/4',
        border: '2px dashed rgba(255,255,255,0.12)',
        borderRadius: 'var(--ldb-r-md)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px dashed rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={18} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
        <span style={{
          fontFamily: 'var(--ldb-font-display)', fontSize: 18,
          color: 'rgba(255,255,255,0.08)', lineHeight: 1,
        }}>?</span>
        <span style={{
          fontSize: 8, color: 'rgba(255,255,255,0.12)',
          fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Lenda #{index + 1}
        </span>
      </div>
    );
  }

  const ovr = computeOVR(player);

  return (
    <div style={{
      aspectRatio: '3/4',
      background: VISUAL_GRADIENT[vis],
      backdropFilter: 'blur(20px)',
      border: `1px solid ${VISUAL_BORDER[vis]}`,
      borderTop: `1px solid rgba(251,245,183,0.25)`,
      borderRadius: 'var(--ldb-r-md)',
      boxShadow: VISUAL_GLOW[vis],
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Top band: OVR + position */}
      <div style={{
        padding: '6px 8px 4px',
        background: 'rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--ldb-font-display)', fontSize: 22,
          color: 'var(--ldb-text-gold)', lineHeight: 1,
        }}>
          {ovr}
        </span>
        <span style={{
          fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--ldb-text-muted)',
        }}>
          {player.position}
        </span>
      </div>

      {/* Avatar */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px 6px',
      }}>
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            style={{ width: '90%', height: '90%', objectFit: 'contain' }}
          />
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `rgba(212,175,55,0.2)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: 'var(--ldb-text-gold)',
          }}>
            {player.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
          </div>
        )}
      </div>

      {/* Bottom band: name + era */}
      <div style={{
        padding: '4px 6px 6px',
        background: 'rgba(0,0,0,0.35)',
        borderTop: `1px solid ${VISUAL_BORDER[vis]}`,
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 9, fontWeight: 800, color: 'var(--ldb-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 2,
        }}>
          {player.name}
        </div>
        <div style={{
          fontSize: 7, color: 'var(--ldb-text-muted)', letterSpacing: '0.04em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {player.legendaryCard?.era ?? player.nationality}
        </div>
      </div>

      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)',
      }} />
    </div>
  );
}

// ─── Album View ───────────────────────────────────────────────────────────────

// All collectible legends = 20 Super Legends + 11 Lore Legends from FICTIONAL_PLAYERS
const LORE_LEGENDS = FICTIONAL_PLAYERS.filter(p => p.rarity === 'legendary');
const ALL_COLLECTIBLES = [...LEGENDARY_PLAYERS, ...LORE_LEGENDS];

function AlbumView({ ownedIds, mySquadIds }: { ownedIds: string[]; mySquadIds: string[] }) {
  const superOwned = LEGENDARY_PLAYERS.filter(p => ownedIds.includes(p.id)).length;
  const loreOwned  = LORE_LEGENDS.filter(p => mySquadIds.includes(p.id)).length;
  const totalOwned = superOwned + loreOwned;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Progress bar */}
      <div style={{
        background: 'var(--ldb-surface)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--ldb-border)',
        borderRadius: 'var(--ldb-r-md)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <BookOpen size={16} strokeWidth={1.5} style={{ color: 'var(--ldb-text-gold)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ldb-text)' }}>Álbum de Lendas</span>
            <span style={{
              fontFamily: 'var(--ldb-font-display)', fontSize: 14,
              color: 'var(--ldb-text-gold)', letterSpacing: '0.04em',
            }}>
              {totalOwned}/{ALL_COLLECTIBLES.length}
            </span>
          </div>
          <div className="ldb-progress">
            <div
              className="ldb-progress-fill"
              style={{
                width: `${(totalOwned / ALL_COLLECTIBLES.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--ldb-gold-mid), var(--ldb-gold-bright))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Super Legends section */}
      <div>
        <div className="ldb-section-label" style={{ marginBottom: 10 }}>
          ⚡ Super Lendas — {superOwned}/{LEGENDARY_PLAYERS.length} coletadas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {LEGENDARY_PLAYERS.map((p, i) => (
            <AlbumCard
              key={p.id}
              player={p}
              owned={ownedIds.includes(p.id)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Lore Legends section */}
      <div>
        <div className="ldb-section-label" style={{ marginBottom: 10 }}>
          🏆 Lendas da Lore — {loreOwned}/{LORE_LEGENDS.length} no elenco
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {LORE_LEGENDS.map((p, i) => (
            <AlbumCard
              key={p.id}
              player={p}
              owned={mySquadIds.includes(p.id)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Player row ───────────────────────────────────────────────────────────────

function PlayerRow({ player, isSelected, onClick }: {
  player: Player; isSelected: boolean; onClick: () => void;
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
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isSelected ? 'var(--ldb-border-mid)' : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${isSelected ? 'var(--ldb-pitch-bright)' : isLegendary ? 'var(--ldb-gold-mid)' : 'transparent'}`,
        borderRadius: 'var(--ldb-r-md)',
        cursor: 'pointer',
        transition: 'all 200ms var(--ldb-ease-out)',
      }}
    >
      {/* Avatar or initials */}
      {player.imageUrl ? (
        <img
          src={player.imageUrl}
          alt={player.name}
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <span style={{ fontSize: 18, flexShrink: 0 }}>{player.flag}</span>
      )}

      {/* Name + position */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {player.imageUrl && <span style={{ fontSize: 11 }}>{player.flag}</span>}
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: isLegendary ? 'var(--ldb-text-gold)' : 'var(--ldb-text)',
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
          <span style={{ fontSize: 10, color: 'var(--ldb-text-gold)' }}>{'★'.repeat(player.stars)}</span>
          {player.injured && <span style={{ fontSize: 9, color: 'var(--ldb-loss)' }}>🏥</span>}
          {player.suspended && <span style={{ fontSize: 9, color: 'var(--ldb-draw)' }}>🟥</span>}
        </div>
      </div>

      {/* Mood */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
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

      <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--ldb-text-muted)', flexShrink: 0 }} />
    </div>
  );
}

// ─── Position tabs ────────────────────────────────────────────────────────────

function PositionTabs({ active, onChange }: { active: PositionGroup; onChange: (g: PositionGroup) => void }) {
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
            background: active === t.id ? 'rgba(0,255,135,0.12)' : 'transparent',
            border: active === t.id ? '1px solid rgba(0,255,135,0.35)' : '1px solid var(--ldb-border)',
            color: active === t.id ? 'var(--ldb-pitch-bright)' : 'var(--ldb-text-muted)',
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
  const defTokens  = calcDefenseTokens(squad);
  const totalStars = squad.reduce((s, p) => s + p.stars, 0);
  const avgMood    = squad.length > 0 ? Math.round(squad.reduce((s, p) => s + p.moodPoints, 0) / squad.length) : 0;

  const items = [
    { label: 'Jogadores', value: squad.length,  icon: Users,  color: 'var(--ldb-text-mid)' },
    { label: 'Fichas',    value: defTokens,      icon: Shield, color: 'var(--ldb-text-gold)' },
    { label: 'Stars',     value: totalStars,     icon: Star,   color: 'var(--ldb-text-gold)' },
    { label: 'Moral',     value: `${avgMood}%`,  icon: Heart,  color: avgMood >= 70 ? 'var(--ldb-win)' : avgMood >= 50 ? 'var(--ldb-draw)' : 'var(--ldb-loss)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} style={{
          background: 'var(--ldb-surface)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--ldb-border)', borderRadius: 'var(--ldb-r-md)',
          padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        }}>
          <Icon size={12} strokeWidth={1.5} style={{ color }} />
          <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 18, letterSpacing: '0.03em', color, lineHeight: 1 }}>
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

  const [group,    setGroup]    = useState<PositionGroup>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('stars');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  if (!save) return null;

  const myTeam    = getTeam(save.myTeamId);
  const squad     = save.mySquad;
  const teamColor = myTeam?.primaryColor ?? '#00994D';

  const sortedFiltered = useMemo(() => {
    const players = squad.filter(p => inGroup(p, group));
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

  const VIEW_BTNS: { id: ViewMode; label: string }[] = [
    { id: 'list',  label: '☰' },
    { id: 'pitch', label: '🟩' },
    { id: 'album', label: '📖' },
  ];

  return (
    <div style={{ background: 'var(--ldb-deep)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(2,4,6,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'rgba(0,255,135,0.10)', border: '1px solid rgba(0,255,135,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Users size={14} strokeWidth={1.5} style={{ color: 'var(--ldb-pitch-bright)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 15, letterSpacing: '0.06em', color: 'var(--ldb-text)' }}>
            ELENCO
          </div>
          <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>
            {squad.length} jogadores
          </div>
        </div>
        {/* View toggle — 3 modes */}
        <div style={{
          display: 'flex', background: 'var(--ldb-surface)',
          backdropFilter: 'blur(12px)',
          borderRadius: 8, border: '1px solid var(--ldb-border)', overflow: 'hidden',
        }}>
          {VIEW_BTNS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              title={id === 'list' ? 'Lista' : id === 'pitch' ? 'Campo' : 'Álbum'}
              style={{
                padding: '5px 11px', border: 'none', cursor: 'pointer',
                fontSize: 12,
                background: viewMode === id ? 'rgba(0,255,135,0.18)' : 'transparent',
                color: viewMode === id ? 'var(--ldb-pitch-bright)' : 'var(--ldb-text-muted)',
                transition: 'all 150ms',
                fontFamily: 'var(--ldb-font-body)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Summary (hidden in album mode) */}
        {viewMode !== 'album' && <SquadSummary squad={squad} />}

        {/* Warnings */}
        {viewMode !== 'album' && warnings.length > 0 && (
          <div style={{
            background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)',
            borderRadius: 'var(--ldb-r-md)', padding: '12px 14px',
          }}>
            {warnings.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < warnings.length - 1 ? 6 : 0 }}>
                <AlertTriangle size={12} strokeWidth={1.5} style={{ color: 'var(--ldb-loss)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--ldb-loss)', lineHeight: 1.4 }}>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Album ── */}
        {viewMode === 'album' && (
          <AlbumView
            ownedIds={save.legendaryCardsOwned}
            mySquadIds={squad.map(p => p.id)}
          />
        )}

        {/* ── Pitch ── */}
        {viewMode === 'pitch' && (
          <div>
            <div className="ldb-section-label" style={{ marginBottom: 10 }}>
              Campo 3D — Toque num jogador para ver detalhes
            </div>
            <PitchView
              squad={squad}
              selectedId={selectedPlayerId}
              onSelect={handlePlayerSelect}
              teamColor={teamColor}
            />
            {selectedPlayerId && (() => {
              const p = squad.find(pl => pl.id === selectedPlayerId);
              if (!p) return null;
              return (
                <div
                  onClick={() => handlePlayerSelect(selectedPlayerId)}
                  style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--ldb-surface)', backdropFilter: 'blur(12px)',
                    border: '1px solid var(--ldb-border-mid)',
                    borderRadius: 'var(--ldb-r-md)', padding: '14px 16px', cursor: 'pointer',
                  }}
                >
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 22 }}>{p.flag}</span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ldb-text)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ldb-text-muted)' }}>{p.position} · {'★'.repeat(p.stars)}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ldb-pitch-bright)', fontWeight: 700 }}>Ver →</span>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── List ── */}
        {viewMode === 'list' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <PositionTabs active={group} onChange={setGroup} />
              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as SortMode)}
                style={{
                  background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
                  borderRadius: 'var(--ldb-r-sm)', color: 'var(--ldb-text-muted)',
                  fontSize: 11, fontWeight: 600, padding: '5px 8px', cursor: 'pointer',
                  outline: 'none', fontFamily: 'var(--ldb-font-body)', flexShrink: 0,
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
