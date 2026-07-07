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
  getDoc,
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

let activeContextPromise = null;

function userRef(uid) {
  return doc(db, "users", uid);
}

function householdRef(householdId) {
  return doc(db, "households", householdId);
}

function memberRef(householdId, uid) {
  return doc(db, "households", householdId, "members", uid);
}

function drawingsRef(householdId) {
  return collection(db, "households", householdId, "drawings");
}

async function resolveActiveContext(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not signed in.");
  }

  if (!forceRefresh && activeContextPromise) {
    return activeContextPromise;
  }

  activeContextPromise = (async () => {
    const userSnap = await getDoc(userRef(user.uid));
    if (!userSnap.exists()) {
      throw new Error("Your user profile was not found.");
    }

    const userData = userSnap.data();
    const householdId = userData.defaultHouseholdId;
    if (!householdId) {
      throw new Error("No default household is set for this user.");
    }

    const memberSnap = await getDoc(memberRef(householdId, user.uid));
    if (!memberSnap.exists()) {
      throw new Error("You are not a member of this household.");
    }

    const memberData = memberSnap.data();
    if (memberData.status !== "active") {
      throw new Error("Your household membership is not active.");
    }

    return {
      uid: user.uid,
      email: user.email || "",
      householdId,
      role: memberData.role || "",
      memberStatus: memberData.status || "",
      displayName: memberData.displayName || userData.displayName || user.email || "Parent"
    };
  })();

  try {
    return await activeContextPromise;
  } catch (error) {
    activeContextPromise = null;
    throw error;
  }
}

function clearActiveContext() {
  activeContextPromise = null;
}

window.PonderersCloud = {
  onAuth(callback) {
    return onAuthStateChanged(auth, async (user) => {
      clearActiveContext();

      if (!user) {
        callback(null);
        return;
      }

      try {
        const context = await resolveActiveContext(true);
        callback(user, context);
      } catch (error) {
        console.warn("PONDERERS: could not resolve household context", error);
        callback(user, null, error);
      }
    });
  },

  signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signOut() {
    clearActiveContext();
    return firebaseSignOut(auth);
  },

  async getSessionContext() {
    return resolveActiveContext();
  },

  async watchHousehold(callback) {
    const context = await resolveActiveContext();
    return onSnapshot(
      householdRef(context.householdId),
      (snapshot) => callback(snapshot.exists() ? snapshot.data() : null, context),
      (error) => console.warn("PONDERERS: household sync error", error)
    );
  },

  async saveHousehold(data) {
    const context = await resolveActiveContext();
    return setDoc(householdRef(context.householdId), data, { merge: true });
  },

  async watchDrawings(callback) {
    const context = await resolveActiveContext();
    const recent = query(
      drawingsRef(context.householdId),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    return onSnapshot(
      recent,
      (snapshot) =>
        callback(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
          context
        ),
      (error) => console.warn("PONDERERS: drawings sync error", error)
    );
  },

  async addDrawing(image) {
    const context = await resolveActiveContext();
    return addDoc(drawingsRef(context.householdId), {
      image,
      createdAt: serverTimestamp()
    });
  },

  async deleteDrawing(id) {
    const context = await resolveActiveContext();
    return deleteDoc(doc(drawingsRef(context.householdId), id));
  }
};
