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
  initGame,
  rollDice,
  buyProperty,
  startAuction,
  placeBid,
  passBid,
  endTurn,
  payJailFine,
  useJailCard,
  buildHouse,
  sellHouse,
  mortgageProperty,
  unmortgageProperty,
  proposeTrade,
  updateTrade,
  acceptTrade,
  cancelTrade,
  resolveCard,
} from './logic/gameEngine';

const STORAGE_KEY = 'monovale_game_state';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        // Only restore if in playing state (not lobby/ended)
        if (parsed.phase === 'playing') return parsed;
      }
    } catch { /* ignore */ }
    return null;
  });

  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  // Persist state on every change
  useEffect(() => {
    if (gameState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setGameState(prev => prev ? fn(prev) : prev);
  }, []);

  function handleStart(config: LobbyConfig) {
    setGameState(initGame(config));
  }

  function handleNewGame() {
    if (gameState?.phase === 'playing') {
      setShowNewGameConfirm(true);
    } else {
      setGameState(null);
    }
  }

  function confirmNewGame() {
    setShowNewGameConfirm(false);
    setGameState(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  if (!gameState || gameState.phase === 'lobby') {
    return (
      <div>
        <Lobby onStart={handleStart} />
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarTitle}>
          <span>🗺️</span> Monovale
          <span style={styles.topBarSub}>Vale do Paraíba</span>
        </div>
        <div style={styles.topBarActions}>
          <span style={styles.bankerBadge}>🏦 Banco do Sr. Marinho</span>
          <button
            onClick={handleNewGame}
            style={styles.newGameBtn}
          >
            🔄 Nova Partida
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={styles.layout}>
        {/* Left: Players */}
        <div style={styles.leftPanel}>
          <PlayerPanel state={gameState} />
        </div>

        {/* Center: Board + Actions */}
        <div style={styles.center}>
          <div style={styles.boardWrapper}>
            <Board state={gameState} />
          </div>
          <div style={styles.actionWrapper}>
            <ActionPanel
              state={gameState}
              onRoll={() => update(rollDice)}
              onBuy={() => update(buyProperty)}
              onAuction={() => update(startAuction)}
              onEndTurn={() => update(endTurn)}
              onResolveCard={() => update(resolveCard)}
              onPayJail={() => update(payJailFine)}
              onUseJailCard={() => update(useJailCard)}
              onProposeTrade={(targetIndex) => update(s => proposeTrade(s, targetIndex))}
              onBuildHouse={(pos) => update(s => buildHouse(s, pos))}
              onSellHouse={(pos) => update(s => sellHouse(s, pos))}
              onMortgage={(pos) => update(s => mortgageProperty(s, pos))}
              onUnmortgage={(pos) => update(s => unmortgageProperty(s, pos))}
            />
          </div>
        </div>

        {/* Right: Log */}
        <div style={styles.rightPanel}>
          <EventLog log={gameState.log} />
        </div>
      </div>

      {/* Modals */}
      {gameState.turnPhase === 'auction' && gameState.auction && (
        <AuctionModal
          state={gameState}
          onBid={(playerId, amount) => update(s => placeBid(s, playerId, amount))}
          onPass={(playerId) => update(s => passBid(s, playerId))}
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

      {/* End screen */}
      {gameState.phase === 'ended' && (
        <EndScreen
          state={gameState}
          onNewGame={() => {
            setGameState(null);
            localStorage.removeItem(STORAGE_KEY);
          }}
        />
      )}

      {/* New game confirmation */}
      {showNewGameConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmModal}>
            <div style={styles.confirmTitle}>⚠️ Nova Partida</div>
            <p style={styles.confirmText}>
              Tem certeza? O progresso atual será perdido.
            </p>
            <div style={styles.confirmActions}>
              <button onClick={confirmNewGame} style={styles.confirmBtnYes}>
                Sim, nova partida
              </button>
              <button onClick={() => setShowNewGameConfirm(false)} style={styles.confirmBtnNo}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f1a0f 0%, #1a3a2a 50%, #0f2010 100%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    color: '#f9fafb',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: 'rgba(0,0,0,0.4)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  topBarTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 20,
    fontWeight: 900,
    color: '#d4af37',
    letterSpacing: '-0.5px',
  },
  topBarSub: {
    fontSize: 12,
    fontWeight: 500,
    color: '#86efac',
    marginLeft: 2,
  },
  topBarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  bankerBadge: {
    fontSize: 12,
    color: '#d4af37',
    opacity: 0.8,
  },
  newGameBtn: {
    padding: '6px 14px',
    background: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
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
    width: 200,
    flexShrink: 0,
    overflowY: 'auto',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    overflow: 'auto',
    minWidth: 0,
  },
  boardWrapper: {
    flexShrink: 0,
  },
  actionWrapper: {
    width: '100%',
    maxWidth: 650,
  },
  rightPanel: {
    width: 260,
    flexShrink: 0,
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
  },
  confirmModal: {
    background: '#fff',
    borderRadius: 14,
    padding: '24px',
    maxWidth: 340,
    width: '90%',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#1f2937',
    marginBottom: 10,
  },
  confirmText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  confirmActions: {
    display: 'flex',
    gap: 10,
  },
  confirmBtnYes: {
    flex: 1,
    padding: '10px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  confirmBtnNo: {
    flex: 1,
    padding: '10px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
