import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { GameState, GameResult, UserProfile } from '../types';
import { calculateNetWorth } from '../logic/rentCalculator';

// ─── Create a new game document ──────────────────────────────────────────────

export async function createGameDoc(
  hostUid: string | null,
  players: { uid: string | null; displayName: string; pawnId: string }[]
): Promise<string> {
  const ref = await addDoc(collection(db, 'games'), {
    hostUid,
    players,
    status: 'active',
    stateJson: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Save current game state ─────────────────────────────────────────────────

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveGameState(gameId: string, state: GameState) {
  // Debounce: write to Firestore at most once every 4 seconds
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        stateJson: JSON.stringify(state),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Could not save game state to Firestore:', e);
    }
  }, 4000);
}

// ─── Save current game state (immediate, for real-time rooms) ────────────────

export async function saveGameStateNow(gameId: string, state: GameState): Promise<void> {
  try {
    await updateDoc(doc(db, 'games', gameId), {
      stateJson: JSON.stringify(state),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Could not save game state:', e);
  }
}

export function cancelPendingGameSave() {
  if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
}

// ─── Load a saved game ───────────────────────────────────────────────────────

export async function loadGameDoc(gameId: string): Promise<GameState | null> {
  const snap = await getDoc(doc(db, 'games', gameId));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.stateJson) return null;
  return JSON.parse(data.stateJson) as GameState;
}

// ─── Finish a game: save result + update player stats ────────────────────────

export async function finishGame(state: GameState): Promise<void> {
  if (!state.gameId) return;

  // Build rankings
  const rankings: GameResult['rankings'] = [...state.players]
    .map(player => {
      const ownedPositions = Object.entries(state.properties)
        .filter(([, ps]) => ps.ownerId === player.id)
        .map(([p]) => Number(p));
      const netWorth = calculateNetWorth(player, ownedPositions, state.spaces, state.properties);
      return { player, netWorth };
    })
    .sort((a, b) => {
      if (a.player.bankrupt && !b.player.bankrupt) return 1;
      if (!a.player.bankrupt && b.player.bankrupt) return -1;
      return b.netWorth - a.netWorth;
    })
    .map(({ player, netWorth }, idx) => ({
      rank: idx + 1,
      uid: player.uid,
      displayName: player.name,
      netWorth,
      winner: idx === 0 && !player.bankrupt,
      bankrupt: player.bankrupt,
    }));

  const result: GameResult = {
    gameId: state.gameId,
    playerIds: state.players.map(p => p.uid),
    rankings,
    completedAt: Date.now(),
  };

  // Save result doc
  await setDoc(doc(db, 'gameResults', state.gameId), result);

  // Mark game as finished
  await updateDoc(doc(db, 'games', state.gameId), {
    status: 'finished',
    updatedAt: serverTimestamp(),
  });

  // Update stats for each linked player
  for (const ranking of rankings) {
    if (!ranking.uid) continue;
    try {
      await updateDoc(doc(db, 'users', ranking.uid), {
        'stats.gamesPlayed': increment(1),
        'stats.gamesWon':    ranking.winner ? increment(1) : increment(0),
        'stats.totalNetWorth': increment(ranking.netWorth),
        'stats.bankruptcies':  ranking.bankrupt ? increment(1) : increment(0),
      });
    } catch (e) {
      console.warn('Could not update stats for', ranking.uid, e);
    }
  }
}

// ─── Get recent games for a user ─────────────────────────────────────────────

export async function getUserRecentGames(uid: string): Promise<GameResult[]> {
  const q = query(
    collection(db, 'gameResults'),
    where('playerIds', 'array-contains', uid),
    orderBy('completedAt', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as GameResult);
}
