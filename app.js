// ==========================================================
// GYMRAT CLOUD ENGINE: FIREBASE AUTH & FIRESTORE
// ==========================================================

// 1. IMPORT FIREBASE MODULAR SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// 2. FIREBASE CONFIGURATION (REPLACE WITH YOUR KEYS LATER)
const firebaseConfig = {
  apiKey: "AIzaSyDMcZEWAepTtKiIucdKmXUi2euT29XPBFM",
  authDomain: "fir-71583.firebaseapp.com",
  projectId: "fir-71583",
  storageBucket: "fir-71583.firebasestorage.app",
  messagingSenderId: "131866556311",
  appId: "1:131866556311:web:7ceea259d54cde071df6d2",
  measurementId: "G-30YD13LH3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. ANATOMY REGISTRY
const EXERCISE_CATALOG = [
  { name: "Flat Barbell Bench Press", split: "push", category: "Chest", area: "Middle Chest" },
  { name: "Incline Dumbbell Press", split: "push", category: "Chest", area: "Upper Chest" },
  { name: "High-to-Low Cable Fly", split: "push", category: "Chest", area: "Lower Chest" },
  { name: "Lat Pulldown (Wide Grip)", split: "pull", category: "Back", area: "Width" },
  { name: "Seated Cable Row", split: "pull", category: "Back", area: "Thickness" },
  { name: "Barbell Deadlift", split: "pull", category: "Back", area: "Lower Back" },
  { name: "Standing Overhead Press", split: "push", category: "Shoulders", area: "Front Delts" },
  { name: "Cable Lateral Raises", split: "push", category: "Shoulders", area: "Side Delts" },
  { name: "Incline Dumbbell Curl", split: "pull", category: "Biceps", area: "Long Head" },
  { name: "Triceps Rope Pushdown", split: "push", category: "Triceps", area: "Lateral Head" },
  { name: "Barbell Back Squats", split: "legs", category: "Legs", area: "Quads & Glutes" },
  { name: "Romanian Deadlift", split: "legs", category: "Legs", area: "Hamstrings" }
];

// Global State
let currentUser = null;
let userWorkouts = [];
let activeSession = null;
let sessionTimer = null;
let restTimerInterval = null;
let restTimeLeft = 90;

// Utility UI
const showLoader = () => document.getElementById("global-loader").style.display = "flex";
const hideLoader = () => document.getElementById("global-loader").style.display = "none";
const toast = (msg) => {
  const c = document.getElementById("toast-container");
  const el = document.createElement("div"); el.className = "toast"; el.textContent = msg;
  c.appendChild(el); setTimeout(() => { el.style.opacity="0"; setTimeout(()=>el.remove(),250); }, 2800);
};

// --- AUTHENTICATION STATE OBSERVER ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("landing-page").classList.remove("active-panel");
    document.getElementById("app-workspace").classList.add("active-panel");
    
    // Fetch Profile & Workouts
    await fetchUserProfile();
    await fetchWorkouts();
    
    switchSubView("view-dashboard");
    hideLoader();
  } else {
    currentUser = null;
    userWorkouts = [];
    document.getElementById("app-workspace").classList.remove("active-panel");
    document.getElementById("landing-page").classList.add("active-panel");
    hideLoader();
  }
});

// --- CLOUD FIRESTORE LOGIC ---
async function fetchUserProfile() {
  if (!currentUser) return;
  try {
    const docSnap = await getDoc(doc(db, "users", currentUser.uid));
    let name = "Athlete";
    if (docSnap.exists() && docSnap.data().name) {
      name = docSnap.data().name;
    }
    document.getElementById("sidebar-name-display").textContent = name;
    document.getElementById("sidebar-avatar-thumb").textContent = name.charAt(0).toUpperCase();
    document.getElementById("topbar-greeting").textContent = `Welcome Back, ${name}`;
    document.getElementById("profile-email-display").textContent = currentUser.email;
    document.getElementById("prof-name").value = name;
  } catch (e) { console.error(e); }
}

async function fetchWorkouts() {
  if (!currentUser) return;
  try {
    const q = query(collection(db, "users", currentUser.uid, "workouts"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    userWorkouts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDashboard();
  } catch (e) {
    console.error("Error fetching workouts: ", e);
    toast("Database connection failed. Make sure Firebase Config is correct.");
  }
}

// --- AUTHENTICATION MODAL LOGIC ---
const authModal = document.getElementById("auth-modal");
let authMode = "login"; // "login" or "register"

document.getElementById("landing-start-btn").addEventListener("click", () => authModal.style.display = "flex");
document.getElementById("auth-modal-close").addEventListener("click", () => authModal.style.display = "none");

document.getElementById("tab-login").addEventListener("click", (e) => {
  authMode = "login";
  e.target.classList.add("active");
  document.getElementById("tab-register").classList.remove("active");
  document.getElementById("auth-name-group").style.display = "none";
  document.getElementById("auth-submit-btn").textContent = "Sign In to Cloud";
});

document.getElementById("tab-register").addEventListener("click", (e) => {
  authMode = "register";
  e.target.classList.add("active");
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("auth-name-group").style.display = "flex";
  document.getElementById("auth-submit-btn").textContent = "Create Account";
});

document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();
  const email = document.getElementById("auth-email").value.trim();
  const pass = document.getElementById("auth-password").value.trim();
  const name = document.getElementById("auth-name").value.trim();
  const errBox = document.getElementById("auth-error-msg");
  errBox.textContent = "";

  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, pass);
      toast("Authenticated successfully.");
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, "users", cred.user.uid), { name: name || "Athlete", createdAt: Date.now() });
      toast("Account created successfully.");
    }
    authModal.style.display = "none";
  } catch (error) {
    errBox.textContent = error.message.replace("Firebase: ", "");
    hideLoader();
  }
});

document.getElementById("sidebar-logout-btn").addEventListener("click", () => {
  signOut(auth);
  toast("Logged out successfully.");
});

// --- NAVIGATION & UI LOGIC ---
function switchSubView(viewId) {
  document.querySelectorAll(".subview").forEach(v => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
  document.querySelectorAll(".side-link").forEach(l => l.classList.toggle("active", l.dataset.target === viewId));
  
  if (viewId === "view-dashboard") renderDashboard();
  if (viewId === "view-history") renderHistoryTable();
  if (viewId === "view-library") renderLibraryGrid();
  
  // Close mobile sidebar if open
  document.getElementById("app-sidebar").classList.remove("open");
  document.getElementById("mobile-sidebar-overlay").classList.remove("show");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".side-link").forEach(link => {
  link.addEventListener("click", () => switchSubView(link.dataset.target));
});

document.getElementById("brand-home-link").addEventListener("click", () => switchSubView("view-dashboard"));
document.getElementById("topbar-quick-workout-btn").addEventListener("click", () => { switchSubView("view-logger"); startActiveWorkoutSession("push"); });

// Mobile Menu Listeners
document.getElementById("mobile-open-sidebar").addEventListener("click", () => {
  document.getElementById("app-sidebar").classList.add("open");
  document.getElementById("mobile-sidebar-overlay").classList.add("show");
});
document.getElementById("mobile-close-sidebar").addEventListener("click", () => {
  document.getElementById("app-sidebar").classList.remove("open");
  document.getElementById("mobile-sidebar-overlay").classList.remove("show");
});

// --- DASHBOARD RENDERER ---
function renderDashboard() {
  const oneWeekAgo = Date.now() - (7 * 86400000);
  const weeklyWorkouts = userWorkouts.filter(w => w.timestamp >= oneWeekAgo);
  const weeklyVol = weeklyWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  
  document.getElementById("dash-weekly-vol").innerHTML = `${weeklyVol.toLocaleString()} <small>kg</small>`;
  document.getElementById("dash-total-workouts").textContent = userWorkouts.length;
  document.getElementById("dash-streak").innerHTML = `${new Set(userWorkouts.map(w => new Date(w.timestamp).toDateString())).size} <small>d</small>`;
  
  const compliance = Math.min(100, Math.round((weeklyWorkouts.length / 5) * 100));
  document.getElementById("dash-goal-compliance").textContent = `${weeklyWorkouts.length}/5`;
  document.getElementById("dash-goal-bar").style.width = `${compliance}%`;
}

// --- WORKOUT LOGGER (SAVE TO FIRESTORE) ---
function startActiveWorkoutSession(split = "push") {
  activeSession = { split: split, startTime: Date.now(), exercises: [] };
  document.getElementById("session-name-input").value = `${split.toUpperCase()} Routine`;
  document.getElementById("logger-exercises-list").innerHTML = "";
  
  const drp = document.getElementById("logger-exercise-dropdown");
  drp.innerHTML = "";
  EXERCISE_CATALOG.filter(e => e.split === split).forEach(ex => {
    const opt = document.createElement("option"); opt.value = ex.name; opt.textContent = ex.name; drp.appendChild(opt);
  });
}

document.getElementById("logger-add-exercise-btn").addEventListener("click", () => {
  const exName = document.getElementById("logger-exercise-dropdown").value;
  if (!exName) return;
  const exId = `ex-${Date.now()}`;
  const exObj = { id: exId, name: exName, sets: [] };
  activeSession.exercises.push(exObj);
  
  const card = document.createElement("div");
  card.className = "logged-exercise-card";
  card.id = exId;
  card.innerHTML = `<h4 style="margin-bottom:10px;">${exName}</h4>
    <table class="logger-sets-table"><tbody class="sets-tbody"></tbody></table>
    <button class="btn-add-set-row" data-target="${exId}">+ Add Set</button>`;
  
  document.getElementById("logger-exercises-list").appendChild(card);
});

document.getElementById("logger-exercises-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-add-set-row")) {
    const exId = e.target.dataset.target;
    const exObj = activeSession.exercises.find(x => x.id === exId);
    const setNum = exObj.sets.length + 1;
    const setObj = { setNum, weight: 60, reps: 10 };
    exObj.sets.push(setObj);
    
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>#${setNum}</td>
      <td><input type="number" class="text-input" value="60" style="width:70px; padding:4px;" onchange="this.parentElement.parentElement.dataset.w = this.value"></td>
      <td><input type="number" class="text-input" value="10" style="width:70px; padding:4px;" onchange="this.parentElement.parentElement.dataset.r = this.value"></td>`;
    
    tr.dataset.w = 60; tr.dataset.r = 10;
    tr.addEventListener("change", () => { setObj.weight = parseFloat(tr.dataset.w); setObj.reps = parseInt(tr.dataset.r); });
    document.getElementById(exId).querySelector(".sets-tbody").appendChild(tr);
  }
});

document.getElementById("logger-finish-btn").addEventListener("click", async () => {
  if (!activeSession || activeSession.exercises.length === 0) return toast("Empty workout.");
  showLoader();
  
  let tVol = 0, tSets = 0;
  activeSession.exercises.forEach(ex => ex.sets.forEach(s => { tVol += s.weight * s.reps; tSets++; }));
  
  const record = {
    name: document.getElementById("session-name-input").value || "Workout",
    split: activeSession.split,
    timestamp: Date.now(),
    duration: Math.max(1, Math.floor((Date.now() - activeSession.startTime)/60000)),
    totalVolume: tVol,
    totalSets: tSets,
    exercises: activeSession.exercises
  };

  try {
    await addDoc(collection(db, "users", currentUser.uid, "workouts"), record);
    await fetchWorkouts();
    toast("Workout saved to Cloud.");
    activeSession = null;
    switchSubView("view-history");
  } catch (error) {
    console.error(error);
    toast("Failed to save to cloud.");
  }
  hideLoader();
});

// --- HISTORY LOGIC ---
function renderHistoryTable() {
  const tbody = document.getElementById("history-tbody");
  tbody.innerHTML = "";
  userWorkouts.forEach(w => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${new Date(w.timestamp).toLocaleDateString()}</td>
      <td>${w.name}</td><td>${w.duration} min</td>
      <td>${w.totalVolume} kg</td><td>${w.totalSets}</td>
      <td><button class="btn btn-ghost btn-sm btn-del" data-id="${w.id}" style="color:var(--accent-crimson)">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById("history-tbody").addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-del")) {
    if (confirm("Delete this cloud record?")) {
      showLoader();
      await deleteDoc(doc(db, "users", currentUser.uid, "workouts", e.target.dataset.id));
      await fetchWorkouts();
      hideLoader();
      toast("Workout deleted.");
    }
  }
});

// --- LIBRARY RENDERER ---
function renderLibraryGrid() {
  const grid = document.getElementById("library-cards-grid");
  grid.innerHTML = "";
  EXERCISE_CATALOG.forEach(ex => {
    const card = document.createElement("div"); card.className = "lib-card";
    card.innerHTML = `<span style="font-size:0.65rem; color:var(--accent-crimson); font-weight:800">${ex.category} • ${ex.split}</span>
      <h4 style="margin:6px 0;">${ex.name}</h4><p style="font-size:0.75rem; color:var(--text-dim)">Target: ${ex.area}</p>`;
    grid.appendChild(card);
  });
}

// Initial UI Setup
document.getElementById("topbar-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
hideLoader();