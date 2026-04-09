import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import type { PlayerMessage, PlayerMessageMood } from '../../types';
import { MessageSquare, Check, ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../../components/ui/card';

// ─── Mood config ──────────────────────────────────────────────────────────────

const MOOD_CONFIG: Record<PlayerMessageMood, { emoji: string; label: string; color: string }> = {
  muito_feliz:  { emoji: '🌟', label: 'Muito Feliz',   color: '#fde68a' },
  feliz:        { emoji: '😃', label: 'Feliz',          color: '#4ade80' },
  normal:       { emoji: '😐', label: 'Normal',         color: '#94a3b8' },
  insatisfeito: { emoji: '😞', label: 'Insatisfeito',   color: '#fb923c' },
  triste:       { emoji: '😢', label: 'Triste',          color: '#f87171' },
  com_raiva:    { emoji: '😠', label: 'Com Raiva',       color: '#ef4444' },
};

const TYPE_LABELS: Record<string, string> = {
  bench_streak:      'No banco há muito tempo',
  goal_streak:       'Em fase artilheira',
  injury_return:     'Retorno de lesão',
  contract_expiring: 'Contrato a vencer',
  transfer_interest: 'Interesse de outro clube',
  general:           'Mensagem geral',
  squad_unhappy:     'Elenco insatisfeito',
};

// ─── Message Card ─────────────────────────────────────────────────────────────

function MessageCard({ msg }: { msg: PlayerMessage }) {
  const { readMessage, respondMessage } = useMB();
  const [expanded, setExpanded] = useState(false);
  const moodCfg = MOOD_CONFIG[msg.mood];

  function handleExpand() {
    if (!msg.read) readMessage(msg.id);
    setExpanded(e => !e);
  }

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${expanded ? moodCfg.color + '44' : '#334155'}`,
        background: msg.read ? '#1e293b' : '#1e293b',
        overflow: 'hidden',
        transition: 'all 0.2s',
        opacity: msg.responded ? 0.7 : 1,
      }}
    >
      {/* Header row */}
      <button
        onClick={handleExpand}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: 'transparent', border: 'none',
          cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
        }}
      >
        {/* Unread dot */}
        {!msg.read && (
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#3b82f6',
            flexShrink: 0, boxShadow: '0 0 8px #3b82f6',
          }} />
        )}

        {/* Mood emoji */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: moodCfg.color + '18', border: `1px solid ${moodCfg.color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {moodCfg.emoji}
        </div>

        {/* Player info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: msg.read ? 600 : 800, color: '#f1f5f9' }}>
              {msg.playerFlag} {msg.playerName}
            </span>
            {msg.responded && (
              <span style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.1)', borderRadius: 6, padding: '1px 6px' }}>
                ✓ Respondida
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {TYPE_LABELS[msg.type] ?? msg.type} · Rodada {msg.round}
          </div>
        </div>

        {/* Mood label + expand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: moodCfg.color,
            background: moodCfg.color + '18', borderRadius: 6, padding: '2px 8px',
          }}>
            {moodCfg.label}
          </span>
          {expanded
            ? <ChevronUp size={14} color="#64748b" />
            : <ChevronDown size={14} color="#64748b" />
          }
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Message bubble */}
          <div style={{
            background: '#0f172a', borderRadius: 12, padding: '12px 14px',
            border: `1px solid ${moodCfg.color}22`,
          }}>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
              "{msg.content}"
            </p>
          </div>

          {/* Responses */}
          {!msg.responded && msg.responses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sua resposta:
              </div>
              {msg.responses.map((resp, i) => (
                <button
                  key={i}
                  onClick={() => respondMessage(msg.id, i)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: '1px solid #334155',
                    background: '#1e293b', color: '#f1f5f9', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', textAlign: 'left', fontSize: 13,
                    display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#059669'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'; }}
                >
                  <span style={{ fontWeight: 600 }}>{resp.text}</span>
                  <span style={{
                    fontSize: 10,
                    color: resp.moralDelta > 0 ? '#10b981' : resp.moralDelta < 0 ? '#ef4444' : '#94a3b8',
                  }}>
                    {resp.moralDelta > 0 ? `+${resp.moralDelta}` : resp.moralDelta} moral do jogador
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Already responded */}
          {msg.responded && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,185,129,0.08)', borderRadius: 8, padding: '8px 12px',
              border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <Check size={14} color="#10b981" />
              <span style={{ fontSize: 12, color: '#10b981' }}>Você já respondeu esta mensagem.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const { state } = useMB();
  const save = state.save;
  const [filter, setFilter] = useState<'all' | 'unread' | 'unanswered'>('all');

  if (!save) return null;

  const messages = save.playerMessages ?? [];

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'unanswered') return !m.responded && m.responses.length > 0;
    return true;
  });

  const unread = messages.filter(m => !m.read).length;
  const unanswered = messages.filter(m => !m.responded && m.responses.length > 0).length;

  return (
    <div style={{ minHeight: '100%', background: '#0f172a', fontFamily: 'var(--font-body)', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 0',
        borderBottom: '1px solid #1e293b',
        background: '#0f172a',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Inbox size={16} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9' }}>Caixa de Entrada</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {unread > 0 ? `${unread} mensagem(ns) não lida(s)` : 'Tudo lido'}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 12 }}>
          {[
            { key: 'all', label: `Todas (${messages.length})` },
            { key: 'unread', label: `Não lidas (${unread})` },
            { key: 'unanswered', label: `Aguardando (${unanswered})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: filter === key ? '#3b82f6' : '#1e293b',
                color: filter === key ? '#fff' : '#94a3b8',
                fontWeight: 700, fontSize: 11, fontFamily: 'var(--font-body)',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Messages list */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '48px 20px', textAlign: 'center',
          }}>
            <MessageSquare size={40} color="#334155" />
            <div style={{ fontSize: 16, fontWeight: 800, color: '#475569' }}>Nenhuma mensagem</div>
            <div style={{ fontSize: 12, color: '#334155' }}>
              Os jogadores vão enviar mensagens conforme a temporada avança.
            </div>
          </div>
        ) : (
          filtered.map(msg => <MessageCard key={msg.id} msg={msg} />)
        )}
      </div>
    </div>
  );
}
