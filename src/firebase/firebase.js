import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArVWgqb1A-Ku9PIdphsGRLFxbJtCKkzTw",
  authDomain: "car-dealership-bb0eb.firebaseapp.com",
  projectId: "car-dealership-bb0eb",
  storageBucket: "car-dealership-bb0eb.firebasestorage.app",
  messagingSenderId: "950798374860",
  appId: "1:950798374860:web:e70cb4195cfd0cd2352f69",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
