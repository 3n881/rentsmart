import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1N2nU8mLIlOtbSGqZw-g8l5AzGvkcZo8",
  authDomain: "rentsmart-ebd90.firebaseapp.com",
  projectId: "rentsmart-ebd90",
  storageBucket: "rentsmart-ebd90.firebasestorage.app",
  messagingSenderId: "1066829784692",
  appId: "1:1066829784692:web:5dc0c4fe49cbb9f7309321",
  measurementId: "G-1VM2C8JL82"
};

  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
