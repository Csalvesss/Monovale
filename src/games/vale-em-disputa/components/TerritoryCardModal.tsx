// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Territory Card Trade Modal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { TERRITORY_CARD_SYMBOL, getTradeBonus } from '../constants';
import type { Player } from '../types';

interface Props {
  player: Player;
  tradeCount: number;
  mandatory?: boolean;
  onTrade: (selectedCities: string[]) => void;
  onClose: () => void;
}

const SYMBOL_ICONS: Record<string, string> = {
  square: '■',
  triangle: '▲',
  circle: '●',
};

const SYMBOL_COLORS: Record<string, string> = {
  square: '#3b82f6',
  triangle: '#f59e0b',
  circle: '#ec4899',
};

function isValidTrade(cities: string[]): boolean {
  if (cities.length !== 3) return false;
  const symbols = cities.map(c => TERRITORY_CARD_SYMBOL[c]);
  const unique = new Set(symbols).size;
  return unique === 1 || unique === 3;
}

export default function TerritoryCardModal({ player, tradeCount, mandatory, onTrade, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const hand = player.hand;
  const bonus = getTradeBonus(tradeCount);
  const valid = isValidTrade(selected);

  function toggleCard(city: string) {
    if (selected.includes(city)) {
      setSelected(s => s.filter(c => c !== city));
    } else if (selected.length < 3) {
      setSelected(s => [...s, city]);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '24px',
        maxWidth: 460, width: '94%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🃏</div>
          <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 16, margin: 0 }}>
            Cartas de Território
          </h2>
          {mandatory && (
            <p style={{ color: '#fca5a5', fontSize: 12, margin: '4px 0 0', fontWeight: 700 }}>
              Com 5 cartas, a troca é obrigatória!
            </p>
          )}
          <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>
            Selecione 3 cartas: 3 iguais OU 3 diferentes = +{bonus} tropas
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 14 }}>
          {(['square', 'triangle', 'circle'] as const).map(sym => (
            <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: SYMBOL_COLORS[sym], fontSize: 14 }}>{SYMBOL_ICONS[sym]}</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                {sym === 'square' ? 'Quadrado' : sym === 'triangle' ? 'Triângulo' : 'Círculo'}
              </span>
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 8, marginBottom: 16, maxHeight: 260, overflowY: 'auto',
        }}>
          {hand.map(city => {
            const sym = TERRITORY_CARD_SYMBOL[city];
            const isSelected = selected.includes(city);
            return (
              <div
                key={city}
                onClick={() => toggleCard(city)}
                style={{
                  background: isSelected
                    ? `${SYMBOL_COLORS[sym]}33`
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? SYMBOL_COLORS[sym] : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '10px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: 20, color: SYMBOL_COLORS[sym], marginBottom: 4 }}>
                  {SYMBOL_ICONS[sym]}
                </div>
                <div style={{ fontSize: 10, color: '#e2e8f0', fontWeight: 700, lineHeight: 1.3 }}>
                  {city}
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation hint */}
        {selected.length === 3 && !valid && (
          <p style={{ color: '#fca5a5', fontSize: 11, textAlign: 'center', margin: '0 0 10px' }}>
            Combinação inválida. Escolha 3 iguais ou 3 diferentes.
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {!mandatory && (
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '10px',
                background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          )}
          <button
            onClick={() => valid && onTrade(selected)}
            disabled={!valid}
            style={{
              flex: 1, padding: '10px',
              background: valid
                ? 'linear-gradient(135deg, #059669, #065f46)'
                : 'rgba(255,255,255,0.06)',
              color: valid ? '#fff' : '#475569',
              border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 800,
              cursor: valid ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            Trocar por +{bonus} tropas
          </button>
        </div>
      </div>
    </div>
  );
}
