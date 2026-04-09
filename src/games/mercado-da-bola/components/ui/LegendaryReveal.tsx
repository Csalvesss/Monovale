import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { Player } from '../../types';

interface Props {
  player: Player;
  onClose: () => void;
}

type Phase = 'dark' | 'particles' | 'card-back' | 'flip' | 'reveal' | 'lore' | 'done';

const VISUAL_META: Record<string, {
  gradient: [string, string];
  glow: string;
  accent: string;
  name: string;
  bg: string;
}> = {
  gold: {
    gradient: ['#FFD700', '#C49A00'],
    glow: '#FFD700',
    accent: '#FFF8DC',
    name: 'OURO',
    bg: 'linear-gradient(135deg, #3D2800 0%, #7A5C00 50%, #3D2800 100%)',
  },
  platinum: {
    gradient: ['#E8F4FD', '#93C5FD'],
    glow: '#93C5FD',
    accent: '#DBEAFE',
    name: 'PLATINA',
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #1e3a5f 100%)',
  },
  ruby: {
    gradient: ['#FCA5A5', '#EF4444'],
    glow: '#FCA5A5',
    accent: '#FEF2F2',
    name: 'RUBI',
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
  },
  sapphire: {
    gradient: ['#A5B4FC', '#818CF8'],
    glow: '#A5B4FC',
    accent: '#EDE9FE',
    name: 'SAFIRA',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #1e1b4b 100%)',
  },
};

// ─── Three.js canvas ──────────────────────────────────────────────────────────

function ThreeCanvas({ glow, visible }: { glow: string; visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !visible) return;

    const canvas = canvasRef.current;
    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 4;

    // Parse glow color
    const glowHex = parseInt(glow.replace('#', '0x'), 16);

    // Point light for glow
    const pLight = new THREE.PointLight(glowHex, 3, 10);
    pLight.position.set(0, 0, 2);
    scene.add(pLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // Particle system
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    const colors = new Float32Array(particleCount * 3);
    const gC = new THREE.Color(glow);

    for (let i = 0; i < particleCount; i++) {
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02 + 0.005,
        (Math.random() - 0.5) * 0.02,
      ));

      // Vary colors slightly
      const hsl = { h: 0, s: 0, l: 0 };
      gC.getHSL(hsl);
      const c = new THREE.Color().setHSL(hsl.h + (Math.random() - 0.5) * 0.1, hsl.s, hsl.l + (Math.random() - 0.5) * 0.2);
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Animate
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.01;

      // Rotate particles
      particles.rotation.y = t * 0.15;
      particles.rotation.x = t * 0.05;

      // Pulse light
      pLight.intensity = 2 + Math.sin(t * 2) * 1;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, [visible, glow]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

// ─── Card face ────────────────────────────────────────────────────────────────

function CardFace({ player, visual, side }: { player: Player; visual: typeof VISUAL_META[string]; side: 'front' | 'back' }) {
  if (side === 'back') {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #0A1520, #0F1E2E)',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <div style={{ fontSize: 64, lineHeight: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>⚽</div>
        <div style={{
          fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.2)',
          letterSpacing: 4, textTransform: 'uppercase',
          fontFamily: 'var(--ldb-font-display)',
        }}>
          LENDA DA BOLA
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)',
      background: visual.bg,
      border: `2px solid ${visual.glow}`,
      borderRadius: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', gap: 10,
      boxShadow: `0 0 40px ${visual.glow}66, 0 0 80px ${visual.glow}22`,
      overflow: 'hidden',
    }}>
      {/* Holographic shimmer overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.15,
        background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.1) 60%, transparent 100%)',
        pointerEvents: 'none',
        animation: 'ldb-shimmer 3s linear infinite',
        backgroundSize: '200% 200%',
      }} />

      {/* Rarity badge */}
      <div style={{
        fontSize: 9, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase',
        background: 'rgba(0,0,0,0.4)', color: visual.accent,
        padding: '4px 14px', borderRadius: 99,
        border: `1px solid ${visual.glow}44`,
        fontFamily: 'var(--ldb-font-body)',
      }}>
        CARTA LENDÁRIA · {visual.name}
      </div>

      {/* Flag */}
      <div style={{ fontSize: 64, lineHeight: 1, filter: `drop-shadow(0 4px 16px ${visual.glow}88)` }}>
        {player.flag}
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--ldb-font-display)', fontSize: 'clamp(18px, 5vw, 24px)',
          letterSpacing: '0.05em', color: visual.accent,
          textShadow: `0 0 20px ${visual.glow}, 0 0 40px ${visual.glow}66`,
          lineHeight: 1.1,
        }}>
          {player.name}
        </div>
        {player.legendaryCard?.era && (
          <div style={{ fontSize: 11, color: `${visual.accent}aa`, marginTop: 4 }}>
            {player.legendaryCard.era}
          </div>
        )}
      </div>

      {/* Position + stars */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 800,
          background: 'rgba(0,0,0,0.4)', color: visual.accent,
          padding: '3px 10px', borderRadius: 6,
          fontFamily: 'var(--ldb-font-body)',
        }}>
          {player.position}
        </span>
        <span style={{ fontSize: 18, color: visual.glow }}>
          {'★'.repeat(player.stars)}
        </span>
      </div>

      {/* Lore */}
      {player.legendaryCard?.lore && (
        <div style={{
          fontSize: 11, color: `${visual.accent}cc`, textAlign: 'center', lineHeight: 1.5,
          background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: 10,
          fontStyle: 'italic', maxWidth: '90%',
        }}>
          "{player.legendaryCard.lore}"
        </div>
      )}

      {/* Boost */}
      <div style={{
        fontSize: 12, fontWeight: 700, color: visual.glow,
        fontFamily: 'var(--ldb-font-body)',
      }}>
        +{Math.round(((player.legendaryCard?.boostMultiplier ?? 1) - 1) * 100)}% todos os atributos
      </div>
    </div>
  );
}

// ─── Main Reveal ──────────────────────────────────────────────────────────────

export default function LegendaryReveal({ player, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('dark');
  const [flipped, setFlipped] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const visual = VISUAL_META[player.legendaryCard?.visual ?? 'gold'] ?? VISUAL_META.gold;

  // Howler sounds (gracefully skip if not available)
  const playSound = useCallback((src: string) => {
    try {
      const audio = new Audio();
      audio.volume = 0.5;
      // In a real implementation, use Howler here
    } catch { /* no-op */ }
  }, []);

  useEffect(() => {
    const timings: [Phase, number][] = [
      ['dark',     0],
      ['particles', 600],
      ['card-back', 1400],
      ['flip',     3000],
      ['reveal',   3600],
      ['lore',     4800],
      ['done',     6500],
    ];

    const timers = timings.map(([p, delay]) =>
      setTimeout(() => {
        setPhase(p);
        if (p === 'flip') setFlipped(true);
        if (p === 'lore') setTextVisible(true);
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const showThree = phase !== 'dark';

  return (
    <div
      onClick={phase === 'done' ? onClose : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: phase === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(5,10,14,0.97)',
        transition: 'background 0.6s ease',
        backdropFilter: phase === 'dark' ? 'none' : 'blur(12px)',
        padding: 24,
        cursor: phase === 'done' ? 'pointer' : 'default',
      }}
    >
      {/* Three.js particles */}
      {showThree && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <ThreeCanvas glow={visual.glow} visible={showThree} />
        </div>
      )}

      {/* CSS particles (fallback / additional) */}
      {phase !== 'dark' && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              borderRadius: '50%',
              background: visual.glow,
              opacity: 0,
              boxShadow: `0 0 ${8 + Math.random() * 8}px ${visual.glow}`,
              animation: `ldb-particle-float ${1.5 + Math.random() * 2}s ${Math.random() * 2}s ease-out infinite`,
            }} />
          ))}
        </div>
      )}

      {/* "ALGO EXTRAORDINÁRIO..." text */}
      {phase === 'card-back' && (
        <div style={{
          marginBottom: 20, textAlign: 'center',
          animation: 'ldb-fade-in 0.5s ease',
        }}>
          <div style={{
            fontFamily: 'var(--ldb-font-display)', fontSize: 16, letterSpacing: '0.2em',
            color: visual.glow, textShadow: `0 0 20px ${visual.glow}`,
            textTransform: 'uppercase',
          }}>
            ALGO EXTRAORDINÁRIO ACONTECEU
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Toque para revelar
          </div>
        </div>
      )}

      {/* 3D Card */}
      {phase !== 'dark' && (
        <div
          onClick={() => !flipped && setFlipped(true)}
          style={{
            perspective: 1200,
            width: 'min(280px, 75vw)',
            height: 'min(420px, 56vw)',
            cursor: !flipped ? 'pointer' : 'default',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{
            width: '100%', height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <CardFace player={player} visual={visual} side="back" />
            <CardFace player={player} visual={visual} side="front" />
          </div>
        </div>
      )}

      {/* Text reveal after flip */}
      {textVisible && (
        <div style={{ textAlign: 'center', marginTop: 24, zIndex: 2, animation: 'ldb-fade-in 0.5s ease' }}>
          <div style={{
            fontFamily: 'var(--ldb-font-display)', fontSize: 20, letterSpacing: '0.12em',
            color: visual.glow, textShadow: `0 0 20px ${visual.glow}`,
          }}>
            🌟 CARTA LENDÁRIA OBTIDA!
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            1 em 1.000 chances · Raridade histórica
          </div>
        </div>
      )}

      {/* Add to squad button */}
      {phase === 'done' && (
        <button
          onClick={onClose}
          style={{
            marginTop: 20, zIndex: 2,
            padding: '14px 36px',
            background: visual.bg,
            border: `1px solid ${visual.glow}`,
            color: visual.accent,
            borderRadius: 'var(--ldb-r-pill)',
            fontWeight: 800, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--ldb-font-body)',
            boxShadow: `0 0 24px ${visual.glow}55`,
            animation: 'ldb-gold-pulse 1.5s ease infinite, ldb-fade-in 0.4s ease',
          }}
        >
          Adicionar ao Elenco ✓
        </button>
      )}
    </div>
  );
}
