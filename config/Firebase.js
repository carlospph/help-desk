import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração 
const firebaseConfig = {
    apiKey: "AIzaSyC68J045k2pCaKKxVewWXeqv2EOQIl6pR4",
    authDomain: "podc-16d6b.firebaseapp.com",
    projectId: "podc-16d6b",
    storageBucket: "podc-16d6b.firebasestorage.app",
    messagingSenderId: "835400394180",
    appId: "1:835400394180:web:c71fb2295513c2a10af091"
  };

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Firestore Database
export const db = getFirestore(app);
