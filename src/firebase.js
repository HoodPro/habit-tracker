import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYZ7OW3n81gc6Z-TdOFv8SbMzxHaY_0No",
  authDomain: "habit-tracker-fawn-five.vercel.app",
  projectId: "habit-tracker-1a9b3",
  storageBucket: "habit-tracker-1a9b3.firebasestorage.app",
  messagingSenderId: "93511086307",
  appId: "1:93511086307:web:0cba04ad520ea2f49fd5d6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();