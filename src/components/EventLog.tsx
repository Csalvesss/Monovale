import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface Props {
  log: LogEntry[];
}

export default function EventLog({ log }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>📋</span> Registro do Sr. Marinho
      </div>
      <div style={styles.logList}>
        {[...log].reverse().map(entry => (
          <div key={entry.id} style={{ ...styles.entry, ...getEntryStyle(entry.type) }}>
            <span style={styles.entryText}>{entry.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function getEntryStyle(type: LogEntry['type']): React.CSSProperties {
  const map: Record<LogEntry['type'], React.CSSProperties> = {
    info:     { borderLeftColor: '#6b7280' },
    bank:     { borderLeftColor: '#d4af37', background: 'rgba(212,175,55,0.07)' },
    trade:    { borderLeftColor: '#3b82f6', background: 'rgba(59,130,246,0.07)' },
    auction:  { borderLeftColor: '#f97316', background: 'rgba(249,115,22,0.07)' },
    jail:     { borderLeftColor: '#ef4444', background: 'rgba(239,68,68,0.07)' },
    card:     { borderLeftColor: '#a855f7', background: 'rgba(168,85,247,0.07)' },
    bankrupt: { borderLeftColor: '#dc2626', background: 'rgba(220,38,38,0.1)' },
  };
  return map[type] ?? {};
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(15, 36, 24, 0.95)',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    fontWeight: 700,
    fontSize: 13,
    color: '#d4af37',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
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
    padding: '7px 10px',
    borderRadius: 6,
    borderLeft: '3px solid transparent',
    background: 'rgba(255,255,255,0.03)',
  },
  entryText: {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 1.4,
  },
};
