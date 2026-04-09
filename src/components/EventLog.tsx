import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface Props {
  log: LogEntry[];
}

const TYPE_CONFIG: Record<LogEntry['type'], { icon: string; accent: string; bg: string }> = {
  info:     { icon: '📋', accent: 'var(--text-light)', bg: 'var(--card-alt)' },
  bank:     { icon: '🏦', accent: 'var(--gold-dark)',  bg: '#fef9e7' },
  trade:    { icon: '🤝', accent: 'var(--blue)',       bg: '#eff6ff' },
  auction:  { icon: '🔨', accent: '#ea580c',           bg: '#fff7ed' },
  jail:     { icon: '🚔', accent: 'var(--red)',        bg: '#fef2f2' },
  card:     { icon: '🎟️', accent: 'var(--purple)',     bg: '#faf5ff' },
  bankrupt: { icon: '💀', accent: 'var(--red-dark)',   bg: '#fee2e2' },
};

export default function EventLog({ log }: Props) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <span style={S.headerIcon}>📋</span>
        <span style={S.headerTitle}>REGISTRO</span>
        <span style={S.bankerNote}>Sr. Marinho</span>
      </div>

      <div style={S.logList}>
        <div ref={topRef} />
        {log.map(entry => {
          const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.info;
          return (
            <div key={entry.id} style={{ ...S.entry, background: cfg.bg, borderLeftColor: cfg.accent }}>
              <span style={S.entryIcon}>{cfg.icon}</span>
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
    border: '2px solid var(--border-gold)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    height: '100%',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'var(--gold-grad)',
    flexShrink: 0,
  },
  headerIcon: { fontSize: 16 },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 17,
    color: 'var(--text)',
    letterSpacing: '1px',
    flex: 1,
  },
  bankerNote: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text)',
    opacity: 0.65,
  },

  logList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },

  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 7,
    padding: '8px 10px',
    borderRadius: 10,
    borderLeft: '3px solid transparent',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  entryIcon: { fontSize: 13, flexShrink: 0, marginTop: 1 },
  entryText: {
    fontSize: 11.5,
    lineHeight: 1.45,
    fontWeight: 600,
  },
  empty: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-light)',
    fontStyle: 'italic',
    padding: '20px 0',
  },
};
