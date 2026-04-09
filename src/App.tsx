import React, { useCallback, useEffect, useState } from 'react';
import Lobby from './components/Lobby';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import EventLog from './components/EventLog';
import ActionPanel from './components/ActionPanel';
import AuctionModal from './components/AuctionModal';
import TradeModal from './components/TradeModal';
import EndScreen from './components/EndScreen';
import LoginScreen from './components/LoginScreen';
import HomePage from './components/HomePage';
import { useAuth } from './contexts/AuthContext';
import { createGameDoc, saveGameState, finishGame } from './services/gameService';
import type { GameState, LobbyConfig, TradeState } from './types';
import {
  initGame, rollDice, buyProperty, startAuction, placeBid, passBid,
  endTurn, payJailFine, useJailCard, buildHouse, sellHouse,
  mortgageProperty, unmortgageProperty, proposeTrade, updateTrade,
  acceptTrade, cancelTrade, resolveCard,
} from './logic/gameEngine';

const STORAGE_KEY = 'monovale_game_state';
const BOARD_PX = 776; // CORNER*2 + CELL_W*9 — must match Board.tsx

type Screen = 'home' | 'lobby' | 'game';
type MobileTab = 'board' | 'players' | 'log';

// ── Responsive hook ───────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

// ── Board scale wrapper ───────────────────────────────────────────────────────
function ScaledBoard({ state, scale }: { state: GameState; scale: number }) {
  return (
    <div style={{ width: BOARD_PX * scale, height: BOARD_PX * scale, flexShrink: 0 }}>
      <div style={{ width: BOARD_PX, height: BOARD_PX, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Board state={state} />
      </div>
    </div>
  );
}

// ── Mobile tab bar ────────────────────────────────────────────────────────────
function MobileTabBar({ active, onChange }: { active: MobileTab; onChange: (t: MobileTab) => void }) {
  const tabs: { id: MobileTab; icon: string; label: string }[] = [
    { id: 'board',   icon: '🗺️', label: 'Tabuleiro' },
    { id: 'players', icon: '👥', label: 'Jogadores' },
    { id: 'log',     icon: '📋', label: 'Registro'  },
  ];
  return (
    <div style={TB.bar}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{ ...TB.btn, ...(active === t.id ? TB.btnActive : {}) }}
        >
          <span style={TB.icon}>{t.icon}</span>
          <span style={TB.label}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
const TB: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    background: 'var(--card)',
    borderTop: '2px solid var(--border-gold)',
    flexShrink: 0,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  btn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '8px 4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  btnActive: {
    background: 'var(--card-alt)',
    borderTop: '3px solid var(--gold)',
  },
  icon: { fontSize: 22 },
  label: { fontSize: 10, fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '0.3px' },
};

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading } = useAuth();
  const winW = useWindowWidth();

  const isMobile = winW < 768;
  const isTablet = winW >= 768 && winW < 1100;

  // Board scale: fit available width
  const mobileBoardPad = 16;
  const tabletSideW = 260;
  const mobileScale = Math.min(1, (winW - mobileBoardPad) / BOARD_PX);
  const tabletScale = Math.min(1, (winW - tabletSideW - 28) / BOARD_PX);

  const [screen, setScreen] = useState<Screen>('home');
  const [mobileTab, setMobileTab] = useState<MobileTab>('board');
  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        if (parsed.phase === 'playing') return parsed;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [finishedGameId, setFinishedGameId] = useState<string | null>(null);

  useEffect(() => {
    if (gameState?.phase === 'playing') setScreen('game');
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!gameState) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    if (gameState.gameId) saveGameState(gameState.gameId, gameState);
  }, [gameState]);

  useEffect(() => {
    if (gameState?.phase === 'ended' && gameState.gameId && gameState.gameId !== finishedGameId) {
      setFinishedGameId(gameState.gameId);
      finishGame(gameState).catch(e => console.warn('finishGame error:', e));
    }
  }, [gameState?.phase, gameState?.gameId]); // eslint-disable-line

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setGameState(prev => prev ? fn(prev) : prev);
  }, []);

  async function handleStart(config: LobbyConfig) {
    const players = config.players.map(p => ({ uid: p.uid ?? null, displayName: p.name, pawnId: p.pawnId }));
    let gameId: string | null = null;
    try { gameId = await createGameDoc(user?.uid ?? null, players); } catch { /* offline */ }
    setGameState(initGame(config, gameId));
    setScreen('game');
    setMobileTab('board');
  }

  function clearGame() {
    setGameState(null);
    setFinishedGameId(null);
    localStorage.removeItem(STORAGE_KEY);
    setScreen('home');
  }

  // ── Loading ──
  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingCard}>
          <div style={{ fontSize: 56, marginBottom: 8, lineHeight: 1 }}>🗺️</div>
          <div style={S.loadingTitle}>MONOVALE</div>
          <div style={S.loadingSpinner} />
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (screen === 'home') return <HomePage onStartGame={() => setScreen('lobby')} />;
  if (screen === 'lobby') return <Lobby onStart={handleStart} onBack={() => setScreen('home')} />;

  if (!gameState || gameState.phase === 'lobby') { setScreen('lobby'); return null; }

  // ── Shared action props ──
  const actionProps = {
    state: gameState,
    onRoll: () => update(rollDice),
    onBuy: () => update(buyProperty),
    onAuction: () => update(startAuction),
    onEndTurn: () => update(endTurn),
    onResolveCard: () => update(resolveCard),
    onPayJail: () => update(payJailFine),
    onUseJailCard: () => update(useJailCard),
    onProposeTrade: (idx: number) => update(s => proposeTrade(s, idx)),
    onBuildHouse: (pos: number) => update(s => buildHouse(s, pos)),
    onSellHouse: (pos: number) => update(s => sellHouse(s, pos)),
    onMortgage: (pos: number) => update(s => mortgageProperty(s, pos)),
    onUnmortgage: (pos: number) => update(s => unmortgageProperty(s, pos)),
  };

  // ── Shared modals ──
  const modals = (
    <>
      {gameState.turnPhase === 'auction' && gameState.auction && (
        <AuctionModal state={gameState}
          onBid={(pid, amt) => update(s => placeBid(s, pid, amt))}
          onPass={(pid) => update(s => passBid(s, pid))} />
      )}
      {gameState.turnPhase === 'trade' && gameState.trade && (
        <TradeModal state={gameState}
          onUpdate={(trade: TradeState) => update(s => updateTrade(s, trade))}
          onAccept={() => update(acceptTrade)}
          onCancel={() => update(cancelTrade)} />
      )}
      {gameState.phase === 'ended' && (
        <EndScreen state={gameState} onNewGame={clearGame} />
      )}
      {showConfirm && (
        <div style={S.overlay}>
          <div style={S.confirmBox}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
            <div style={S.confirmTitle}>Nova Partida?</div>
            <p style={S.confirmText}>O progresso atual será perdido.</p>
            <div style={S.confirmBtns}>
              <button onClick={() => { setShowConfirm(false); clearGame(); }} style={S.confirmBtnYes}>Sim</button>
              <button onClick={() => setShowConfirm(false)} style={S.confirmBtnNo}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── Top bar (shared) ──
  const topBar = (
    <div style={S.topBar}>
      <div style={S.topLogo}>
        <span style={{ fontSize: isMobile ? 22 : 28 }}>🗺️</span>
        <span style={{ ...S.topTitle, fontSize: isMobile ? 22 : 28 }}>MONOVALE</span>
        {!isMobile && <span style={S.topSub}>Vale do Paraíba</span>}
      </div>
      <div style={S.topRight}>
        {!isMobile && <span style={S.bankerTag}>🏦 Sr. Marinho</span>}
        <button onClick={() => gameState?.phase === 'playing' ? setShowConfirm(true) : clearGame()} style={S.newGameBtn}>
          {isMobile ? '🔄' : '🔄 Nova Partida'}
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // MOBILE layout
  // ════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
        {topBar}

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Board tab */}
          {mobileTab === 'board' && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 12px' }}>
              <ScaledBoard state={gameState} scale={mobileScale} />
              <div style={{ width: '100%', padding: '0 8px' }}>
                <ActionPanel {...actionProps} />
              </div>
            </div>
          )}
          {/* Players tab */}
          {mobileTab === 'players' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              <PlayerPanel state={gameState} />
            </div>
          )}
          {/* Log tab */}
          {mobileTab === 'log' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '8px' }}>
              <EventLog log={gameState.log} />
            </div>
          )}
        </div>

        <MobileTabBar active={mobileTab} onChange={t => setMobileTab(t)} />
        {modals}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // TABLET layout
  // ════════════════════════════════════════════════════════════════
  if (isTablet) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
        {topBar}
        <div style={{ flex: 1, display: 'flex', gap: 8, padding: 8, overflow: 'hidden', minHeight: 0 }}>
          {/* Center */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', gap: 8, minWidth: 0 }}>
            <ScaledBoard state={gameState} scale={tabletScale} />
            <div style={{ width: '100%' }}>
              <ActionPanel {...actionProps} />
            </div>
          </div>
          {/* Right side */}
          <div style={{ width: tabletSideW, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ flex: '0 0 auto', maxHeight: '50%', overflowY: 'auto' }}>
              <PlayerPanel state={gameState} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <EventLog log={gameState.log} />
            </div>
          </div>
        </div>
        {modals}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // DESKTOP layout
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={S.root}>
      {topBar}
      <div style={S.layout}>
        <div style={S.leftPanel}><PlayerPanel state={gameState} /></div>
        <div style={S.center}>
          <div style={S.boardWrapper}><Board state={gameState} /></div>
          <div style={S.actionWrapper}><ActionPanel {...actionProps} /></div>
        </div>
        <div style={S.rightPanel}><EventLog log={gameState.log} /></div>
      </div>
      {modals}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  loadingPage: {
    minHeight: '100dvh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
  },
  loadingCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '40px 56px',
    textAlign: 'center',
  },
  loadingTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 36,
    color: 'var(--text)',
    letterSpacing: '2px',
    marginBottom: 20,
  },
  loadingSpinner: {
    width: 36, height: 36,
    border: '4px solid var(--border)',
    borderTop: '4px solid var(--gold)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
  },

  root: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    fontFamily: 'var(--font-body)',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: 52,
    background: 'var(--gold-grad)',
    boxShadow: '0 3px 0 var(--gold-dark), 0 4px 12px rgba(0,0,0,0.15)',
    flexShrink: 0,
    zIndex: 10,
  },
  topLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  topTitle: {
    fontFamily: 'var(--font-title)',
    color: 'var(--text)',
    letterSpacing: '1.5px',
    textShadow: '1px 1px 0 rgba(255,255,255,0.4)',
    lineHeight: 1,
  },
  topSub: { fontSize: 12, fontWeight: 700, color: 'var(--text)', opacity: 0.6 },
  topRight: { display: 'flex', alignItems: 'center', gap: 10 },
  bankerTag: { fontSize: 13, fontWeight: 700, color: 'var(--text)', opacity: 0.7 },
  newGameBtn: {
    padding: '7px 14px',
    background: 'var(--red-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 99,
    fontFamily: 'var(--font-body)',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 3px 0 var(--red-dark)',
  },

  layout: {
    flex: 1,
    display: 'flex',
    gap: 10,
    padding: '10px',
    overflow: 'hidden',
    minHeight: 0,
  },
  leftPanel: {
    width: 210,
    flexShrink: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    overflowY: 'auto',
    minWidth: 0,
  },
  boardWrapper: { flexShrink: 0 },
  actionWrapper: { width: '100%', maxWidth: 800, paddingBottom: 8 },
  rightPanel: {
    width: 260,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 3000,
    backdropFilter: 'blur(4px)',
    padding: 16,
  },
  confirmBox: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '32px 28px',
    maxWidth: 340,
    width: '100%',
    textAlign: 'center',
    animation: 'pop-in 0.25s ease',
  },
  confirmTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 28,
    color: 'var(--text)',
    marginBottom: 8,
  },
  confirmText: { fontSize: 14, color: 'var(--text-mid)', fontWeight: 600, margin: '0 0 20px' },
  confirmBtns: { display: 'flex', gap: 10 },
  confirmBtnYes: {
    flex: 1, padding: '14px',
    background: 'var(--red-grad)', color: '#fff',
    border: 'none', borderRadius: 'var(--radius)',
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 4px 0 var(--red-dark)',
    fontFamily: 'var(--font-body)',
  },
  confirmBtnNo: {
    flex: 1, padding: '14px',
    background: 'var(--card-alt)', color: 'var(--text)',
    border: '2px solid var(--border)', borderRadius: 'var(--radius)',
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 4px 0 var(--border)',
    fontFamily: 'var(--font-body)',
  },
};
