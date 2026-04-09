import React, { useEffect } from 'react';
import { useMB } from '../../store/gameStore';
import type { MBScreen } from '../../types';
import {
  Home, Users, ArrowLeftRight, Swords, BarChart2, Rss,
  DollarSign, Building2, Star, X, Trophy, TrendingUp,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface NavItem {
  screen: MBScreen;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const NAV: NavItem[] = [
  { screen: 'home',      icon: Home,          label: 'Início'     },
  { screen: 'squad',     icon: Users,         label: 'Elenco'     },
  { screen: 'market',    icon: ArrowLeftRight, label: 'Mercado'   },
  { screen: 'match',     icon: Swords,        label: 'Partida'    },
  { screen: 'standings', icon: BarChart2,     label: 'Tabela'     },
  { screen: 'social',    icon: Rss,           label: 'Social'     },
  { screen: 'sponsor',   icon: DollarSign,    label: 'Patrocínio' },
  { screen: 'stadium',   icon: Building2,     label: 'Estádio'    },
];

const NOTIF_STYLES: Record<string, { bar: string; text: string; icon: typeof Star | null }> = {
  success:   { bar: 'bg-emerald-600/20 border-emerald-600/40', text: 'text-emerald-300', icon: null },
  error:     { bar: 'bg-red-600/20 border-red-600/40',         text: 'text-red-300',     icon: null },
  info:      { bar: 'bg-blue-600/20 border-blue-600/40',       text: 'text-blue-300',    icon: null },
  legendary: { bar: 'bg-amber-600/20 border-amber-600/40',     text: 'text-amber-300',   icon: Star },
};

export default function GameLayout({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  const { state, setScreen, dismissNotification } = useMB();
  const { notification, screen: currentScreen } = state;

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(dismissNotification, notification.type === 'legendary' ? 8000 : 3000);
    return () => clearTimeout(t);
  }, [notification, dismissNotification]);

  const isPlayerDetail = currentScreen === 'player-detail';
  const ns = NOTIF_STYLES[notification?.type ?? 'info'];

  const budget = state.save?.budget ?? 0;
  const budgetFormatted = new Intl.NumberFormat('pt-BR').format(budget);

  return (
    <div className="flex flex-col h-dvh bg-[#0f172a] font-sans text-slate-100 overflow-hidden">

      {/* ── Top bar ── */}
      <header className="flex h-[52px] shrink-0 items-center justify-between bg-gradient-to-r from-slate-900 to-[#1e3a5f] border-b border-slate-700/50 px-4 z-20">
        <button
          onClick={isPlayerDetail ? () => state.save && setScreen('squad') : onBack}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={14} />
          {isPlayerDetail ? 'Elenco' : 'Sair'}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-600/30">
            <Trophy size={14} className="text-blue-400" />
          </div>
          <span className="font-black text-[15px] text-white tracking-tight"
            style={{ fontFamily: 'var(--font-title)' }}>
            Lenda da Bola
          </span>
        </div>

        {state.save ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5">
            <DollarSign size={12} className="text-amber-400" />
            <span className="text-xs font-black text-amber-400">${budgetFormatted}k</span>
          </div>
        ) : (
          <div className="w-[72px]" />
        )}
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <nav className="shrink-0 border-t border-slate-700/50 bg-slate-900 z-20 overflow-x-auto">
        <div className="flex min-w-max">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen ||
              (item.screen === 'squad' && currentScreen === 'player-detail');
            return (
              <button
                key={item.screen}
                onClick={() => setScreen(item.screen)}
                className={cn(
                  'flex min-w-[60px] flex-col items-center justify-center gap-1 px-3 py-2.5 transition-all duration-150 border-t-2',
                  isActive
                    ? 'border-blue-500 bg-blue-600/10 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                )}
              >
                <Icon size={18} />
                <span className="text-[9px] font-bold tracking-wide whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Notification toast ── */}
      {notification && (
        <div
          onClick={dismissNotification}
          className={cn(
            'fixed bottom-[72px] left-1/2 z-50 -translate-x-1/2 cursor-pointer',
            'w-[calc(100%-32px)] max-w-sm rounded-2xl border px-4 py-3',
            'flex items-center gap-3 shadow-2xl shadow-black/50',
            'animate-pop-in',
            ns.bar
          )}
        >
          {notification.type === 'legendary' && (
            <Star size={18} className="text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
          )}
          <p className={cn('flex-1 text-sm font-bold', ns.text)}>{notification.message}</p>
          <X size={14} className="shrink-0 text-slate-400 hover:text-slate-200" />
        </div>
      )}
    </div>
  );
}
