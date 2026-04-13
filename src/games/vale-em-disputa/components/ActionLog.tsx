// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Action Log
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface Props {
  log: LogEntry[];
}

const TYPE_COLORS: Record<string, string> = {
  combat: '#fca5a5',
  reinforce: '#86efac',
  move: '#93c5fd',
  card: '#c4b5fd',
  gold: '#fcd34d',
  faction: '#f9a8d4',
  system: '#94a3b8',
};

const TYPE_ICONS: Record<string, string> = {
  combat: '⚔️',
  reinforce: '🛡️',
  move: '➡️',
  card: '🃏',
  gold: '💰',
  faction: '⭐',
  system: '📢',
};

export default function ActionLog({ log }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: '#0f172a',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        fontSize: 11, fontWeight: 700,
        color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase',
      }}>
        Registro de Ações
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 4px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {log.length === 0 && (
          <div style={{ color: '#475569', fontSize: 12, textAlign: 'center', padding: 20 }}>
            Aguardando ações...
          </div>
        )}
        {log.slice(-60).map(entry => (
          <div key={entry.id} style={{
            padding: '5px 10px',
            borderRadius: 6,
            display: 'flex', alignItems: 'flex-start', gap: 6,
            background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{ fontSize: 12, lineHeight: 1.5, flexShrink: 0 }}>
              {TYPE_ICONS[entry.type] ?? '•'}
            </span>
            <div>
              <span style={{
                fontSize: 11, lineHeight: 1.5,
                color: TYPE_COLORS[entry.type] ?? '#cbd5e1',
              }}>
                {entry.text}
              </span>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>
                {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
