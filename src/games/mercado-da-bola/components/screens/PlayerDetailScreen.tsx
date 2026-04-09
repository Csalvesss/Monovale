import React, { useState, useRef, useEffect } from 'react';
import { useMB } from '../../store/gameStore';
import RadarChart from '../ui/RadarChart';
import type { Player } from '../../types';
import { gsap } from 'gsap';
import {
  DollarSign, Calendar, Star, Crown, TrendingUp, Zap,
  AlertTriangle, ChevronRight, Shield, Heart,
  Dumbbell, ArrowLeftRight, Trash2, X,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LIFESTYLE_LABEL: Record<string, string> = {
  poor: 'Humilde', modest: 'Modesto', comfortable: 'Confortável',
  luxury: 'Luxo', superstar: 'Superestrela',
};

const MOOD_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  motivated: { emoji: '😄', label: 'Motivado',   color: 'var(--ldb-win)' },
  happy:     { emoji: '🙂', label: 'Feliz',       color: '#60A5FA'        },
  neutral:   { emoji: '😐', label: 'Neutro',      color: 'var(--ldb-text-muted)' },
  unhappy:   { emoji: '😞', label: 'Insatisfeito', color: 'var(--ldb-loss)' },
};

function fmt(n: number) { return new Intl.NumberFormat('pt-BR').format(n); }

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!barRef.current) return;
    gsap.fromTo(barRef.current, { width: '0%' }, { width: `${value}%`, duration: 0.8, ease: 'power2.out', delay: 0.1 });
  }, [value]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ldb-text-muted)', width: 28, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div ref={barRef} style={{ height: '100%', borderRadius: 99, background: color, boxShadow: `0 0 6px ${color}55` }} />
      </div>
      <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 15, color, letterSpacing: '0.04em', width: 28, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────

function ConfirmModal({ title, desc, onConfirm, onClose }: {
  title: string; desc: string; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(5,10,14,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border-mid)',
        borderRadius: 'var(--ldb-r-lg)', padding: '28px 24px',
        maxWidth: 320, width: '100%', textAlign: 'center',
        animation: 'ldb-scale-in 0.25s var(--ldb-ease-out)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 20, color: 'var(--ldb-text)', letterSpacing: '0.04em', marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 13, color: 'var(--ldb-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>{desc}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="ldb-btn-ghost" onClick={onClose} style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', background: 'rgba(255,85,85,0.2)',
              border: '1px solid rgba(255,85,85,0.4)', borderRadius: 'var(--ldb-r-md)',
              color: 'var(--ldb-loss)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--ldb-font-body)',
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PlayerDetailScreen() {
  const { state, selectPlayer, trainPlayer, sellPlayer, setScreen } = useMB();
  const { save, selectedPlayerId } = state;
  const [sellConfirm, setSellConfirm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, [selectedPlayerId]);

  if (!save || !selectedPlayerId) return null;
  const player = save.mySquad.find(p => p.id === selectedPlayerId);
  if (!player) return null;

  const isLegendary = player.rarity === 'legendary';
  const moodInfo = MOOD_INFO[player.mood] ?? MOOD_INFO.neutral;

  const xpInLevel  = player.xp % 500;
  const xpProgress = (xpInLevel / 500) * 100;
  const xpToNext   = 500 - xpInLevel;
  const trainCost  = 50 * player.level;
  const canTrain   = save.budget >= trainCost && player.level < 10;

  const attrs = player.attributes;

  // Radar data
  const radarData = player.position === 'GK'
    ? [
        { label: 'GOL', value: attrs.goalkeeping ?? 60, color: '#F59E0B' },
        { label: 'DEF', value: attrs.defending,         color: '#60A5FA' },
        { label: 'FÍS', value: attrs.physical,          color: '#A78BFA' },
        { label: 'PAS', value: attrs.passing,           color: '#34D399' },
        { label: 'DRI', value: attrs.dribbling,         color: '#F87171' },
        { label: 'RIT', value: attrs.pace,              color: '#FB923C' },
      ]
    : [
        { label: 'RIT', value: attrs.pace,      color: '#FB923C' },
        { label: 'FIN', value: attrs.shooting,  color: '#F87171' },
        { label: 'PAS', value: attrs.passing,   color: '#34D399' },
        { label: 'DRI', value: attrs.dribbling, color: '#818CF8' },
        { label: 'DEF', value: attrs.defending, color: '#60A5FA' },
        { label: 'FÍS', value: attrs.physical,  color: '#A78BFA' },
      ];

  // Attr bars
  const attrBars = radarData.map(d => ({ ...d }));

  const contractColor = player.contractExpiresIn <= 1 ? 'var(--ldb-loss)' : player.contractExpiresIn <= 2 ? 'var(--ldb-draw)' : 'var(--ldb-text-muted)';
  const lifestyleSustainable = (save.budget * 1000) >= player.lifestyleExpenses; // rough check

  function handleSell() {
    sellPlayer(player.id);
    setSellConfirm(false);
    setScreen('squad');
  }

  return (
    <div style={{ background: 'var(--ldb-deep)', minHeight: '100%' }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: isLegendary
          ? 'linear-gradient(135deg, rgba(120,90,0,0.35), rgba(15,30,46,0.8))'
          : `linear-gradient(135deg, var(--ldb-pitch-dark), var(--ldb-surface))`,
        borderBottom: `1px solid ${isLegendary ? 'var(--ldb-border-gold)' : 'var(--ldb-border)'}`,
        padding: '24px 20px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Legendary glow */}
        {isLegendary && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Avatar / Badge */}
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--ldb-r-md)', flexShrink: 0,
            background: isLegendary
              ? 'linear-gradient(135deg, #FFD700, #C49A00)'
              : 'var(--ldb-elevated)',
            border: `2px solid ${isLegendary ? 'var(--ldb-gold-bright)' : 'var(--ldb-border-mid)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, lineHeight: 1,
            boxShadow: isLegendary ? 'var(--ldb-shadow-gold)' : 'var(--ldb-shadow-glow)',
          }}>
            {player.flag}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name */}
            <div style={{
              fontFamily: 'var(--ldb-font-display)', fontSize: 'clamp(18px, 5vw, 26px)',
              letterSpacing: '0.04em', color: isLegendary ? 'var(--ldb-gold-bright)' : 'var(--ldb-text)',
              lineHeight: 1.1, marginBottom: 6,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {player.name}
            </div>

            {/* Position + stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(255,255,255,0.08)', color: 'var(--ldb-text-muted)',
                border: '1px solid var(--ldb-border)',
              }}>
                {player.position}
              </span>
              <span style={{ color: 'var(--ldb-gold-bright)', fontSize: 14 }}>
                {'★'.repeat(player.stars)}{'☆'.repeat(5 - player.stars)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ldb-text-muted)' }}>
                {player.nationality}
              </span>
              {isLegendary && (
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                  background: 'rgba(255,215,0,0.15)', color: 'var(--ldb-gold-bright)',
                  border: '1px solid var(--ldb-border-gold)', letterSpacing: '0.1em',
                }}>
                  LENDÁRIO
                </span>
              )}
            </div>

            {/* Age + team */}
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ldb-text-muted)' }}>
              {player.age} anos · Nível {player.level}
            </div>
          </div>
        </div>

        {/* Legendary lore */}
        {isLegendary && player.legendaryCard?.lore && (
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--ldb-r-md)',
            border: '1px solid rgba(255,215,0,0.2)',
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,215,0,0.75)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
              "{player.legendaryCard.lore}"
            </p>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div ref={contentRef} style={{ opacity: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 28 }}>

        {/* Status row: mood + contract + lifestyle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Mood */}
          <div style={{
            background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
            borderRadius: 'var(--ldb-r-md)', padding: '12px 14px',
          }}>
            <div style={{ fontSize: 9, color: 'var(--ldb-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Humor</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{moodInfo.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: moodInfo.color }}>{moodInfo.label}</div>
                <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>{player.moodPoints}/100</div>
              </div>
            </div>
            {/* Mood bar */}
            <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, transition: 'width 600ms var(--ldb-ease-out)',
                width: `${player.moodPoints}%`,
                background: `linear-gradient(90deg, var(--ldb-loss) 0%, var(--ldb-draw) 50%, var(--ldb-win) 100%)`,
                backgroundSize: '200% 100%',
                backgroundPosition: `${100 - player.moodPoints}% 0`,
              }} />
            </div>
          </div>

          {/* Contract */}
          <div style={{
            background: 'var(--ldb-surface)', border: `1px solid ${contractColor}33`,
            borderRadius: 'var(--ldb-r-md)', padding: '12px 14px',
          }}>
            <div style={{ fontSize: 9, color: 'var(--ldb-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Contrato</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} style={{ color: contractColor }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: contractColor }}>
                  {player.contractExpiresIn} temp. rest.
                </div>
                <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>
                  ${fmt(player.wage)}k/semana
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{
          background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
          borderRadius: 'var(--ldb-r-md)', padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={14} style={{ color: 'var(--ldb-xp)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ldb-text)' }}>
                Nível {player.level}
              </span>
              {player.level >= 10 && <span className="ldb-badge ldb-badge-gold" style={{ fontSize: 9 }}>MAX</span>}
            </div>
            <span style={{ fontSize: 11, color: 'var(--ldb-text-muted)' }}>
              {xpInLevel} / 500 XP
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(168,85,247,0.12)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
              transition: 'width 800ms var(--ldb-ease-out)',
              width: `${xpProgress}%`,
              boxShadow: '0 0 8px rgba(168,85,247,0.5)',
            }} />
          </div>
          {player.level < 10 && (
            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--ldb-text-muted)' }}>
              {xpToNext} XP até o próximo nível
            </div>
          )}
        </div>

        {/* Radar chart + attribute bars */}
        <div style={{
          background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
          borderRadius: 'var(--ldb-r-lg)', padding: '16px',
        }}>
          <div className="ldb-section-label" style={{ marginBottom: 14 }}>Atributos</div>

          {/* Radar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <RadarChart data={radarData} size={220} animate />
          </div>

          {/* Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {attrBars.map(({ label, value, color }) => (
              <StatBar key={label} label={label} value={value} color={color} />
            ))}
          </div>
        </div>

        {/* Market value */}
        <div style={{
          background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
          borderRadius: 'var(--ldb-r-md)', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div className="ldb-section-label" style={{ marginBottom: 2 }}>Valor de Mercado</div>
            <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 24, color: 'var(--ldb-gold-bright)', letterSpacing: '0.04em' }}>
              ${fmt(player.marketValue)}k
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="ldb-section-label" style={{ marginBottom: 2 }}>Estilo de Vida</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ldb-text-mid)' }}>
              {LIFESTYLE_LABEL[player.lifestyle]}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ldb-text-muted)' }}>
              ${fmt(player.lifestyleExpenses)}k/mês
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ldb-section-label" style={{ marginBottom: 6 }}>Ações</div>

        {/* Train */}
        {player.level < 10 && (
          <button
            onClick={() => canTrain && trainPlayer(player.id)}
            disabled={!canTrain}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '14px 16px',
              background: canTrain ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${canTrain ? 'rgba(168,85,247,0.3)' : 'var(--ldb-border)'}`,
              borderRadius: 'var(--ldb-r-md)', cursor: canTrain ? 'pointer' : 'not-allowed',
              color: canTrain ? 'var(--ldb-xp)' : 'var(--ldb-text-muted)',
              fontFamily: 'var(--ldb-font-body)', fontWeight: 600, fontSize: 13,
              transition: 'all 200ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Dumbbell size={16} />
              <div style={{ textAlign: 'left' }}>
                <div>Treinar jogador</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>+100 XP imediato</div>
              </div>
            </div>
            <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 16, letterSpacing: '0.04em' }}>
              ${trainCost}k
            </span>
          </button>
        )}

        {/* Sell */}
        {player.rarity !== 'legendary' && (
          <button
            onClick={() => setSellConfirm(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '14px 16px',
              background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)',
              borderRadius: 'var(--ldb-r-md)', cursor: 'pointer',
              color: 'var(--ldb-loss)', fontFamily: 'var(--ldb-font-body)', fontWeight: 600, fontSize: 13,
              transition: 'all 200ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ArrowLeftRight size={16} />
              <div style={{ textAlign: 'left' }}>
                <div>Vender / liberar</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>Receber valor de mercado</div>
              </div>
            </div>
            <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 16, letterSpacing: '0.04em' }}>
              +${fmt(player.marketValue)}k
            </span>
          </button>
        )}
      </div>

      {sellConfirm && (
        <ConfirmModal
          title="VENDER JOGADOR?"
          desc={`${player.name} deixará o elenco. Você receberá $${fmt(player.marketValue)}k.`}
          onConfirm={handleSell}
          onClose={() => setSellConfirm(false)}
        />
      )}
    </div>
  );
}
