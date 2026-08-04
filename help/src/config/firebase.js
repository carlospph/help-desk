import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC68J045k2pCaKKxVewWXeqv2EOQIl6pR4",
  authDomain: "podc-16d6b.firebaseapp.com",
  projectId: "podc-16d6b",
  storageBucket: "podc-16d6b.firebasestorage.app",
  messagingSenderId: "835400394180",
  appId: "1:835400394180:web:1d2c6aa7a8c6f9de0af091"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 