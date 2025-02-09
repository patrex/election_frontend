// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCk4UNfF2ysPSLAK19bTLNEgcH7mmHb6rk",
  authDomain: "votersystem-0.firebaseapp.com",
  projectId: "votersystem-0",
  storageBucket: "votersystem-0.appspot.com",
  messagingSenderId: "1092253546792",
  appId: "1:1092253546792:web:260b76bf41b2797f6f381d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const fireman = getStorage(app);
export const authman = getAuth(app);