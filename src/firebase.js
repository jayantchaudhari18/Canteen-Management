import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA3Tu2kwpxkWmr19PN-239Q_KkKz2LqOWw",
  authDomain: "e-commerce-a0df3.firebaseapp.com",
  databaseURL: "https://e-commerce-a0df3-default-rtdb.firebaseio.com",
  projectId: "e-commerce-a0df3",
  storageBucket: "e-commerce-a0df3.appspot.com",
  messagingSenderId: "833033255866",
  appId: "1:833033255866:web:6e169b0b96db697d077b83",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
