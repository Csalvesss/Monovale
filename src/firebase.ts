import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvR1jqpqL_UzfsoT93Nf7dYrTD8IHJhkI",
  authDomain: "monovale-d9289.firebaseapp.com",
  projectId: "monovale-d9289",
  storageBucket: "monovale-d9289.firebasestorage.app",
  messagingSenderId: "377525775109",
  appId: "1:377525775109:web:985064398669501e52256c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Enable IndexedDB offline persistence so writes resolve from local cache
// immediately (no waiting for server ACK), then sync to Firestore in background.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
