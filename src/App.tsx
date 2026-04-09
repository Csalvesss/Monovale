import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, LayoutGrid, Users, FileText, Key, HelpCircle } from 'lucide-react';
import Lobby from './components/Lobby';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import EventLog from './components/EventLog';
import ActionPanel from './components/ActionPanel';
import AuctionModal from './components/AuctionModal';
import HelpModal from './components/HelpModal';
import TradeModal from './components/TradeModal';
import EventModal from './components/EventModal';
import EndScreen from './components/EndScreen';
import LoginScreen from './components/LoginScreen';
import HomePage from './components/HomePage';
import JoinRoom from './components/JoinRoom';
import RoomLobby from './components/RoomLobby';
import { useAuth } from './contexts/AuthContext';
import {
  createGameDoc, saveGameState, saveGameStateNow, finishGame, cancelPendingGameSave,
} from './services/gameService';
import { createRoom, joinRoom, listenRoom, listenGameState } from './services/roomService';
import type { GameState, LobbyConfig, TradeState } from './types';
import {
  initGame, rollDice, buyProperty, startAuction, placeBid, passBid,
  endTurn, payJailFine, useJailCard, buildHouse, sellHouse,
  mortgageProperty, unmortgageProperty, proposeTrade, updateTrade,
  acceptTrade, cancelTrade, resolveCard, resolveEventCard,
} from './logic/gameEngine';

const STORAGE_KEY = 'monovale_game_state';
const BOARD_PX = 830; // CORNER*2 + CELL_W*9 = 100*2 + 72*9

type Screen = 'home' | 'lobby' | 'join-room' | 'room-lobby' | 'game';
type MobileTab = 'board' | 'players' | 'log';

function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

function ScaledBoard({ state, scale }: { state: GameState; scale: number }) {
  return (
    <div style={{ width: BOARD_PX * scale, height: BOARD_PX * scale, flexShrink: 0 }}>
      <div style={{ width: BOARD_PX, height: BOARD_PX, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Board state={state} />
      </div>
    </div>
  );
}

function MobileTabBar({ active, onChange }: { active: MobileTab; onChange: (t: MobileTab) => void }) {
  const tabs: { id: MobileTab; Icon: React.FC<{ size?: number; color?: string }>; label: string }[] = [
    { id: 'board',   Icon: LayoutGrid, label: 'Tabuleiro' },
    { id: 'players', Icon: Users,      label: 'Jogadores'  },
    { id: 'log',     Icon: FileText,   label: 'Registro'   },
  ];
  return (
    <div style={TB.bar}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ ...TB.btn, ...(active === t.id ? TB.active : {}) }}>
          <t.Icon size={20} color={active === t.id ? 'var(--green)' : 'var(--text-mid)'} />
          <span style={{ ...TB.label, ...(active === t.id ? { color: 'var(--green)' } : {}) }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
const TB: Record<string, React.CSSProperties> = {
  bar: { display: 'flex', background: 'var(--card)', borderTop: '1px solid var(--border)', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' },
  btn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 4px', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' },
  active: { background: 'rgba(5,150,105,0.06)' },
  label: { fontSize: 10, fontWeight: 700, color: 'var(--text-mid)', letterSpacing: '0.3px' },
};

export default function App() {
  const { user, profile, loading, logout } = useAuth();
  const winW = useWindowWidth();
  const isMobile = winW < 768;
  const isTablet = winW >= 768 && winW < 1100;
  const mobileScale  = Math.min(1, (winW - 16) / BOARD_PX);
  const tabletScale  = Math.min(1, (winW - 276) / BOARD_PX);

  const [screen, setScreen] = useState<Screen>('home');
  const [mobileTab, setMobileTab] = useState<MobileTab>('board');
  const [roomCode, setRoomCode] = useState<string | null>(null);

  // ── Game state ──
  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        // Validate required fields — discard stale saves from older versions
        if (
          parsed.phase === 'playing' &&
          Array.isArray(parsed.players) &&
          Array.isArray(parsed.spaces) &&
          Array.isArray(parsed.dice)
        ) {
          // Backfill new fields for saves from before Evento do Vale
          if (parsed.pendingEvent === undefined) parsed.pendingEvent = null;
          if (parsed.roundNumber === undefined) parsed.roundNumber = 1;
          if (parsed.doubleNextRent === undefined) parsed.doubleNextRent = false;
          if (parsed.skipNextRent === undefined) parsed.skipNextRent = false;
          if (parsed.recentEventIds === undefined) parsed.recentEventIds = [];
          return parsed;
        }
        // Stale/incompatible save — remove it
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch { /* ignore */ }
    return null;
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [finishedGameId, setFinishedGameId] = useState<string | null>(null);

  // Real-time room game flags
  const isRoomGame = !!roomCode;
  const isLocalActionRef = useRef(false);
  const roomListenerRef = useRef<(() => void) | null>(null);
  const gameListenerRef = useRef<(() => void) | null>(null);

  // Restore in-progress game on mount
  useEffect(() => {
    if (gameState?.phase === 'playing') setScreen('game');
  }, []); // eslint-disable-line

  // Persist locally + to Firestore
  useEffect(() => {
    if (!gameState) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));

    if (isRoomGame) {
      // Room game: save immediately only when WE acted
      if (isLocalActionRef.current && gameState.gameId) {
        isLocalActionRef.current = false;
        saveGameStateNow(gameState.gameId, gameState);
      }
    } else {
      // Local game: debounced save
      if (gameState.gameId) saveGameState(gameState.gameId, gameState);
    }
  }, [gameState]); // eslint-disable-line

  // Detect game ended
  useEffect(() => {
    if (gameState?.phase === 'ended' && gameState.gameId && gameState.gameId !== finishedGameId) {
      setFinishedGameId(gameState.gameId);
      finishGame(gameState).catch(e => console.warn('finishGame error:', e));
    }
  }, [gameState?.phase, gameState?.gameId]); // eslint-disable-line

  // Room listener: update players list + detect game start for guests
  useEffect(() => {
    if (!roomCode) return;
    roomListenerRef.current?.();
    roomListenerRef.current = listenRoom(roomCode, (room) => {
      if (room.status === 'playing' && room.gameId && screen !== 'game') {
        // Guest: host started the game → start listening to game state
        startGameListener(room.gameId);
        setScreen('game');
        setMobileTab('board');
      }
    });
    return () => roomListenerRef.current?.();
  }, [roomCode, screen]); // eslint-disable-line

  function startGameListener(gameId: string) {
    gameListenerRef.current?.();
    gameListenerRef.current = listenGameState(gameId, (remoteState) => {
      isLocalActionRef.current = false;
      setGameState(remoteState);
    });
  }

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setGameState(prev => prev ? fn(prev) : prev);
  }, []);

  // For room games: mark as local action before updating
  function act(fn: (s: GameState) => GameState) {
    if (isRoomGame) isLocalActionRef.current = true;
    update(fn);
  }

  // ── Local game start (Lobby) ──
  async function handleStart(config: LobbyConfig) {
    cancelPendingGameSave();
    localStorage.removeItem(STORAGE_KEY);
    const players = config.players.map(p => ({ uid: p.uid ?? null, displayName: p.name, pawnId: p.pawnId }));
    let gameId: string | null = null;
    try { gameId = await createGameDoc(user?.uid ?? null, players); } catch { /* offline */ }
    setGameState(initGame(config, gameId));
    setScreen('game');
    setMobileTab('board');
  }

  // ── Create room ──
  async function handleCreateRoom() {
    if (!profile) return;
    const code = await createRoom(profile);
    setRoomCode(code);
    setScreen('room-lobby');
  }

  // ── Join room ──
  async function handleJoinRoom(code: string) {
    if (!profile) return;
    await joinRoom(code, { uid: profile.uid, displayName: profile.displayName, pawnId: profile.pawnId });
    setRoomCode(code.toUpperCase());
    setScreen('room-lobby');
  }

  // ── Host starts room game ──
  function handleRoomGameStart(gameId: string) {
    startGameListener(gameId);
    setScreen('game');
    setMobileTab('board');
  }

  function clearGame() {
    cancelPendingGameSave();
    gameListenerRef.current?.();
    gameListenerRef.current = null;
    roomListenerRef.current?.();
    roomListenerRef.current = null;
    setGameState(null);
    setFinishedGameId(null);
    setRoomCode(null);
    localStorage.removeItem(STORAGE_KEY);
    setScreen('home');
  }

  // ── Can the current user act? ──
  const canAct = !isRoomGame ||
    (gameState?.players[gameState.currentPlayerIndex]?.uid === profile?.uid);

  // ── Loading ──
  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingCard}>
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 16 }}>
            <rect width="40" height="40" rx="12" fill="var(--green)" />
            <path d="M8 28L14 16L20 22L26 12L32 28H8Z" fill="white" fillOpacity="0.9" />
          </svg>
          <div style={S.loadingTitle}>Monovale</div>
          <div style={S.loadingSpinner} />
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  // User logged in but profile failed to load (Firestore rules issue)
  if (!profile) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingCard}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={S.loadingTitle}>Erro ao carregar perfil</div>
          <p style={{ color: 'var(--text-mid)', fontWeight: 600, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
            Verifique as Regras do Firestore<br />
            ou tente fazer logout e entrar novamente.
          </p>
          <button
            onClick={() => { logout(); }}
            style={{ padding: '12px 24px', background: 'var(--red-grad)', color: '#fff', border: 'none', borderRadius: 99, cursor: 'pointer', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 0 var(--red-dark)', fontFamily: 'var(--font-body)' }}
          >
            Fazer Logout
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'home') return (
    <HomePage
      onStartGame={() => setScreen('lobby')}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={() => setScreen('join-room')}
    />
  );

  if (screen === 'join-room') return (
    <JoinRoom onJoin={handleJoinRoom} onBack={() => setScreen('home')} />
  );

  if (screen === 'room-lobby' && roomCode) return (
    <RoomLobby code={roomCode} onGameStart={handleRoomGameStart} onLeave={clearGame} />
  );

  if (screen === 'lobby') return (
    <Lobby onStart={handleStart} onBack={() => setScreen('home')} />
  );

  if (!gameState || gameState.phase === 'lobby') { setScreen('lobby'); return null; }

  // ── Action props (with turn enforcement) ──
  const ap = {
    state: gameState,
    onRoll:         () => act(rollDice),
    onBuy:          () => act(buyProperty),
    onAuction:      () => act(startAuction),
    onEndTurn:      () => act(endTurn),
    onResolveCard:  () => act(resolveCard),
    onPayJail:      () => act(payJailFine),
    onUseJailCard:  () => act(useJailCard),
    onProposeTrade: (idx: number) => act(s => proposeTrade(s, idx)),
    onBuildHouse:   (pos: number) => act(s => buildHouse(s, pos)),
    onSellHouse:    (pos: number) => act(s => sellHouse(s, pos)),
    onMortgage:     (pos: number) => act(s => mortgageProperty(s, pos)),
    onUnmortgage:   (pos: number) => act(s => unmortgageProperty(s, pos)),
  };

  const waitingBanner = isRoomGame && !canAct ? (
    <div style={S.waitingBanner}>
      ⏳ Aguardando <strong>{gameState.players[gameState.currentPlayerIndex]?.name}</strong> jogar...
    </div>
  ) : null;

  // ── Modals ──
  const modals = (
    <>
      {gameState.pendingEvent && (
        <EventModal
          event={gameState.pendingEvent}
          state={gameState}
          onContinue={() => act(resolveEventCard)}
        />
      )}
      {gameState.turnPhase === 'auction' && gameState.auction && (
        <AuctionModal
          state={gameState}
          myUid={profile?.uid ?? null}
          isRoomGame={isRoomGame}
          onBid={(p, a) => act(s => placeBid(s, p, a))}
          onPass={(p) => act(s => passBid(s, p))}
        />
      )}
      {gameState.turnPhase === 'trade' && gameState.trade && (
        <TradeModal state={gameState} onUpdate={(t: TradeState) => act(s => updateTrade(s, t))} onAccept={() => act(acceptTrade)} onCancel={() => act(cancelTrade)} />
      )}
      {gameState.phase === 'ended' && (
        <EndScreen state={gameState} onNewGame={clearGame} />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showConfirm && (
        <div style={S.overlay}>
          <div style={S.confirmBox}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
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

  const topBar = (
    <div style={S.topBar}>
      <div style={S.topLogo}>
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
          <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
          <path d="M8 28L14 16L20 22L26 12L32 28H8Z" fill="white" fillOpacity="0.9" />
        </svg>
        <span style={{ ...S.topTitle, fontSize: isMobile ? 18 : 22 }}>Monovale</span>
        {!isMobile && <span style={S.topSub}>Vale do Paraíba</span>}
        {roomCode && (
          <span style={S.roomCodeBadge}>
            <Key size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {roomCode}
          </span>
        )}
      </div>
      <div style={S.topRight}>
        {!isMobile && <span style={S.bankerTag}>Banco Sr. Marinho</span>}
        <button onClick={() => setShowHelp(true)} style={S.helpBtn} title="Como jogar">
          <HelpCircle size={16} />
        </button>
        <button onClick={() => gameState?.phase === 'playing' ? setShowConfirm(true) : clearGame()} style={S.newGameBtn}>
          <RefreshCw size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: isMobile ? 0 : 5 }} />
          {!isMobile && 'Sair'}
        </button>
      </div>
    </div>
  );

  // ════ MOBILE ════
  if (isMobile) return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
      {topBar}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {mobileTab === 'board' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 12px' }}>
            <ScaledBoard state={gameState} scale={mobileScale} />
            <div style={{ width: '100%', padding: '0 8px' }}>
              {waitingBanner}
              {canAct && <ActionPanel {...ap} />}
            </div>
          </div>
        )}
        {mobileTab === 'players' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            <PlayerPanel state={gameState} />
          </div>
        )}
        {mobileTab === 'log' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 8 }}>
            <EventLog log={gameState.log} />
          </div>
        )}
      </div>
      <MobileTabBar active={mobileTab} onChange={setMobileTab} />
      {modals}
    </div>
  );

  // ════ TABLET ════
  if (isTablet) return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
      {topBar}
      <div style={{ flex: 1, display: 'flex', gap: 8, padding: 8, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', gap: 8, minWidth: 0 }}>
          <ScaledBoard state={gameState} scale={tabletScale} />
          <div style={{ width: '100%' }}>
            {waitingBanner}
            {canAct && <ActionPanel {...ap} />}
          </div>
        </div>
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
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

  // ════ DESKTOP ════
  return (
    <div style={S.root}>
      {topBar}
      <div style={S.layout}>
        <div style={S.leftPanel}><PlayerPanel state={gameState} /></div>
        <div style={S.center}>
          <div style={S.boardWrapper}><Board state={gameState} /></div>
          <div style={S.actionWrapper}>
            {waitingBanner}
            {canAct && <ActionPanel {...ap} />}
          </div>
        </div>
        <div style={S.rightPanel}><EventLog log={gameState.log} /></div>
      </div>
      {modals}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  loadingPage: { minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' },
  loadingCard: { background: 'var(--card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: '48px 56px', textAlign: 'center' },
  loadingTitle: { fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 20, letterSpacing: '-0.3px' },
  loadingSpinner: { width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },

  root: { height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-body)', overflow: 'hidden' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 52, background: 'linear-gradient(90deg, #065F46, #059669)', boxShadow: '0 1px 0 rgba(0,0,0,0.15)', flexShrink: 0, zIndex: 10 },
  topLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  topTitle: { fontFamily: 'var(--font-title)', color: '#fff', fontWeight: 800, letterSpacing: '-0.2px', lineHeight: 1 },
  topSub: { fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)' },
  roomCodeBadge: { fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '3px 10px', color: '#fff', letterSpacing: '1px' },
  topRight: { display: 'flex', alignItems: 'center', gap: 10 },
  bankerTag: { fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)' },
  helpBtn: { width: 32, height: 32, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 },
  newGameBtn: { padding: '7px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },

  layout: { flex: 1, display: 'flex', gap: 10, padding: '10px', overflow: 'hidden', minHeight: 0 },
  leftPanel: { width: 210, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  center: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', overflowY: 'auto', minWidth: 0 },
  boardWrapper: { flexShrink: 0 },
  actionWrapper: { width: '100%', maxWidth: 800, paddingBottom: 8 },
  rightPanel: { width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' },

  waitingBanner: { padding: '12px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600, color: 'var(--text-mid)', textAlign: 'center', marginBottom: 8 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(6px)', padding: 16 },
  confirmBox: { background: 'var(--card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: '32px 28px', maxWidth: 340, width: '100%', textAlign: 'center', animation: 'pop-in 0.25s ease' },
  confirmTitle: { fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 },
  confirmText: { fontSize: 14, color: 'var(--text-mid)', fontWeight: 500, margin: '0 0 20px' },
  confirmBtns: { display: 'flex', gap: 10 },
  confirmBtnYes: { flex: 1, padding: '13px', background: 'var(--red-grad)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' },
  confirmBtnNo: { flex: 1, padding: '13px', background: 'var(--card-alt)', color: 'var(--text)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' },
};
