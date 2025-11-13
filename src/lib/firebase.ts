// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSAUH8TiTzWkVSZp3GYT6TlE6Gwl776gU",
  authDomain: "bloomin-auth.firebaseapp.com",
  projectId: "bloomin-auth",
  storageBucket: "bloomin-auth.firebasestorage.app",
  messagingSenderId: "296849022448",
  appId: "1:296849022448:web:f166bcd1b2c62762179135"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);