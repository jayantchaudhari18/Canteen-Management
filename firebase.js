// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLdborPHxJQ5YjOG5sXAPyorYEOhAziA0",
  authDomain: "canteen-management-66a47.firebaseapp.com",
  projectId: "canteen-management-66a47",
  storageBucket: "canteen-management-66a47.firebasestorage.app",
  messagingSenderId: "561878711365",
  appId: "1:561878711365:web:fcf90ffe3e91ce3c70372c",
  measurementId: "G-GGDVYHZ4ZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);