import {
  doc, setDoc, updateDoc, getDoc, onSnapshot,
  serverTimestamp, runTransaction,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import type { RoomDoc, BoardPlayer, PlayerColor, ActionResult } from './types';
import { ALL_PLAYER_COLORS } from './types';
import { TOTAL_SPACES } from './data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function makePlayer(uid: string, name: string, color: PlayerColor): BoardPlayer {
  return {
    uid, name, color,
    position: 0,
    nig: 1000,
    points: 0,
    defenseTokens: 10,
    attackRange: 16,
    skipsNext: false,
    legendCards: 0,
    laps: 0,
  };
}

function coll(code: string) {
  return doc(db, 'lendas-rooms', code.toUpperCase());
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createRoom(
  uid: string,
  name: string,
  color: PlayerColor,
): Promise<string> {
  const code = makeCode();
  const host = makePlayer(uid, name, color);
  const room: RoomDoc = {
    code,
    hostUid: uid,
    status: 'waiting',
    players: [host],
    turnOrder: [],
    currentTurnIndex: 0,
    round: 1,
    maxRounds: 3,
    phase: 'roll',
    lastAction: null,
    lastDice: null,
    log: [`${name} criou a sala!`],
    winner: null,
  };
  await setDoc(coll(code), { ...room, createdAt: serverTimestamp() });
  return code;
}

// ─── Join ─────────────────────────────────────────────────────────────────────

export async function joinRoom(
  code: string,
  uid: string,
  name: string,
  color: PlayerColor,
): Promise<RoomDoc> {
  const ref = coll(code);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Sala não encontrada. Verifique o código.');
  const room = snap.data() as RoomDoc;
  if (room.status !== 'waiting') throw new Error('Esta sala já foi iniciada.');
  if (room.players.length >= 6) throw new Error('Sala cheia (máx. 6 jogadores).');
  if (room.players.find(p => p.uid === uid)) return room; // already joined
  const usedColors = room.players.map(p => p.color);
  let chosenColor = color;
  if (usedColors.includes(color)) {
    const free = ALL_PLAYER_COLORS.find(c => !usedColors.includes(c));
    if (!free) throw new Error('Sala cheia.');
    chosenColor = free;
  }
  const newPlayer = makePlayer(uid, name, chosenColor);
  const newPlayers = [...room.players, newPlayer];
  const newLog = [...room.log.slice(-19), `${name} entrou na sala!`];
  await updateDoc(ref, { players: newPlayers, log: newLog });
  return { ...room, players: newPlayers };
}

// ─── Start ────────────────────────────────────────────────────────────────────

export async function startRoom(code: string): Promise<void> {
  const ref = coll(code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const room = snap.data() as RoomDoc;
  const turnOrder = [...room.players.map(p => p.uid)].sort(() => Math.random() - 0.5);
  const firstPlayer = room.players.find(p => p.uid === turnOrder[0]);
  const log = [
    ...room.log.slice(-18),
    'Jogo iniciado!',
    `Vez de ${firstPlayer?.name ?? 'Jogador 1'}`,
  ];
  await updateDoc(ref, {
    status: 'playing',
    turnOrder,
    currentTurnIndex: 0,
    phase: 'roll',
    log,
  });
}

// ─── Listen ───────────────────────────────────────────────────────────────────

export function listenRoom(code: string, cb: (room: RoomDoc) => void): () => void {
  return onSnapshot(coll(code), snap => {
    if (snap.exists()) cb(snap.data() as RoomDoc);
  });
}

// ─── Submit roll + action ─────────────────────────────────────────────────────

export async function submitAction(
  code: string,
  uid: string,
  dice: number,
  action: ActionResult,
  updatedPlayer: BoardPlayer,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = coll(code);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as RoomDoc;

    // Guard: only current player can act
    const currentUid = room.turnOrder[room.currentTurnIndex];
    if (currentUid !== uid) return;

    const newPlayers = room.players.map(p =>
      p.uid === uid ? updatedPlayer : p
    );

    const entry = `${updatedPlayer.name} caiu em ${action.spaceLabel}${action.description ? ' — ' + action.description : ''}`;
    const newLog = [...room.log.slice(-19), entry];

    tx.update(ref, {
      players: newPlayers,
      lastDice: dice,
      lastAction: action,
      phase: 'action',
      log: newLog,
    });
  });
}

// ─── End turn ─────────────────────────────────────────────────────────────────

export async function endTurn(
  code: string,
  uid: string,
  extraTurn: boolean,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = coll(code);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as RoomDoc;

    const currentUid = room.turnOrder[room.currentTurnIndex];
    if (currentUid !== uid) return;

    if (extraTurn) {
      // Same player rolls again — just reset phase
      tx.update(ref, { phase: 'roll', lastAction: null, lastDice: null });
      return;
    }

    let nextIndex = (room.currentTurnIndex + 1) % room.turnOrder.length;
    let newRound = room.round;

    // Full lap completed
    if (nextIndex === 0) {
      newRound = room.round + 1;
    }

    // Check win condition
    let winner: string | null = null;
    let newStatus: RoomDoc['status'] = room.status;

    if (newRound > room.maxRounds) {
      // Game over — highest points wins
      const sorted = [...room.players].sort((a, b) => b.points - a.points);
      winner = sorted[0].uid;
      newStatus = 'finished';
    }

    // Skip next player if they have skipsNext = true
    let skipCount = 0;
    while (skipCount < room.players.length) {
      const nextUid = room.turnOrder[nextIndex];
      const nextPlayer = room.players.find(p => p.uid === nextUid);
      if (!nextPlayer?.skipsNext) break;
      // Clear skip flag
      nextIndex = (nextIndex + 1) % room.turnOrder.length;
      skipCount++;
    }

    const nextPlayer = room.players.find(p => p.uid === room.turnOrder[nextIndex]);
    const newLog = [
      ...room.log.slice(-19),
      winner
        ? `🏆 Fim de jogo! Vencedor: ${room.players.find(p => p.uid === winner)?.name}`
        : `Vez de ${nextPlayer?.name ?? ''}`,
    ];

    // Clear skipsNext for the player who just used it
    const clearedPlayers = room.players.map(p => {
      const nextUid = room.turnOrder[nextIndex];
      const prevUid = currentUid;
      // Clear skip for players whose skip was consumed
      if (p.uid !== prevUid && room.players.find(pp => pp.uid === p.uid)?.skipsNext) {
        return { ...p, skipsNext: false };
      }
      return p;
    });

    tx.update(ref, {
      players: clearedPlayers,
      currentTurnIndex: nextIndex,
      round: newRound,
      phase: 'roll',
      lastAction: null,
      lastDice: null,
      log: newLog,
      winner,
      status: newStatus,
    });
  });
}

// ─── Leave room ───────────────────────────────────────────────────────────────

export async function leaveRoom(code: string, uid: string): Promise<void> {
  const ref = coll(code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const room = snap.data() as RoomDoc;
  if (room.status !== 'waiting') return; // can't leave an active game
  const newPlayers = room.players.filter(p => p.uid !== uid);
  if (newPlayers.length === 0) return; // last player - could delete room
  await updateDoc(ref, {
    players: newPlayers,
    log: [...room.log.slice(-19), `${room.players.find(p => p.uid === uid)?.name ?? 'Jogador'} saiu.`],
  });
}

// ─── Buy upgrade (Transfer Market space) ─────────────────────────────────────

export async function buyUpgrade(
  code: string,
  uid: string,
  upgradeId: 'attack' | 'defense',
  cost: number,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = coll(code);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as RoomDoc;
    const player = room.players.find(p => p.uid === uid);
    if (!player || player.nig < cost) return;

    const updated: BoardPlayer = {
      ...player,
      nig: player.nig - cost,
      attackRange: upgradeId === 'attack' ? player.attackRange + 2 : player.attackRange,
      defenseTokens: upgradeId === 'defense' ? player.defenseTokens + 5 : player.defenseTokens,
    };

    const label = upgradeId === 'attack' ? 'Ataque +2' : 'Defesa +5 fichas';
    const newLog = [...room.log.slice(-19), `${player.name} comprou ${label} (-${cost} NIG)`];

    tx.update(ref, {
      players: room.players.map(p => p.uid === uid ? updated : p),
      log: newLog,
    });
  });
}

// ─── Move position (only used internally by engine) ──────────────────────────

export function computeNewPosition(
  current: number,
  dice: number,
): { position: number; passedGo: boolean } {
  const next = (current + dice) % TOTAL_SPACES;
  const passedGo = next < current || current + dice >= TOTAL_SPACES;
  return { position: next, passedGo };
}
