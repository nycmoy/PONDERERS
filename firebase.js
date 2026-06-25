import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// 1. Go to your Firebase project > Project settings > General > Your apps > SDK setup and configuration.
// 2. Copy the config object shown there and paste its values below.
// These values are meant to be public in client code; they are not secrets.
// Real protection comes from the Firestore security rules (firestore.rules), not from hiding this.
const firebaseConfig = {
  apiKey: "AIzaSyDRWIKiF_AcNe33qKQnIHehs3moi3kMuS0",
  authDomain: "ponderers-4c402.firebaseapp.com",
  projectId: "ponderers-4c402",
  storageBucket: "ponderers-4c402.firebasestorage.app",
  messagingSenderId: "1019066475396",
  appId: "1:1019066475396:web:b456dc5955e839cf90f3d1"
};

if (firebaseConfig.apiKey === "PASTE_ME") {
  console.error(
    "PONDERERS: Firebase is not configured yet. Open firebase.js and paste in your project's config values. See SETUP.md."
  );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
});

// One shared document for the whole household, since this app is built for exactly
// two parent accounts sharing one family's data, not a multi-tenant system.
const HOUSEHOLD_ID = "ponderers-home";
const householdRef = doc(db, "households", HOUSEHOLD_ID);
const drawingsRef = collection(db, "households", HOUSEHOLD_ID, "drawings");

window.PonderersCloud = {
  onAuth(callback) {
    return onAuthStateChanged(auth, callback);
  },

  signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signOut() {
    return firebaseSignOut(auth);
  },

  // callback receives the household data, or null if the document does not exist yet
  // (the very first time anyone signs in before any data has been pushed to the cloud).
  watchHousehold(callback) {
    return onSnapshot(
      householdRef,
      (snapshot) => callback(snapshot.exists() ? snapshot.data() : null),
      (error) => console.warn("PONDERERS: household sync error", error)
    );
  },

  saveHousehold(data) {
    return setDoc(householdRef, data);
  },

  // Most recent 30 drawings only, newest first, to keep this from growing without bound.
  watchDrawings(callback) {
    const recent = query(drawingsRef, orderBy("createdAt", "desc"), limit(30));
    return onSnapshot(
      recent,
      (snapshot) => callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (error) => console.warn("PONDERERS: drawings sync error", error)
    );
  },

  addDrawing(image) {
    return addDoc(drawingsRef, { image, createdAt: serverTimestamp() });
  },

  deleteDrawing(id) {
    return deleteDoc(doc(drawingsRef, id));
  }
};
