import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBUGBT40p6ykwHW6vHV_LQmMxr4pl5wjpI",
  authDomain: "apoyo-analisis.firebaseapp.com",
  projectId: "apoyo-analisis",
  storageBucket: "apoyo-analisis.firebasestorage.app",
  messagingSenderId: "238720844975",
  appId: "1:238720844975:web:f064f1d4bf4ecc599b005a",
  measurementId: "G-V2R3M7DEPL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 