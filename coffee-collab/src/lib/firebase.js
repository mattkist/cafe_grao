// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVBDzDz8KLOH9aC7y9LYoqBx1C3nHpNrk",
  authDomain: "cafe-grao.firebaseapp.com",
  projectId: "cafe-grao",
  storageBucket: "cafe-grao.firebasestorage.app",
  messagingSenderId: "64336046043",
  appId: "1:64336046043:web:b409b6a85cec9a7e7969fe",
  measurementId: "G-HG1KHBHVVL"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

export default app

