// ─────────────────────────────────────────────────────────────────────────────
// Vale em Disputa — Firebase Firestore Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection, doc, setDoc, getDoc, updateDoc, onSnapshot,
  runTransaction, Unsubscribe, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import type { GameState, RoomState, RoomPlayer, FactionId } from '../types';

const ROOMS_COL = 'vale-em-disputa-rooms';
const GAMES_COL = 'vale-em-disputa-games';

// ── Room helpers ──────────────────────────────────────────────────────────────

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Room creation ─────────────────────────────────────────────────────────────

export async function createRoom(hostId: string, hostName: string): Promise<string> {
  let code = generateRoomCode();
  let attempts = 0;

  // Ensure code is unique
  while (attempts < 5) {
    const existing = await getDoc(doc(db, ROOMS_COL, code));
    if (!existing.exists()) break;
    code = generateRoomCode();
    attempts++;
  }

  const hostPlayer: RoomPlayer = {
    id: hostId,
    name: hostName,
    faction: null,
    ready: false,
    isHost: true,
  };

  const room: RoomState = {
    code,
    status: 'lobby',
    players: { [hostId]: hostPlayer },
    gameId: null,
    hostId,
  };

  await setDoc(doc(db, ROOMS_COL, code), {
    ...room,
    createdAt: serverTimestamp(),
  });

  return code;
}

// ── Join room ─────────────────────────────────────────────────────────────────

export async function joinRoom(code: string, playerId: string, playerName: string): Promise<RoomState | null> {
  const roomRef = doc(db, ROOMS_COL, code.toUpperCase());

  try {
    const result = await runTransaction(db, async tx => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error('Sala não encontrada');

      const room = snap.data() as RoomState;
      if (room.status !== 'lobby') throw new Error('Partida já iniciada');
      if (Object.keys(room.players).length >= 5) throw new Error('Sala cheia (máx 5 jogadores)');

      const newPlayer: RoomPlayer = {
        id: playerId,
        name: playerName,
        faction: null,
        ready: false,
        isHost: false,
      };

      tx.update(roomRef, {
        [`players.${playerId}`]: newPlayer,
      });

      return { ...room, players: { ...room.players, [playerId]: newPlayer } };
    });

    return result;
  } catch (err) {
    console.error('joinRoom error:', err);
    return null;
  }
}

// ── Select faction ─────────────────────────────────────────────────────────────

export async function selectFaction(code: string, playerId: string, faction: FactionId): Promise<void> {
  const roomRef = doc(db, ROOMS_COL, code);
  await updateDoc(roomRef, {
    [`players.${playerId}.faction`]: faction,
    [`players.${playerId}.ready`]: true,
  });
}

// ── Listen to room ─────────────────────────────────────────────────────────────

export function listenRoom(code: string, callback: (room: RoomState | null) => void): Unsubscribe {
  const roomRef = doc(db, ROOMS_COL, code);
  return onSnapshot(roomRef, snap => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(snap.data() as RoomState);
  });
}

// ── Start game ─────────────────────────────────────────────────────────────────

export async function startGame(
  code: string,
  gameState: GameState
): Promise<void> {
  const roomRef = doc(db, ROOMS_COL, code);
  const gameRef = doc(db, GAMES_COL, gameState.id);

  // Save game state
  await setDoc(gameRef, {
    ...serializeGameState(gameState),
    createdAt: serverTimestamp(),
  });

  // Update room with gameId and status
  await updateDoc(roomRef, {
    status: 'playing',
    gameId: gameState.id,
  });
}

// ── Listen to game ─────────────────────────────────────────────────────────────

export function listenGame(gameId: string, callback: (state: GameState | null) => void): Unsubscribe {
  const gameRef = doc(db, GAMES_COL, gameId);
  return onSnapshot(gameRef, snap => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(deserializeGameState(snap.data()));
  });
}

// ── Save game state ────────────────────────────────────────────────────────────

export async function saveGameState(gameId: string, state: GameState): Promise<void> {
  const gameRef = doc(db, GAMES_COL, gameId);
  await updateDoc(gameRef, {
    ...serializeGameState(state),
    updatedAt: serverTimestamp(),
  });
}

// Use Firestore transaction for conflict-prone operations (attacks)
export async function saveGameStateTransaction(
  gameId: string,
  state: GameState,
  expectedCurrentTurn: string
): Promise<boolean> {
  const gameRef = doc(db, GAMES_COL, gameId);

  try {
    await runTransaction(db, async tx => {
      const snap = await tx.get(gameRef);
      if (!snap.exists()) throw new Error('Game not found');
      const current = snap.data() as Record<string, unknown>;
      // Verify it's still this player's turn (optimistic concurrency)
      if (current.currentTurn !== expectedCurrentTurn) {
        throw new Error('Turn has changed');
      }
      tx.update(gameRef, {
        ...serializeGameState(state),
        updatedAt: serverTimestamp(),
      });
    });
    return true;
  } catch {
    return false;
  }
}

// ── Serialization ─────────────────────────────────────────────────────────────

function serializeGameState(state: GameState): Record<string, unknown> {
  // Firestore doesn't support arrays of complex objects well, serialize log
  return {
    ...state,
    log: state.log.slice(-100), // keep last 100 log entries
  };
}

function deserializeGameState(data: Record<string, unknown>): GameState {
  return data as unknown as GameState;
}

// ── Leave room ─────────────────────────────────────────────────────────────────

export async function leaveRoom(code: string, playerId: string): Promise<void> {
  try {
    const roomRef = doc(db, ROOMS_COL, code);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const room = snap.data() as RoomState;
    const players = { ...room.players };
    delete players[playerId];

    if (Object.keys(players).length === 0) {
      // Last player left — could delete room, but just mark it
      await updateDoc(roomRef, { status: 'lobby', players: {} });
    } else {
      // Transfer host if needed
      let updates: Record<string, unknown> = { [`players.${playerId}`]: null as unknown };
      if (room.hostId === playerId) {
        const newHostId = Object.keys(players)[0];
        players[newHostId] = { ...players[newHostId], isHost: true };
        updates = { ...updates, hostId: newHostId, [`players.${newHostId}.isHost`]: true };
      }
      await updateDoc(roomRef, updates);
    }
  } catch (err) {
    console.error('leaveRoom error:', err);
  }
}

// ── Get room ──────────────────────────────────────────────────────────────────

export async function getRoom(code: string): Promise<RoomState | null> {
  const snap = await getDoc(doc(db, ROOMS_COL, code));
  if (!snap.exists()) return null;
  return snap.data() as RoomState;
}

// Suppress Timestamp import warning
void Timestamp;
