// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Adiciona para autenticação

const firebaseConfig = {
  apiKey: "AIzaSyD2NaS9ilCo5zo2stgKyAsvukABnyFty10",
  authDomain: "planet-pulse-12409.firebaseapp.com",
  projectId: "planet-pulse-12409",
  storageBucket: "planet-pulse-12409.firebasestorage.app",
  messagingSenderId: "250840370566",
  appId: "1:250840370566:web:ef866a1ec1f4628825f007",
  measurementId: "G-52NBDK957Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);


const auth = getAuth(app);
export { auth };
