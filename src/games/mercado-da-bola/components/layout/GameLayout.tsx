import React, { useEffect } from 'react';
import { useMB } from '../../store/gameStore';
import type { MBScreen } from '../../types';

interface NavItem {
  screen: MBScreen;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { screen: 'home',      icon: '🏠', label: 'Início'    },
  { screen: 'squad',     icon: '👕', label: 'Elenco'    },
  { screen: 'market',    icon: '🔄', label: 'Mercado'   },
  { screen: 'match',     icon: '⚽', label: 'Partida'   },
  { screen: 'standings', icon: '📊', label: 'Tabela'    },
  { screen: 'social',    icon: '📱', label: 'Social'    },
  { screen: 'sponsor',   icon: '💰', label: 'Patrocínio'},
  { screen: 'stadium',   icon: '🏟️', label: 'Estádio'  },
];

export default function GameLayout({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  const { state, setScreen, dismissNotification } = useMB();
  const { notification } = state;

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(dismissNotification, notification.type === 'legendary' ? 8000 : 3000);
    return () => clearTimeout(t);
  }, [notification, dismissNotification]);

  const notifColors: Record<string, { bg: string; color: string; border: string }> = {
    success:  { bg: '#064e3b', color: '#6ee7b7', border: '#065f46' },
    error:    { bg: '#7f1d1d', color: '#fca5a5', border: '#991b1b' },
    info:     { bg: '#1e3a5f', color: '#93c5fd', border: '#1d4ed8' },
    legendary:{ bg: '#78350f', color: '#fde68a', border: '#d97706' },
  };
  const nc = notifColors[notification?.type ?? 'info'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0f172a', fontFamily: 'var(--font-body)', color: '#f1f5f9', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 50, background: 'linear-gradient(90deg, #1e3a5f, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, zIndex: 20 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          ← Sair
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚽</span>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 16, color: '#fff' }}>Mercado da Bola</span>
        </div>
        {state.save && (
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fde68a' }}>
            💰 ${state.save.budget.toLocaleString('pt-BR')}k
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* Bottom nav */}
      <nav style={{ background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', flexShrink: 0, overflowX: 'auto', zIndex: 20 }}>
        {NAV.map(item => {
          const active = state.screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => setScreen(item.screen)}
              style={{
                flex: '0 0 auto', minWidth: 60,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, padding: '8px 10px',
                background: active ? 'rgba(59,130,246,0.2)' : 'none',
                border: 'none', borderTop: active ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer', color: active ? '#60a5fa' : '#94a3b8',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Notification toast */}
      {notification && (
        <div
          onClick={dismissNotification}
          style={{
            position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
            background: nc.bg, color: nc.color, border: `1px solid ${nc.border}`,
            borderRadius: 12, padding: '12px 20px',
            maxWidth: 360, width: 'calc(100% - 32px)',
            fontSize: 13, fontWeight: 700, textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 1000, cursor: 'pointer',
            animation: 'pop-in 0.25s ease',
          }}
        >
          {notification.type === 'legendary' && <div style={{ fontSize: 24, marginBottom: 4 }}>🌟</div>}
          {notification.message}
        </div>
      )}
    </div>
  );
}
