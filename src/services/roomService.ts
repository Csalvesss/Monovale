import {
  doc, setDoc, updateDoc, getDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { GameState, UserProfile } from '../types';

export interface RoomPlayer {
  uid: string;
  displayName: string;
  pawnId: string;
}

export interface Room {
  code: string;
  hostUid: string;
  players: RoomPlayer[];
  status: 'waiting' | 'playing' | 'ended';
  gameId: string | null;
}

function makeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function createRoom(profile: UserProfile): Promise<string> {
  const code = makeCode();
  const room: Room = {
    code,
    hostUid: profile.uid,
    players: [{ uid: profile.uid, displayName: profile.displayName, pawnId: profile.pawnId }],
    status: 'waiting',
    gameId: null,
  };
  await setDoc(doc(db, 'rooms', code), { ...room, createdAt: Date.now() });
  return code;
}

export async function joinRoom(code: string, player: RoomPlayer): Promise<Room> {
  const ref = doc(db, 'rooms', code.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Sala não encontrada. Verifique o código.');
  const room = snap.data() as Room;
  if (room.status !== 'waiting') throw new Error('Esta partida já foi iniciada.');
  if (room.players.length >= 8) throw new Error('Sala cheia (máx. 8 jogadores).');
  if (room.players.find(p => p.uid === player.uid)) return room;
  const newPlayers = [...room.players, player];
  await updateDoc(ref, { players: newPlayers });
  return { ...room, players: newPlayers };
}

export async function updateRoomPlayers(code: string, players: RoomPlayer[]): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), { players });
}

export async function startRoomGame(code: string, gameId: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), { status: 'playing', gameId });
}

export function listenRoom(code: string, cb: (room: Room) => void): () => void {
  return onSnapshot(doc(db, 'rooms', code), snap => {
    if (snap.exists()) cb(snap.data() as Room);
  });
}

export function listenGameState(gameId: string, cb: (state: GameState) => void): () => void {
  return onSnapshot(doc(db, 'games', gameId), snap => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (data?.stateJson) cb(JSON.parse(data.stateJson) as GameState);
  });
}
