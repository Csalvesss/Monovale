// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Entry Point
// Handles: lobby creation/joining, room lobby, and game play
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, RoomState, FactionId } from './types';
import { initGame } from './logic/gameEngine';
import {
  createRoom, joinRoom, selectFaction, startGame,
  listenRoom, listenGame, saveGameState, leaveRoom,
} from './services/gameService';
import LobbyScreen from './components/LobbyScreen';
import RoomLobbyScreen from './components/RoomLobbyScreen';
import GameScreen from './components/GameScreen';

interface Props {
  onBack: () => void;
}

type Screen = 'lobby' | 'room-lobby' | 'game';

// Generate a simple player ID for anonymous players
function getOrCreatePlayerId(): string {
  const key = 'vale_em_disputa_player_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

// Save room state to localStorage for reconnection
function saveRoomSession(code: string, playerId: string) {
  localStorage.setItem('ved_room_code', code);
  localStorage.setItem('ved_player_id', playerId);
}

function clearRoomSession() {
  localStorage.removeItem('ved_room_code');
  localStorage.removeItem('ved_player_id');
}

export default function ValeEmDisputa({ onBack }: Props) {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const playerIdRef = useRef(getOrCreatePlayerId());
  const roomListenerRef = useRef<(() => void) | null>(null);
  const gameListenerRef = useRef<(() => void) | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myPlayerId = playerIdRef.current;

  // Try to restore session on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('ved_room_code');
    if (savedCode) {
      // Try to reconnect
      startRoomListener(savedCode);
    }
    return () => {
      roomListenerRef.current?.();
      gameListenerRef.current?.();
    };
  }, []); // eslint-disable-line

  function startRoomListener(code: string) {
    roomListenerRef.current?.();
    roomListenerRef.current = listenRoom(code, room => {
      if (!room) {
        // Room deleted or not found
        setRoomState(null);
        clearRoomSession();
        setScreen('lobby');
        return;
      }
      setRoomState(room);

      // If game has started, subscribe to game
      if (room.status === 'playing' && room.gameId) {
        startGameListener(room.gameId);
        setScreen('game');
      } else {
        setScreen('room-lobby');
      }
    });
  }

  function startGameListener(gameId: string) {
    gameListenerRef.current?.();
    gameListenerRef.current = listenGame(gameId, gs => {
      if (gs) {
        setGameState(gs);
        setScreen('game');
      }
    });
  }

  // ── Create room ─────────────────────────────────────────────────────────────
  async function handleCreateRoom(playerName: string) {
    setLoading(true);
    setError(null);
    try {
      const code = await createRoom(myPlayerId, playerName);
      saveRoomSession(code, myPlayerId);
      startRoomListener(code);
    } catch (e) {
      setError('Erro ao criar sala. Tente novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Join room ──────────────────────────────────────────────────────────────
  async function handleJoinRoom(code: string, playerName: string) {
    setLoading(true);
    setError(null);
    try {
      const room = await joinRoom(code, myPlayerId, playerName);
      if (!room) {
        setError('Sala não encontrada ou cheia. Verifique o código.');
        return;
      }
      saveRoomSession(code, myPlayerId);
      startRoomListener(code);
    } catch (e) {
      setError('Erro ao entrar na sala. Verifique o código e tente novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Select faction ──────────────────────────────────────────────────────────
  async function handleSelectFaction(faction: FactionId) {
    if (!roomState) return;
    await selectFaction(roomState.code, myPlayerId, faction);
  }

  // ── Start game ──────────────────────────────────────────────────────────────
  async function handleStartGame() {
    if (!roomState) return;
    const players = Object.values(roomState.players);
    if (players.length < 2) return;
    if (players.some(p => !p.faction)) return;

    setLoading(true);
    try {
      const gameId = 'ved_' + Date.now().toString(36);
      const gs = initGame({
        gameId,
        code: roomState.code,
        players: players.map(p => ({
          id: p.id,
          name: p.name,
          faction: p.faction as FactionId,
        })),
      });

      await startGame(roomState.code, gs);
      // Room listener will detect the status change and switch to game
    } catch (e) {
      setError('Erro ao iniciar o jogo.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Handle game state changes (local player action) ──────────────────────
  const handleStateChange = useCallback((newState: GameState) => {
    setGameState(newState);

    // Debounced save to Firestore
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveGameState(newState.id, newState).catch(console.error);
    }, 300);
  }, []);

  // ── Leave room ──────────────────────────────────────────────────────────────
  async function handleLeave() {
    if (roomState) {
      await leaveRoom(roomState.code, myPlayerId);
    }
    roomListenerRef.current?.();
    gameListenerRef.current?.();
    clearRoomSession();
    setRoomState(null);
    setGameState(null);
    setScreen('lobby');
  }

  // ── Screens ──────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    return (
      <LobbyScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onBack={onBack}
        loading={loading}
        error={error}
      />
    );
  }

  if (screen === 'room-lobby' && roomState) {
    return (
      <RoomLobbyScreen
        room={roomState}
        myPlayerId={myPlayerId}
        onSelectFaction={handleSelectFaction}
        onStartGame={handleStartGame}
        onLeave={handleLeave}
      />
    );
  }

  if (screen === 'game' && gameState) {
    return (
      <GameScreen
        gameState={gameState}
        myPlayerId={myPlayerId}
        onStateChange={handleStateChange}
        onBack={handleLeave}
      />
    );
  }

  // Loading / reconnecting state
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f2213 0%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
        <div>Carregando Vale em Disputa...</div>
        <button
          onClick={() => { clearRoomSession(); setScreen('lobby'); }}
          style={{
            marginTop: 16,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: 8, padding: '8px 16px',
            color: '#64748b', cursor: 'pointer', fontSize: 12,
          }}
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
