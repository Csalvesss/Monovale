// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Event Card Choice Modal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { EVENT_CARD_MAP } from '../constants';

interface Props {
  cardIds: [string, string];
  onChoose: (chosenId: string, discardId: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  benefit: '#10b981',
  penalty: '#ef4444',
  neutral: '#6366f1',
};

const TYPE_LABELS: Record<string, string> = {
  benefit: 'Benefício',
  penalty: 'Penalidade',
  neutral: 'Neutro',
};

const TYPE_BG: Record<string, string> = {
  benefit: 'linear-gradient(135deg, #064e3b, #065f46)',
  penalty: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
  neutral: 'linear-gradient(135deg, #312e81, #3730a3)',
};

export default function EventCardModal({ cardIds, onChoose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const cards = cardIds.map(id => EVENT_CARD_MAP[id]).filter(Boolean);

  function handleConfirm() {
    if (!selected) return;
    const discarded = cardIds.find(id => id !== selected)!;
    onChoose(selected, discarded);
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
        padding: '28px 24px',
        maxWidth: 520, width: '94%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⭐</div>
          <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 18, margin: 0 }}>
            Carta de Evento!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 0' }}>
            Você acumulou 3 vitórias em combate. Escolha 1 carta:
          </p>
        </div>

        <div style={{ display: 'flex', gap: 14, flexDirection: 'column' }}>
          {cards.map(card => {
            const isSelected = selected === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelected(card.id)}
                style={{
                  background: isSelected ? TYPE_BG[card.type] : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? TYPE_COLORS[card.type] : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 800,
                    color: isSelected ? '#fff' : '#e2e8f0',
                  }}>
                    {card.title}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: TYPE_COLORS[card.type],
                    color: '#fff',
                    borderRadius: 99, padding: '2px 8px',
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    {TYPE_LABELS[card.type]}
                  </span>
                </div>
                <p style={{
                  fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.85)' : '#94a3b8',
                  margin: 0, lineHeight: 1.5,
                }}>
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          style={{
            marginTop: 20, width: '100%',
            padding: '12px',
            background: selected
              ? 'linear-gradient(135deg, #059669, #065f46)'
              : 'rgba(255,255,255,0.06)',
            color: selected ? '#fff' : '#475569',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 800,
            cursor: selected ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          {selected ? 'Confirmar Escolha' : 'Selecione uma carta'}
        </button>
      </div>
    </div>
  );
}
