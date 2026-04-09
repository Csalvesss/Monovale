import React from 'react';
import type { GameState, EventCard } from '../types';

interface Props {
  event: EventCard;
  state: GameState;
  onContinue: () => void;
}

function getActionDescription(event: EventCard, state: GameState): string {
  const action = event.action;
  const active = state.players.filter(p => !p.bankrupt);

  switch (action.type) {
    case 'all_pay':
      return `Todos os jogadores pagam R$${action.amount} ao banco.`;
    case 'all_collect':
      return `Todos os jogadores recebem R$${action.amount} do banco.`;
    case 'richest_pays_bank': {
      const richest = [...active].sort((a, b) => b.money - a.money)[0];
      return `${richest?.name ?? 'O mais rico'} (mais rico) paga R$${action.amount} ao banco.`;
    }
    case 'poorest_collects': {
      const poorest = [...active].sort((a, b) => a.money - b.money)[0];
      return `${poorest?.name ?? 'O mais pobre'} (mais pobre) recebe R$${action.amount} do banco.`;
    }
    case 'richest_pays_poorest': {
      const sorted = [...active].sort((a, b) => b.money - a.money);
      return `${sorted[0]?.name ?? 'O mais rico'} paga R$${action.amount} para ${sorted[sorted.length - 1]?.name ?? 'o mais pobre'}.`;
    }
    case 'random_player_pays':
      return `Um jogador aleatório perde R$${action.amount}.`;
    case 'random_player_collects':
      return `Um jogador aleatório recebe R$${action.amount}.`;
    case 'all_property_owners_pay':
      return `Todo dono de propriedade paga R$${action.amount}.`;
    case 'all_property_owners_collect':
      return `Todo dono de propriedade recebe R$${action.amount}.`;
    case 'specific_owner_pays': {
      const prop = state.properties[action.position];
      const owner = state.players.find(p => p.id === prop?.ownerId);
      if (owner) return `${owner.name}, dono de ${action.spaceName}, paga R$${action.amount}.`;
      return `Ninguém é dono de ${action.spaceName}. Sem efeito.`;
    }
    case 'specific_owner_collects': {
      const prop = state.properties[action.position];
      const owner = state.players.find(p => p.id === prop?.ownerId);
      if (owner) return `${owner.name}, dono de ${action.spaceName}, recebe R$${action.amount}.`;
      return `Ninguém é dono de ${action.spaceName}. Sem efeito.`;
    }
    case 'double_next_rent':
      return 'O próximo aluguel cobrado nesta rodada é dobrado!';
    case 'skip_next_rent':
      return 'Nenhum aluguel é cobrado nesta rodada!';
    case 'no_effect':
      return 'Nenhum efeito nesta rodada.';
    default:
      return '';
  }
}

function getTagColor(action: EventCard['action']): { bg: string; color: string; label: string } {
  switch (action.type) {
    case 'all_pay':
    case 'richest_pays_bank':
    case 'all_property_owners_pay':
    case 'specific_owner_pays':
    case 'random_player_pays':
    case 'richest_pays_poorest':
      return { bg: '#FEE2E2', color: '#991B1B', label: '⚠️ Negativo' };
    case 'all_collect':
    case 'poorest_collects':
    case 'all_property_owners_collect':
    case 'specific_owner_collects':
    case 'random_player_collects':
      return { bg: '#D1FAE5', color: '#065F46', label: '✅ Positivo' };
    case 'double_next_rent':
      return { bg: '#FEF3C7', color: '#92400E', label: '⚡ Aluguel Dobrado' };
    case 'skip_next_rent':
      return { bg: '#EDE9FE', color: '#5B21B6', label: '🛡️ Sem Aluguel' };
    default:
      return { bg: '#F3F4F6', color: '#374151', label: 'ℹ️ Informativo' };
  }
}

export default function EventModal({ event, state, onContinue }: Props) {
  const tag = getTagColor(event.action);
  const effectText = getActionDescription(event, state);

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        {/* Top banner */}
        <div style={S.topBanner}>
          <span style={S.bannerLabel}>🎴 EVENTO DO VALE</span>
          <span style={S.roundBadge}>Rodada {state.roundNumber}</span>
        </div>

        {/* Icon + Title */}
        <div style={S.iconRow}>
          <div style={S.iconBox}>{event.icon}</div>
        </div>
        <div style={S.title}>{event.title}</div>
        <p style={S.description}>{event.description}</p>

        {/* Effect tag */}
        <div style={S.tagRow}>
          <span style={{ ...S.tag, background: tag.bg, color: tag.color }}>
            {tag.label}
          </span>
        </div>

        {/* Effect box */}
        <div style={S.effectBox}>
          <div style={S.effectLabel}>Efeito</div>
          <div style={S.effectText}>{effectText}</div>
        </div>

        {/* Continue button */}
        <button style={S.btn} onClick={onContinue}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 3000, backdropFilter: 'blur(8px)', padding: 16,
  },
  modal: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
    maxWidth: 420, width: '100%',
    overflow: 'hidden',
    animation: 'pop-in 0.3s ease',
    fontFamily: 'var(--font-body)',
  },
  topBanner: {
    background: 'linear-gradient(90deg, #065F46, #059669)',
    padding: '12px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  bannerLabel: {
    color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '0.5px',
    fontFamily: 'var(--font-body)',
  },
  roundBadge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff', fontSize: 11, fontWeight: 700,
    borderRadius: 99, padding: '3px 10px', letterSpacing: '0.3px',
  },
  iconRow: {
    display: 'flex', justifyContent: 'center',
    marginTop: 24, marginBottom: 8,
  },
  iconBox: {
    fontSize: 52, lineHeight: 1,
    background: 'var(--card-alt)',
    border: '2px solid var(--border)',
    borderRadius: 20, padding: '12px 18px',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: 22, fontWeight: 800, color: 'var(--text)',
    textAlign: 'center', padding: '0 24px', marginBottom: 6,
  },
  description: {
    fontSize: 14, color: 'var(--text-mid)', fontWeight: 500,
    textAlign: 'center', lineHeight: 1.55,
    margin: '0 24px 16px', padding: 0,
  },
  tagRow: {
    textAlign: 'center', marginBottom: 16,
  },
  tag: {
    display: 'inline-block',
    fontSize: 12, fontWeight: 700, borderRadius: 99,
    padding: '5px 16px', letterSpacing: '0.3px',
  },
  effectBox: {
    margin: '0 20px 20px',
    background: 'var(--card-alt)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
  },
  effectLabel: {
    fontSize: 10, fontWeight: 800, color: 'var(--text-mid)',
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4,
  },
  effectText: {
    fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4,
  },
  btn: {
    display: 'block', width: 'calc(100% - 40px)',
    margin: '0 20px 20px',
    padding: '14px',
    background: 'var(--green-grad)',
    color: '#fff', border: 'none',
    borderRadius: 'var(--radius)', fontSize: 15,
    fontWeight: 800, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 4px 0 var(--green-dark)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
};
