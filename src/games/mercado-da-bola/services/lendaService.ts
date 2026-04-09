import {
  doc, setDoc, updateDoc, getDoc, onSnapshot,
  collection, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import type { GameSave } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaguePlayer {
  uid: string;
  name: string;
  teamId: string | null;
  ready: boolean;
}

export interface LeagueDoc {
  code: string;
  hostUid: string;
  hostName: string;
  status: 'waiting' | 'playing';
  players: LeaguePlayer[];
}

export interface LeagueStanding {
  uid: string;
  name: string;
  teamId: string;
  round: number;
  season: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  budget: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ─── League management ────────────────────────────────────────────────────────

export async function createLeague(uid: string, displayName: string): Promise<string> {
  const code = makeCode();
  const league: LeagueDoc = {
    code,
    hostUid: uid,
    hostName: displayName,
    status: 'waiting',
    players: [{ uid, name: displayName, teamId: null, ready: false }],
  };
  await setDoc(doc(db, 'lenda-leagues', code), {
    ...league,
    createdAt: serverTimestamp(),
  });
  return code;
}

export async function joinLeague(
  code: string,
  uid: string,
  displayName: string,
): Promise<LeagueDoc> {
  const ref = doc(db, 'lenda-leagues', code.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Liga não encontrada. Verifique o código.');
  const league = snap.data() as LeagueDoc;
  if (league.status !== 'waiting') throw new Error('Esta liga já foi iniciada.');
  // Already joined
  if (league.players.find(p => p.uid === uid)) return league;
  const newPlayers = [...league.players, { uid, name: displayName, teamId: null, ready: false }];
  await updateDoc(ref, { players: newPlayers });
  return { ...league, players: newPlayers };
}

export async function updateLeagueTeam(
  code: string,
  uid: string,
  teamId: string,
): Promise<void> {
  const ref = doc(db, 'lenda-leagues', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const league = snap.data() as LeagueDoc;
  const newPlayers = league.players.map(p =>
    p.uid === uid ? { ...p, teamId, ready: true } : p
  );
  await updateDoc(ref, { players: newPlayers });
}

export async function startLeague(code: string): Promise<void> {
  await updateDoc(doc(db, 'lenda-leagues', code), { status: 'playing' });
}

export function listenLeague(
  code: string,
  cb: (league: LeagueDoc) => void,
): () => void {
  return onSnapshot(doc(db, 'lenda-leagues', code), snap => {
    if (snap.exists()) cb(snap.data() as LeagueDoc);
  });
}

// ─── Progress sync ────────────────────────────────────────────────────────────

export async function syncProgress(
  code: string,
  uid: string,
  save: GameSave,
): Promise<void> {
  const standing = save.standings.find(s => s.teamId === save.myTeamId);
  await setDoc(
    doc(db, 'lenda-saves', `${code}_${uid}`),
    {
      leagueCode: code,
      uid,
      name: save.playerDisplayName ?? 'Jogador',
      teamId: save.myTeamId,
      round: save.currentRound,
      season: save.currentSeason,
      points: standing?.points ?? 0,
      wins: standing?.won ?? 0,
      draws: standing?.drawn ?? 0,
      losses: standing?.lost ?? 0,
      goalsFor: standing?.goalsFor ?? 0,
      goalsAgainst: standing?.goalsAgainst ?? 0,
      budget: save.budget,
      saveJson: JSON.stringify(save),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loadOnlineSave(
  code: string,
  uid: string,
): Promise<GameSave | null> {
  const snap = await getDoc(doc(db, 'lenda-saves', `${code}_${uid}`));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data?.saveJson) return null;
  try { return JSON.parse(data.saveJson) as GameSave; } catch { return null; }
}

// ─── Real-time standings ──────────────────────────────────────────────────────

export function listenLeagueStandings(
  code: string,
  cb: (standings: LeagueStanding[]) => void,
): () => void {
  const q = query(
    collection(db, 'lenda-saves'),
    where('leagueCode', '==', code),
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => d.data() as LeagueStanding));
  });
}
