/**
 * =========================================================================
 * BRAIN AI CLUB - Firebase Configuration & CMS Helpers
 * =========================================================================
 * 
 * Instructions:
 * 1. Go to https://console.firebase.google.com and create a project (e.g. "brain-ai-club").
 * 2. Click on the Web icon (</>) to create a web app.
 * 3. Copy your firebaseConfig object and replace the values below.
 * 4. In Firebase Console:
 *    - Enable "Authentication" -> Sign-in method -> Email/Password.
 *    - Enable "Cloud Firestore" -> Create database (Start in test mode or set security rules).
 *    - Enable "Storage" -> Get started (Start in test mode or set security rules).
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if user has pasted real config
function isFirebaseConfigured() {
  return firebaseConfig && 
         firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

let auth = null;
let db = null;
let storage = null;

if (typeof firebase !== 'undefined') {
  try {
    if (isFirebaseConfigured()) {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      storage = firebase.storage();
      console.log("Firebase initialized successfully for BRAIN AI CLUB");
    } else {
      console.warn("Firebase config has placeholders. Please add your credentials in firebase-config.js.");
    }
  } catch (err) {
    console.error("Error initializing Firebase:", err);
  }
}

// -------------------------------------------------------------
// CMS HELPERS: Section Content (Hero, College, About, etc.)
// -------------------------------------------------------------

// Save or update section data in Firestore
async function saveSectionData(sectionName, data) {
  if (!db) throw new Error("Firebase database not connected.");
  const docRef = db.collection("site_content").doc(sectionName);
  await docRef.set({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return true;
}

// Get single section data from Firestore
async function getSectionData(sectionName) {
  if (!db) return null;
  try {
    const docRef = db.collection("site_content").doc(sectionName);
    const doc = await docRef.get();
    if (doc.exists) {
      return doc.data();
    }
  } catch (err) {
    console.error(`Error loading section ${sectionName}:`, err);
  }
  return null;
}

// Get all site content sections in one call
async function getAllSiteContent() {
  if (!db) return {};
  try {
    const snapshot = await db.collection("site_content").get();
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    return result;
  } catch (err) {
    console.error("Error loading site content:", err);
    return {};
  }
}

// -------------------------------------------------------------
// CMS HELPERS: Events Management
// -------------------------------------------------------------

// Fetch all events ordered by date/creation
async function getEvents() {
  if (!db) return [];
  try {
    const snapshot = await db.collection("events").orderBy("createdAt", "desc").get();
    const events = [];
    snapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events;
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
}

// Add or update an event
async function saveEvent(eventId, eventData) {
  if (!db) throw new Error("Firebase database not connected.");
  if (eventId) {
    await db.collection("events").doc(eventId).set({
      ...eventData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return eventId;
  } else {
    const docRef = await db.collection("events").add({
      ...eventData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  }
}

// Delete an event
async function deleteEvent(eventId) {
  if (!db) throw new Error("Firebase database not connected.");
  await db.collection("events").doc(eventId).delete();
  return true;
}

// -------------------------------------------------------------
// CMS HELPERS: Image Uploads to Firebase Storage
// -------------------------------------------------------------

// Upload a single file with progress callback
function uploadImageFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    if (!storage) {
      return reject(new Error("Firebase Storage is not connected."));
    }
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = storage.ref(`${path}/${Date.now()}_${cleanFileName}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (typeof onProgress === 'function') {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        resolve(downloadURL);
      }
    );
  });
}
