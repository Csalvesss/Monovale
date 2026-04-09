import React, { useEffect, useRef, useState } from 'react';
import { useMB } from '../../store/gameStore';
import { SAVE_KEY } from '../../constants';
import type { MBScreen } from '../../types';
import '../../styles/game.css';
import {
  Home, Users, ArrowLeftRight, Swords, BarChart2, DollarSign,
  Building2, MessageSquare, Rss, ChevronLeft, Trash2, CloudCheck,
  X, Trophy, Settings, Star,
} from 'lucide-react';

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  screen: MBScreen;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  hasBadge?: boolean;
}

const NAV: NavItem[] = [
  { screen: 'home',      icon: Home,           label: 'Início'     },
  { screen: 'squad',     icon: Users,          label: 'Elenco'     },
  { screen: 'market',    icon: ArrowLeftRight, label: 'Mercado'    },
  { screen: 'match',     icon: Swords,         label: 'Partida'    },
  { screen: 'standings', icon: BarChart2,      label: 'Tabela'     },
  { screen: 'inbox',     icon: MessageSquare,  label: 'Inbox', hasBadge: true },
  { screen: 'social',    icon: Rss,            label: 'Social'     },
  { screen: 'sponsor',   icon: DollarSign,     label: 'Patrocínio' },
  { screen: 'stadium',   icon: Building2,      label: 'Estádio'    },
];

// ─── Ticker Bar ───────────────────────────────────────────────────────────────

function TickerBar({ news }: { news: { content: string; type: string }[] }) {
  if (!news.length) return null;
  const items = [...news, ...news]; // duplicate for seamless loop
  return (
    <div className="ldb-ticker-wrap">
      <div className="ldb-ticker-inner">
        {items.map((n, i) => (
          <span key={i} className="ldb-ticker-item">
            <span style={{ fontSize: 10, opacity: 0.5 }}>⚽</span>
            {n.content.slice(0, 60)}{n.content.length > 60 ? '…' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Menu ────────────────────────────────────────────────────────────

function SettingsMenu({
  open, onClose, onBack, onDelete,
}: { open: boolean; onClose: () => void; onBack: () => void; onDelete: () => void }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(5,10,14,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 440,
          background: 'var(--ldb-void)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--ldb-border-mid)',
          borderBottom: 'none',
          padding: '24px 20px 36px',
          animation: 'ldb-slide-up 0.3s var(--ldb-ease-out)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--ldb-border-em)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 22, letterSpacing: '0.04em', color: 'var(--ldb-text)' }}>
            MENU
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--ldb-border)',
              color: 'var(--ldb-text-muted)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Auto-save */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(26,122,64,0.1)', border: '1px solid rgba(26,122,64,0.25)',
          borderRadius: 'var(--ldb-r-md)', padding: '12px 16px', marginBottom: 12,
        }}>
          <CloudCheck size={18} style={{ color: 'var(--ldb-text-success)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ldb-text-success)' }}>Salvo automaticamente</div>
            <div style={{ fontSize: 11, color: 'var(--ldb-text-muted)', marginTop: 2 }}>Seu progresso é salvo a cada ação</div>
          </div>
        </div>

        {/* Exit */}
        <button
          onClick={() => { onClose(); onBack(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border)',
            borderRadius: 'var(--ldb-r-md)', padding: '14px 16px', cursor: 'pointer',
            color: 'var(--ldb-text)', fontFamily: 'var(--ldb-font-body)',
            fontWeight: 600, fontSize: 14, marginBottom: 10,
            transition: 'background 200ms',
          }}
        >
          <ChevronLeft size={16} style={{ color: 'var(--ldb-text-muted)' }} />
          Sair para o Hub
        </button>

        {/* Delete */}
        <button
          onClick={() => { onClose(); onDelete(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.25)',
            borderRadius: 'var(--ldb-r-md)', padding: '14px 16px', cursor: 'pointer',
            color: 'var(--ldb-loss)', fontFamily: 'var(--ldb-font-body)',
            fontWeight: 600, fontSize: 14,
          }}
        >
          <Trash2 size={16} />
          Excluir save
        </button>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 70,
      background: 'rgba(5,10,14,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--ldb-surface)', border: '1px solid var(--ldb-border-mid)',
        borderRadius: 'var(--ldb-r-lg)', padding: '28px 24px',
        maxWidth: 320, width: '100%', textAlign: 'center',
        animation: 'ldb-scale-in 0.25s var(--ldb-ease-out)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: 'var(--ldb-font-display)', fontSize: 22, letterSpacing: '0.04em', color: 'var(--ldb-text)', marginBottom: 8 }}>
          EXCLUIR SAVE?
        </div>
        <p style={{ fontSize: 13, color: 'var(--ldb-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
          Todo o progresso será perdido permanentemente.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="ldb-btn-ghost" onClick={onClose} style={{ flex: 1, padding: '12px' }}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', background: 'rgba(255,85,85,0.2)',
              border: '1px solid rgba(255,85,85,0.4)', borderRadius: 'var(--ldb-r-md)',
              color: 'var(--ldb-loss)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--ldb-font-body)',
            }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function GameLayout({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  const { state, setScreen, dismissNotification } = useMB();
  const { notification, screen: currentScreen } = state;
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const notifRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadMessages = state.save?.unreadMessages ?? 0;
  const pendingOffers  = state.save?.pendingOffers.filter(o => o.status === 'pending').length ?? 0;
  const budget         = state.save?.budget ?? 0;
  const budgetK        = new Intl.NumberFormat('pt-BR').format(budget);
  const newsItems      = (state.save?.newsFeed ?? []).slice(0, 8).map(n => ({ content: n.content, type: n.type }));
  const isPlayerDetail = currentScreen === 'player-detail';

  // Auto-dismiss notifications
  useEffect(() => {
    if (!notification) return;
    if (notifRef.current) clearTimeout(notifRef.current);
    notifRef.current = setTimeout(dismissNotification, notification.type === 'legendary' ? 8000 : 3500);
    return () => { if (notifRef.current) clearTimeout(notifRef.current); };
  }, [notification, dismissNotification]);

  function handleDeleteSave() {
    localStorage.removeItem(SAVE_KEY);
    setDeleteOpen(false);
    onBack();
  }

  const notifColors: Record<string, { bg: string; border: string; color: string }> = {
    success:   { bg: 'rgba(26,122,64,0.15)',  border: 'rgba(26,122,64,0.35)',  color: 'var(--ldb-text-success)' },
    error:     { bg: 'rgba(255,85,85,0.12)',   border: 'rgba(255,85,85,0.35)',  color: 'var(--ldb-loss)'         },
    info:      { bg: 'rgba(15,30,46,0.9)',     border: 'var(--ldb-border-mid)', color: 'var(--ldb-text)'         },
    legendary: { bg: 'rgba(120,90,0,0.25)',    border: 'var(--ldb-border-gold)', color: 'var(--ldb-gold-bright)' },
  };
  const nc = notifColors[notification?.type ?? 'info'];

  return (
    <div className="ldb-game" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <header className="ldb-topbar">
        {/* Left: back/menu */}
        <button
          onClick={isPlayerDetail ? () => setScreen('squad') : () => setMenuOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--ldb-border)',
            borderRadius: 'var(--ldb-r-sm)', padding: '6px 12px',
            color: 'var(--ldb-text-muted)', cursor: 'pointer',
            fontFamily: 'var(--ldb-font-body)', fontWeight: 600, fontSize: 12,
            transition: 'all 200ms',
          }}
        >
          {isPlayerDetail
            ? <><ChevronLeft size={14} />Elenco</>
            : <><Settings size={13} />Menu</>}
        </button>

        {/* Center: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--ldb-pitch-bright), var(--ldb-pitch-dark))',
            border: '1px solid rgba(26,122,64,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={14} style={{ color: 'var(--ldb-gold-bright)' }} />
          </div>
          <span style={{
            fontFamily: 'var(--ldb-font-display)', fontSize: 18, letterSpacing: '0.06em',
            color: 'var(--ldb-text)',
          }}>
            LENDA DA BOLA
          </span>
        </div>

        {/* Right: Budget */}
        {state.save ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: 'var(--ldb-r-sm)', padding: '6px 12px',
          }}>
            <span style={{ fontSize: 10, color: 'var(--ldb-gold-mid)' }}>$</span>
            <span style={{
              fontFamily: 'var(--ldb-font-display)', fontSize: 15, letterSpacing: '0.04em',
              color: 'var(--ldb-gold-bright)',
            }}>
              {budgetK}k
            </span>
          </div>
        ) : (
          <div style={{ width: 80 }} />
        )}
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        {children}
      </main>

      {/* ── News ticker ── */}
      {newsItems.length > 0 && <TickerBar news={newsItems} />}

      {/* ── Bottom nav ── */}
      <nav className="ldb-nav">
        {NAV.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen ||
            (item.screen === 'squad' && currentScreen === 'player-detail');
          const badgeCount = item.screen === 'inbox' ? unreadMessages + pendingOffers : 0;
          return (
            <button
              key={item.screen}
              onClick={() => setScreen(item.screen)}
              className={`ldb-nav-item${isActive ? ' active' : ''}`}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={17} />
                {badgeCount > 0 && (
                  <div className="ldb-nav-badge">{badgeCount > 9 ? '9+' : badgeCount}</div>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Toast notification ── */}
      {notification && (
        <div
          onClick={dismissNotification}
          style={{
            position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            zIndex: 50, width: 'calc(100% - 32px)', maxWidth: 400,
            background: nc.bg, border: `1px solid ${nc.border}`,
            borderRadius: 'var(--ldb-r-md)', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            backdropFilter: 'blur(12px)', cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'ldb-slide-up 0.3s var(--ldb-ease-out)',
          }}
        >
          {notification.type === 'legendary' && (
            <Star size={16} style={{ color: 'var(--ldb-gold-bright)', flexShrink: 0 }} className="ldb-anim-pulsate" />
          )}
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: nc.color }}>
            {notification.message}
          </span>
          <X size={13} style={{ color: 'var(--ldb-text-muted)', flexShrink: 0 }} />
        </div>
      )}

      {/* ── Modals ── */}
      <SettingsMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onBack={onBack}
        onDelete={() => setDeleteOpen(true)}
      />
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteSave}
      />
    </div>
  );
}
