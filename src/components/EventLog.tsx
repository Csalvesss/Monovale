import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface Props {
  log: LogEntry[];
}

const TYPE_CONFIG: Record<LogEntry['type'], { accent: string; bg: string }> = {
  info:     { accent: '#94a3b8', bg: 'var(--card-alt)' },
  bank:     { accent: '#d97706', bg: '#fffbeb' },
  trade:    { accent: '#3b82f6', bg: '#eff6ff' },
  auction:  { accent: '#ea580c', bg: '#fff7ed' },
  jail:     { accent: '#dc2626', bg: '#fef2f2' },
  card:     { accent: '#7c3aed', bg: '#faf5ff' },
  bankrupt: { accent: '#991b1b', bg: '#fee2e2' },
  event:    { accent: '#059669', bg: '#ecfdf5' },
};

export default function EventLog({ log }: Props) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span style={S.headerTitle}>REGISTRO</span>
        <span style={S.bankerNote}>Sr. Marinho</span>
      </div>

      <div style={S.logList}>
        <div ref={topRef} />
        {log.map(entry => {
          const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.info;
          return (
            <div key={entry.id} style={{ ...S.entry, background: cfg.bg, borderLeftColor: cfg.accent }}>
              <span style={{ ...S.entryText, color: 'var(--text)' }}>{entry.text}</span>
            </div>
          );
        })}
        {log.length === 0 && (
          <div style={S.empty}>O Sr. Marinho está aguardando...</div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    height: '100%',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 14px',
    background: 'linear-gradient(90deg, #065F46, #059669)',
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    color: '#fff',
    letterSpacing: '1.5px',
    fontWeight: 700,
    flex: 1,
  },
  bankerNote: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.75)',
  },

  logList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },

  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    padding: '7px 10px',
    borderRadius: 8,
    borderLeft: '3px solid transparent',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  entryText: {
    fontSize: 11.5,
    lineHeight: 1.45,
    fontWeight: 500,
  },
  empty: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-light)',
    fontStyle: 'italic',
    padding: '20px 0',
  },
};
