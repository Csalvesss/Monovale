import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Trophy, Home, Users, ShoppingBag, BarChart2, DollarSign, RotateCcw } from 'lucide-react';
import '../../styles/lenda.css';
import { useGameStore } from '../../store/gameStore';
import { useSquadStore } from '../../store/squadStore';
import { TEAMS } from '../../data/initialData';
import { LEGENDARY_PLAYERS } from '../../data/players';
import HomeScreen from '../screens/HomeScreen';
import SquadScreen from '../screens/SquadScreen';
import MatchScreen from '../screens/MatchScreen';
import MarketScreen from '../screens/MarketScreen';
import StandingsScreen from '../screens/StandingsScreen';
import SponsorScreen from '../screens/SponsorScreen';
import PackOpening from '../ui/PackOpening';
import type { LDBScreen } from '../../types/game';

interface NavItem {
  id: LDBScreen;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
}

const NAV: NavItem[] = [
  { id: 'home',      icon: Home,       label: 'Início'     },
  { id: 'squad',     icon: Users,      label: 'Seleção'    },
  { id: 'market',    icon: ShoppingBag, label: 'Mercado'   },
  { id: 'standings', icon: BarChart2,  label: 'Tabela'     },
  { id: 'sponsor',   icon: DollarSign, label: 'Patrocínio' },
];

interface Props {
  onBack: () => void;
}

export default function GameLayout({ onBack }: Props) {
  const [screen, setScreen]     = useState<LDBScreen>('home');
  const [showPack, setShowPack] = useState(false);
  const [packLegend, setPackLegend] = useState<typeof LEGENDARY_PLAYERS[0] | null>(null);
  const [showReset, setShowReset]   = useState(false);
  const { budget, userTeamId, resetGame } = useGameStore();
  const { addPlayer }               = useSquadStore();

  const userTeam  = TEAMS.find(t => t.id === (userTeamId ?? 'brazil'));
  const budgetStr = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(budget);

  // Auto-trigger pack opening once per session
  useEffect(() => {
    if (sessionStorage.getItem('ldb-pack-shown')) return;
    const timer = setTimeout(() => {
      const legend = LEGENDARY_PLAYERS[Math.floor(Math.random() * LEGENDARY_PLAYERS.length)];
      setPackLegend(legend);
      setShowPack(true);
      sessionStorage.setItem('ldb-pack-shown', '1');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  function handlePackCollect() {
    if (packLegend) addPlayer(packLegend);
    setShowPack(false);
    setPackLegend(null);
  }

  function handleReset() {
    resetGame();
    sessionStorage.removeItem('ldb-pack-shown');
    setShowReset(false);
    setScreen('home');
  }

  const screenContent = (() => {
    switch (screen) {
      case 'home':      return <HomeScreen onNavigate={setScreen} />;
      case 'squad':     return <SquadScreen />;
      case 'match':     return <MatchScreen />;
      case 'market':    return <MarketScreen />;
      case 'standings': return <StandingsScreen />;
      case 'sponsor':   return <SponsorScreen />;
      default:          return <HomeScreen onNavigate={setScreen} />;
    }
  })();

  return (
    <div
      className="lenda-root"
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* ── Top bar ── */}
      <header className="lenda-topbar">
        {/* Left: back */}
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-sm)',
            padding: '6px 12px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontWeight: 600, fontSize: 12,
          }}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Sair
        </button>

        {/* Center: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--wc-gold), var(--wc-gold-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={14} strokeWidth={2} style={{ color: '#000' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18, letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}>
            LENDA DA BOLA
          </span>
        </div>

        {/* Right: budget + flag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--r-sm)',
            padding: '5px 10px',
          }}>
            {userTeam && <span style={{ fontSize: 14 }}>{userTeam.badge}</span>}
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.04em',
              color: 'var(--wc-gold)',
            }}>
              €{budgetStr}
            </span>
          </div>
          <button
            onClick={() => setShowReset(true)}
            title="Reiniciar jogo"
            style={{
              width: 28, height: 28,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <RotateCcw size={12} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main
        key={screen}
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          animation: 'lenda-fade-up 0.25s var(--ease-out) both',
        }}
      >
        {screenContent}
      </main>

      {/* ── Bottom nav ── */}
      <nav className="lenda-nav">
        {NAV.map(item => {
          const Icon = item.icon;
          const isActive = screen === item.id || (item.id === 'home' && screen === 'match');
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`lenda-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.5} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Pack Opening overlay ── */}
      {showPack && packLegend && (
        <PackOpening player={packLegend} onCollect={handlePackCollect} />
      )}

      {/* ── Reset confirmation ── */}
      {showReset && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowReset(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: 320,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-lg)',
              padding: '28px 24px', textAlign: 'center',
              animation: 'lenda-pop-in 0.25s var(--ease-out)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 22,
              letterSpacing: '0.06em', color: 'var(--text-primary)', marginBottom: 8,
            }}>
              REINICIAR JOGO?
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
              Todo o progresso será apagado permanentemente.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="lenda-btn-ghost"
                onClick={() => setShowReset(false)}
                style={{ flex: 1, padding: '12px', fontSize: 14, borderRadius: 'var(--r-md)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: '12px',
                  background: '#b91c1c',
                  border: 'none', borderRadius: 'var(--r-md)',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
