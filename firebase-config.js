import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

//11.3.1

const firebaseConfig = {
  apiKey: "AIzaSyDcbsM-EzVP3XGvjhbW1Uq3NrfFDL2dLsc",
  authDomain: "yogesh-3efb4.firebaseapp.com",
  projectId: "yogesh-3efb4",
  storageBucket: "yogesh-3efb4.firebasestorage.app",
  messagingSenderId: "163481207003",
  appId: "1:163481207003:web:b4fb6b535ad4e59e1c0cfe",
  measurementId: "G-N23P011LTK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
