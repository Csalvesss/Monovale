import {
  collection, addDoc, onSnapshot, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  timestamp: number;
}

/**
 * Send a text chat message to the room.
 * Stored at rooms/{roomCode}/messages/{auto-id}.
 */
export async function sendChatMessage(
  roomCode: string,
  uid: string,
  displayName: string,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, 'rooms', roomCode, 'messages'), {
    uid,
    displayName,
    text: trimmed,
    timestamp: Date.now(),
  });
}

/**
 * Listen to the last 100 chat messages for a room, ordered by timestamp ascending.
 * Returns an unsubscribe function.
 */
export function listenChatMessages(
  roomCode: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  const q = query(
    collection(db, 'rooms', roomCode, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(100),
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, 'id'>),
      })),
    );
  });
}
