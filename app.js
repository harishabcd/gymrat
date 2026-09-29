import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. YOUR REAL FIREBASE CONFIG 
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDMcZEWAepTtKiIucdKmXUi2euT29XPBFM",
  authDomain: "fir-71583.firebaseapp.com",
  projectId: "fir-71583",
  storageBucket: "fir-71583.firebasestorage.app",
  messagingSenderId: "131866556311",
  appId: "1:131866556311:web:7ceea259d54cde071df6d2",
  measurementId: "G-30YD13LH3Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. SIDEBAR & NAVIGATION LOGIC
// ==========================================
const landingPage = document.getElementById("landing-page");
const appWorkspace = document.getElementById("app-workspace");
const menuItems = document.querySelectorAll(".menu-item[data-target]");
const systemViews = document.querySelectorAll(".system-view");

function showWorkspace() {
    landingPage.style.display = "none";
    appWorkspace.style.display = "flex";
    loadSystemData(); // Fetch DB data
}

function showLandingPage() {
    appWorkspace.style.display = "none";
    landingPage.style.display = "flex";
}

// Sidebar Click Logic
menuItems.forEach(item => {
    item.addEventListener("click", () => {
        // Remove active class from all
        menuItems.forEach(nav => nav.classList.remove("active"));
        systemViews.forEach(view => view.style.display = "none");
        
        // Activate clicked
        item.classList.add("active");
        document.getElementById(item.getAttribute("data-target")).style.display = "block";
    });
});

// ==========================================
// 3. AUTHENTICATION LOGIC
// ==========================================
let isLoginMode = true;

document.getElementById("btn-toggle-mode").addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    document.getElementById("auth-title").innerText = isLoginMode ? "Login" : "Register Account";
    document.getElementById("auth-subtitle").innerText = isLoginMode ? "Welcome back to GYMRAT" : "Join the System Tracker";
    document.getElementById("btn-submit").innerText = isLoginMode ? "Login" : "Register";
    document.getElementById("btn-toggle-mode").innerText = isLoginMode ? "Register" : "Login";
    document.getElementById("name-group").style.display = isLoginMode ? "none" : "block";
});

document.getElementById("toggle-password").addEventListener("click", () => {
    const passInput = document.getElementById("password");
    passInput.type = passInput.type === "password" ? "text" : "password";
});

onAuthStateChanged(auth, (user) => {
    if (user) showWorkspace();
    else showLandingPage();
});

document.getElementById("btn-submit").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const errorEl = document.getElementById("auth-error");
    errorEl.innerText = "";

    try {
        if (isLoginMode) await signInWithEmailAndPassword(auth, email, pass);
        else await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) { errorEl.innerText = error.message; }
});

document.getElementById("btn-logout").addEventListener("click", () => signOut(auth));

// ==========================================
// 4. SYSTEM DATABASE LOGIC (FIRESTORE TO TABLES)
// ==========================================
document.getElementById("btn-save-workout").addEventListener("click", async () => {
    const name = document.getElementById("log-name").value;
    const sets = Number(document.getElementById("log-sets").value);
    const reps = Number(document.getElementById("log-reps").value);
    const weight = Number(document.getElementById("log-weight").value);
    const cals = Number(document.getElementById("log-cals").value);
    const statusText = document.getElementById("save-status");

    if(!name || !sets || !reps) {
        statusText.style.color = "#ef4444";
        statusText.innerText = "Please fill required fields (Name, Sets, Reps).";
        return;
    }

    try {
        await addDoc(collection(db, "workouts"), {
            uid: auth.currentUser.uid,
            exercise: name,
            sets: sets,
            reps: reps,
            weight: weight || 0,
            calories: cals || 0,
            date: new Date().toISOString()
        });
        
        statusText.style.color = "#10b981";
        statusText.innerText = "Workout successfully logged to database!";
        
        // Clear inputs
        document.querySelectorAll(".form-group input").forEach(input => input.value = "");
        setTimeout(() => statusText.innerText = "", 3000);
        
        loadSystemData(); // Refresh Tables
    } catch (error) {
        statusText.style.color = "#ef4444";
        statusText.innerText = "Error: " + error.message;
    }
});

async function loadSystemData() {
    const q = query(collection(db, "workouts"), where("uid", "==", auth.currentUser.uid), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    
    let totalWorkouts = snapshot.size;
    let totalSets = 0;
    let totalCals = 0;
    
    let recentRows = "";
    let historyRows = "";
    let count = 0;

    snapshot.forEach((doc) => {
        const data = doc.data();
        totalSets += data.sets || 0;
        totalCals += data.calories || 0;
        
        const dateStr = new Date(data.date).toLocaleDateString();

        const tableRow = `
            <tr>
                <td><strong>${data.exercise}</strong></td>
                <td>${data.sets}</td>
                <td>${data.reps}</td>
                <td>${data.weight} kg</td>
                <td>${dateStr}</td>
            </tr>
        `;
        
        const fullHistoryRow = `
            <tr>
                <td><strong>${data.exercise}</strong></td>
                <td>${data.sets}</td>
                <td>${data.reps}</td>
                <td>${data.weight} kg</td>
                <td>${data.calories} kcal</td>
                <td>${dateStr}</td>
            </tr>
        `;

        if(count < 5) recentRows += tableRow;
        historyRows += fullHistoryRow;
        count++;
    });

    // Update Top Stats
    document.getElementById("stat-workouts").innerText = totalWorkouts;
    document.getElementById("stat-sets").innerText = totalSets;
    document.getElementById("stat-cals").innerText = totalCals;

    // Populate Tables
    document.getElementById("recent-table-body").innerHTML = recentRows || `<tr><td colspan="5">No records found.</td></tr>`;
    document.getElementById("history-table-body").innerHTML = historyRows || `<tr><td colspan="6">No records found.</td></tr>`;
}

// Basic Exercise Library populator
const exercises = ["Barbell Bench Press", "Incline Dumbbell Press", "Barbell Squat", "Leg Press", "Deadlift", "Pull-ups", "Overhead Press"];
const libList = document.getElementById("library-list");

function renderLibrary(filter = "") {
    libList.innerHTML = "";
    exercises.filter(ex => ex.toLowerCase().includes(filter.toLowerCase())).forEach(ex => {
        const li = document.createElement("li");
        li.innerText = ex;
        libList.appendChild(li);
    });
}
renderLibrary();
document.getElementById("search-lib").addEventListener("input", (e) => renderLibrary(e.target.value));