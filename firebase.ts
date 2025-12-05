import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  CollectionReference, 
  DocumentData,
} from "firebase/firestore";

import { 
    initializeAuth, 
    getReactNativePersistence, 
    signInWithEmailAndPassword, // Tambahkan untuk login
    createUserWithEmailAndPassword, // Tambahkan untuk register
    onAuthStateChanged, 
    signOut,
    User 
} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyCrCBkg7w8OWfPcF_THclMwnehsYh28o5E",
  authDomain: "chatapp1-82b76.firebaseapp.com",
  projectId: "chatapp1-82b76",
  storageBucket: "chatapp1-82b76.firebasestorage.app",
  messagingSenderId: "585066889948",
  appId: "1:585066889948:web:c67f87d371e06837d3ea19"
};

const app = initializeApp(firebaseConfig);

// Inisialisasi Auth dengan Persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

// CollectionReference untuk pesan
export const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;

export {
  auth,
  db,
  collection,
  addDoc,
  serverTimestamp,
  onAuthStateChanged,
  query,
  orderBy,
  onSnapshot,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
};
