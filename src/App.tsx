import React, { useCallback, useEffect, useState } from 'react';
import Lobby from './components/Lobby';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import EventLog from './components/EventLog';
import ActionPanel from './components/ActionPanel';
import AuctionModal from './components/AuctionModal';
import TradeModal from './components/TradeModal';
import EndScreen from './components/EndScreen';
import type { GameState, LobbyConfig, TradeState } from './types';
import {
  initGame, rollDice, buyProperty, startAuction, placeBid, passBid,
  endTurn, payJailFine, useJailCard, buildHouse, sellHouse,
  mortgageProperty, unmortgageProperty, proposeTrade, updateTrade,
  acceptTrade, cancelTrade, resolveCard,
} from './logic/gameEngine';

const STORAGE_KEY = 'monovale_game_state';

export default function App() {
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

  useEffect(() => {
    if (gameState) localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setGameState(prev => prev ? fn(prev) : prev);
  }, []);

  function handleStart(config: LobbyConfig) {
    setGameState(initGame(config));
  }

  function handleNewGame() {
    if (gameState?.phase === 'playing') setShowConfirm(true);
    else { setGameState(null); localStorage.removeItem(STORAGE_KEY); }
  }

  function confirmNewGame() {
    setShowConfirm(false);
    setGameState(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  if (!gameState || gameState.phase === 'lobby') {
    return <Lobby onStart={handleStart} />;
  }

  return (
    <div style={S.root}>
      {/* ── Top bar ── */}
      <div style={S.topBar}>
        <div style={S.topLogo}>
          <span style={{ fontSize: 28 }}>🗺️</span>
          <span style={S.topTitle}>MONOVALE</span>
          <span style={S.topSub}>Vale do Paraíba</span>
        </div>
        <div style={S.topRight}>
          <span style={S.bankerTag}>🏦 Sr. Marinho</span>
          <button onClick={handleNewGame} style={S.newGameBtn}>
            🔄 Nova Partida
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={S.layout}>

        {/* Left panel */}
        <div style={S.leftPanel}>
          <PlayerPanel state={gameState} />
        </div>

        {/* Center: board + actions */}
        <div style={S.center}>
          <div style={S.boardWrapper}>
            <Board state={gameState} />
          </div>
          <div style={S.actionWrapper}>
            <ActionPanel
              state={gameState}
              onRoll={() => update(rollDice)}
              onBuy={() => update(buyProperty)}
              onAuction={() => update(startAuction)}
              onEndTurn={() => update(endTurn)}
              onResolveCard={() => update(resolveCard)}
              onPayJail={() => update(payJailFine)}
              onUseJailCard={() => update(useJailCard)}
              onProposeTrade={(idx) => update(s => proposeTrade(s, idx))}
              onBuildHouse={(pos) => update(s => buildHouse(s, pos))}
              onSellHouse={(pos) => update(s => sellHouse(s, pos))}
              onMortgage={(pos) => update(s => mortgageProperty(s, pos))}
              onUnmortgage={(pos) => update(s => unmortgageProperty(s, pos))}
            />
          </div>
        </div>

        {/* Right panel */}
        <div style={S.rightPanel}>
          <EventLog log={gameState.log} />
        </div>
      </div>

      {/* ── Modals ── */}
      {gameState.turnPhase === 'auction' && gameState.auction && (
        <AuctionModal
          state={gameState}
          onBid={(pid, amt) => update(s => placeBid(s, pid, amt))}
          onPass={(pid) => update(s => passBid(s, pid))}
        />
      )}

      {gameState.turnPhase === 'trade' && gameState.trade && (
        <TradeModal
          state={gameState}
          onUpdate={(trade: TradeState) => update(s => updateTrade(s, trade))}
          onAccept={() => update(acceptTrade)}
          onCancel={() => update(cancelTrade)}
        />
      )}

      {gameState.phase === 'ended' && (
        <EndScreen
          state={gameState}
          onNewGame={() => { setGameState(null); localStorage.removeItem(STORAGE_KEY); }}
        />
      )}

      {/* ── New game confirmation ── */}
      {showConfirm && (
        <div style={S.overlay}>
          <div style={S.confirmBox}>
            <div style={S.confirmEmoji}>⚠️</div>
            <div style={S.confirmTitle}>Nova Partida?</div>
            <p style={S.confirmText}>O progresso atual será perdido.</p>
            <div style={S.confirmBtns}>
              <button onClick={confirmNewGame} style={S.confirmBtnYes}>Sim, nova partida</button>
              <button onClick={() => setShowConfirm(false)} style={S.confirmBtnNo}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    fontFamily: 'var(--font-body)',
    overflow: 'hidden',
  },

  /* ── Top bar ── */
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: 56,
    background: 'var(--gold-grad)',
    boxShadow: '0 3px 0 var(--gold-dark), 0 4px 12px rgba(0,0,0,0.15)',
    flexShrink: 0,
    zIndex: 10,
  },
  topLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  topTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 28,
    color: 'var(--text)',
    letterSpacing: '1.5px',
    textShadow: '1px 1px 0 rgba(255,255,255,0.4)',
    lineHeight: 1,
  },
  topSub: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text)',
    opacity: 0.6,
    marginTop: 2,
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  bankerTag: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text)',
    opacity: 0.7,
  },
  newGameBtn: {
    padding: '7px 16px',
    background: 'var(--red-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 99,
    fontFamily: 'var(--font-body)',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 3px 0 var(--red-dark)',
    letterSpacing: '0.3px',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },

  /* ── Main layout ── */
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

  boardWrapper: {
    flexShrink: 0,
  },

  actionWrapper: {
    width: '100%',
    maxWidth: 660,
    paddingBottom: 8,
  },

  rightPanel: {
    width: 260,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  /* ── Overlay / Confirm ── */
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    backdropFilter: 'blur(4px)',
  },
  confirmBox: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-xl)',
    border: '3px solid var(--border-gold)',
    boxShadow: 'var(--shadow-lg)',
    padding: '32px 28px',
    maxWidth: 340,
    width: '90%',
    textAlign: 'center',
    animation: 'pop-in 0.25s ease',
  },
  confirmEmoji: { fontSize: 40, marginBottom: 8 },
  confirmTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 28,
    color: 'var(--text)',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    color: 'var(--text-mid)',
    fontWeight: 600,
    margin: '0 0 20px',
  },
  confirmBtns: { display: 'flex', gap: 10 },
  confirmBtnYes: {
    flex: 1,
    padding: '12px',
    background: 'var(--red-grad)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 0 var(--red-dark)',
    fontFamily: 'var(--font-body)',
  },
  confirmBtnNo: {
    flex: 1,
    padding: '12px',
    background: 'var(--card-alt)',
    color: 'var(--text)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 0 var(--border)',
    fontFamily: 'var(--font-body)',
  },
};
