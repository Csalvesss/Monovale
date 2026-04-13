// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Dice Roller Component
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import type { CombatResult } from '../types';

interface Props {
  result: CombatResult;
  attackerName: string;
  defenderName: string;
  fromCity: string;
  toCity: string;
  onClose: () => void;
}

const DICE_FACES: Record<number, string> = {
  1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅',
};

function Die({ value, color, rolling }: { value: number; color: string; rolling?: boolean }) {
  return (
    <div style={{
      width: 52, height: 52,
      background: color,
      borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 32,
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      border: '2px solid rgba(255,255,255,0.3)',
      animation: rolling ? 'spin 0.4s ease-out' : undefined,
      transition: 'transform 0.3s ease',
    }}>
      {DICE_FACES[value] ?? '?'}
    </div>
  );
}

export default function DiceRoller({ result, attackerName, defenderName, fromCity, toCity, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [rolling, setRolling] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setRolling(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s',
    }} onClick={onClose}>
      <div
        style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '28px 32px',
          maxWidth: 420, width: '90%',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Combate
        </div>
        <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
          {fromCity} → {toCity}
        </div>

        {/* Attacker dice */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#fca5a5', fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {attackerName} (atacante)
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {result.attackerDice.map((v, i) => (
              <Die key={i} value={v} color="#dc2626" rolling={rolling} />
            ))}
          </div>
        </div>

        <div style={{ color: '#64748b', fontSize: 18, marginBottom: 12 }}>vs</div>

        {/* Defender dice */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#fcd34d', fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {defenderName} (defensor)
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {result.defenderDice.map((v, i) => (
              <Die key={i} value={v} color="#b45309" rolling={rolling} />
            ))}
          </div>
        </div>

        {/* Result */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fca5a5' }}>
                -{result.attackerLosses}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Perdas ataque</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fcd34d' }}>
                -{result.defenderLosses}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Perdas defesa</div>
            </div>
          </div>
          {result.conquered && (
            <div style={{
              marginTop: 12, padding: '8px 16px',
              background: 'linear-gradient(135deg, #059669, #065f46)',
              borderRadius: 8, color: '#fff', fontWeight: 800, fontSize: 14,
            }}>
              Cidade Conquistada!
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '10px 32px',
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Continuar
        </button>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
