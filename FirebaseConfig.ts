// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUuDxE3Z9eebQt3xC8iNj1L8f02RLg30s",
  authDomain: "app2-d24f8.firebaseapp.com",
  projectId: "app2-d24f8",
  storageBucket: "app2-d24f8.firebasestorage.app",
  messagingSenderId: "771549512247",
  appId: "1:771549512247:web:deacc3bb7d0357805535b2"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);