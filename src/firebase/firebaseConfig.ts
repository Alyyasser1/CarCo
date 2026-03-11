import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKEbPbJUWr-5zcDH8wjLjPRLyt0Ye93Es",
  authDomain: "carco-cacf2.firebaseapp.com",
  projectId: "carco-cacf2",
  storageBucket: "carco-cacf2.firebasestorage.app",
  messagingSenderId: "9913869190",
  appId: "1:9913869190:web:dc23f540d0e21ac39c0207",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
