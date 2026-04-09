import React, { useEffect, useState } from 'react';
import type { Player } from '../../types';

interface Props {
  player: Player;
  onClose: () => void;
}

type Phase = 'dark' | 'particles' | 'card-back' | 'flip' | 'reveal' | 'done';

const VISUAL_COLORS: Record<string, { bg: string; glow: string; accent: string; name: string }> = {
  gold:     { bg: 'linear-gradient(135deg, #78350f, #92400e, #d97706)', glow: '#fbbf24', accent: '#fde68a', name: 'OURO' },
  platinum: { bg: 'linear-gradient(135deg, #1e3a5f, #1d4ed8, #60a5fa)', glow: '#93c5fd', accent: '#dbeafe', name: 'PLATINA' },
  ruby:     { bg: 'linear-gradient(135deg, #7f1d1d, #991b1b, #ef4444)', glow: '#fca5a5', accent: '#fef2f2', name: 'RUBI' },
  sapphire: { bg: 'linear-gradient(135deg, #1e1b4b, #4338ca, #818cf8)', glow: '#a5b4fc', accent: '#ede9fe', name: 'SAFIRA' },
};

export default function LegendaryReveal({ player, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('dark');
  const [cardFlipped, setCardFlipped] = useState(false);

  const visual = player.legendaryCard?.visual ?? 'gold';
  const vc = VISUAL_COLORS[visual] ?? VISUAL_COLORS.gold;

  useEffect(() => {
    const timings: [Phase, number][] = [
      ['dark',      0],
      ['particles', 600],
      ['card-back', 1400],
      ['flip',      2800],
      ['reveal',    3200],
      ['done',      5000],
    ];
    const timers = timings.map(([p, delay]) =>
      setTimeout(() => {
        setPhase(p);
        if (p === 'flip') setCardFlipped(true);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Particles
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 1.5,
    duration: 1.5 + Math.random() * 1.5,
  }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: phase === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.95)',
        transition: 'background 0.6s ease',
        backdropFilter: 'blur(8px)',
        padding: 20,
      }}
      onClick={phase === 'done' ? onClose : undefined}
    >
      {/* Particles */}
      {phase !== 'dark' && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: vc.glow,
                opacity: 0,
                boxShadow: `0 0 ${p.size * 2}px ${vc.glow}`,
                animation: `legendary-particle ${p.duration}s ${p.delay}s ease-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Card */}
      {phase !== 'dark' && (
        <div style={{ perspective: 1000, width: 280, height: 420, position: 'relative' }}>
          <div
            style={{
              width: '100%', height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Card back */}
            <div
              style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: '2px solid #334155',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: phase === 'card-back' ? 'pulse-ring 1s ease infinite' : undefined,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 64 }}>⚽</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#475569', letterSpacing: 3, marginTop: 8 }}>LENDA DA BOLA</div>
              </div>
            </div>

            {/* Card front (revealed) */}
            <div
              style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: vc.bg,
                border: `2px solid ${vc.glow}`,
                borderRadius: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 24,
                boxShadow: `0 0 40px ${vc.glow}66, 0 0 80px ${vc.glow}33`,
                gap: 12,
              }}
            >
              {/* Rarity badge */}
              <div style={{
                fontSize: 9, fontWeight: 900, letterSpacing: 3,
                background: 'rgba(0,0,0,0.4)', color: vc.accent,
                padding: '3px 12px', borderRadius: 99,
                border: `1px solid ${vc.glow}66`,
              }}>
                CARTA LENDÁRIA · {vc.name}
              </div>

              {/* Flag big */}
              <div style={{ fontSize: 60, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>{player.flag}</div>

              {/* Name */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: vc.accent, textShadow: `0 0 20px ${vc.glow}`, lineHeight: 1.2 }}>
                  {player.name}
                </div>
                <div style={{ fontSize: 11, color: `${vc.accent}aa`, marginTop: 4 }}>{player.legendaryCard?.era}</div>
              </div>

              {/* Position + stars */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(0,0,0,0.4)', color: vc.accent, padding: '3px 10px', borderRadius: 6 }}>
                  {player.position}
                </span>
                <span style={{ fontSize: 16, color: vc.glow }}>{'★'.repeat(player.stars)}</span>
              </div>

              {/* Lore */}
              <div style={{
                fontSize: 11, color: `${vc.accent}cc`, textAlign: 'center', lineHeight: 1.5,
                background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 10,
                fontStyle: 'italic',
              }}>
                "{player.legendaryCard?.lore}"
              </div>

              {/* Boost */}
              <div style={{ fontSize: 12, fontWeight: 700, color: vc.glow }}>
                +{Math.round(((player.legendaryCard?.boostMultiplier ?? 1) - 1) * 100)}% todos os atributos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text reveal */}
      {phase === 'reveal' || phase === 'done' ? (
        <div style={{ textAlign: 'center', marginTop: 24, animation: 'fade-up 0.5s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: vc.glow, letterSpacing: 3, marginBottom: 4 }}>
            🌟 CARTA LENDÁRIA OBTIDA!
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>1 em 1.000 chances · Raridade histórica</div>
          {phase === 'done' && (
            <button
              onClick={onClose}
              style={{
                marginTop: 20, padding: '12px 32px',
                background: vc.bg, border: `1px solid ${vc.glow}`,
                color: vc.accent, borderRadius: 99,
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                animation: 'pulse-ring 1.5s ease infinite',
                boxShadow: `0 0 20px ${vc.glow}55`,
              }}
            >
              Adicionar ao Elenco ✓
            </button>
          )}
        </div>
      ) : null}

      <style>{`
        @keyframes legendary-particle {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-80px) scale(0.3); }
        }
      `}</style>
    </div>
  );
}
