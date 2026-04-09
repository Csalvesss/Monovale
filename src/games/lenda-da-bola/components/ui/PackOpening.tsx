import React, { useEffect, useState } from 'react';
import type { Player } from '../../types/game';
import PlayerCard from './PlayerCard';

type Stage = 'closed' | 'shaking' | 'exploding' | 'reveal';

interface Props {
  player: Player;
  onCollect: () => void;
}

export default function PackOpening({ player, onCollect }: Props) {
  const [stage, setStage] = useState<Stage>('closed');

  // Auto-progress through stages
  useEffect(() => {
    const t1 = setTimeout(() => setStage('shaking'),   800);
    const t2 = setTimeout(() => setStage('exploding'), 2800);
    const t3 = setTimeout(() => setStage('reveal'),    3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const isReveal = stage === 'reveal';

  return (
    <div className="lenda-pack-overlay" style={{ gap: 24 }}>
      {/* Sparkle particles */}
      {isReveal && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="lenda-anim-sparkle"
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                borderRadius: '50%',
                background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#fff' : '#fde68a',
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top label */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 14,
        letterSpacing: '0.2em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}>
        {stage === 'closed'    && 'CARREGANDO PACOTE...'}
        {stage === 'shaking'   && 'ABRINDO PACOTE...'}
        {stage === 'exploding' && '💥'}
        {stage === 'reveal'    && '✨ CARTA LENDÁRIA ENCONTRADA! ✨'}
      </div>

      {/* Pack / Card */}
      {!isReveal ? (
        <div
          style={{
            width: 160,
            height: 224,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            border: '2px solid var(--wc-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 0 40px rgba(251,191,36,0.4)',
            animation: stage === 'shaking'
              ? 'lenda-shake 0.4s ease-in-out infinite'
              : stage === 'exploding'
              ? 'lenda-explode 0.5s var(--ease-out) forwards'
              : 'none',
            cursor: stage === 'closed' ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (stage === 'closed') setStage('shaking');
          }}
        >
          <span style={{ fontSize: 48 }}>🏆</span>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: '0.1em',
            color: 'var(--wc-gold)',
          }}>
            LENDA
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            {stage === 'closed' ? 'TOQUE PARA ABRIR' : 'AGUARDE...'}
          </div>
        </div>
      ) : (
        /* Reveal */
        <div
          style={{ animation: 'lenda-reveal 0.6s var(--ease-out) both', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
        >
          <PlayerCard player={player} size="lg" />

          {/* Lore */}
          {player.lore && (
            <div style={{
              maxWidth: 280,
              textAlign: 'center',
              padding: '12px 16px',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--r-md)',
              animation: 'lenda-fade-up 0.5s 0.4s var(--ease-out) both',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                letterSpacing: '0.08em',
                color: 'var(--wc-gold)',
                marginBottom: 6,
              }}>
                {player.era ? `ERA ${player.era}` : 'LENDA'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{player.lore}"
              </div>
            </div>
          )}

          {/* Collect button */}
          <button
            className="lenda-btn-gold lenda-anim-pulse-gold"
            onClick={onCollect}
            style={{
              padding: '14px 40px',
              fontSize: 20,
              borderRadius: 'var(--r-pill)',
              animation: 'lenda-fade-up 0.5s 0.7s var(--ease-out) both, lenda-pulse-gold 2s ease-in-out infinite',
            }}
          >
            ✨ ADICIONAR À COLEÇÃO
          </button>
        </div>
      )}

      {/* Skip button */}
      {stage === 'closed' && (
        <button
          onClick={onCollect}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: 12,
            cursor: 'pointer', marginTop: 8,
            fontFamily: 'var(--font-body)',
          }}
        >
          Pular →
        </button>
      )}
    </div>
  );
}
