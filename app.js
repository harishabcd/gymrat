import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. FIREBASE CONFIGURATION
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
// 2. SYSTEM UTILITIES & TOAST ENGINE
// ==========================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '⚠️'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Set default date picker to today
document.getElementById("log-date").valueAsDate = new Date();

// ==========================================
// 3. NAVIGATION & VIEW LOGIC
// ==========================================
const landingPage = document.getElementById("landing-page");
const appWorkspace = document.getElementById("app-workspace");
const menuItems = document.querySelectorAll(".menu-item[data-target]");
const systemViews = document.querySelectorAll(".system-view");

function showWorkspace() {
    landingPage.style.display = "none";
    appWorkspace.style.display = "flex";
    document.getElementById("display-user-email").innerText = auth.currentUser.email;
    loadSystemData();
}

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(nav => nav.classList.remove("active"));
        systemViews.forEach(view => view.style.display = "none");
        item.classList.add("active");
        document.getElementById(item.getAttribute("data-target")).style.display = "block";
    });
});

// ==========================================
// 4. AUTHENTICATION
// ==========================================
let isLoginMode = true;
document.getElementById("btn-toggle-mode").addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    document.getElementById("btn-submit").innerText = isLoginMode ? "Authenticate" : "Create Record";
    document.getElementById("name-group").style.display = isLoginMode ? "none" : "block";
});

document.getElementById("toggle-password").addEventListener("click", () => {
    const p = document.getElementById("password");
    p.type = p.type === "password" ? "text" : "password";
});

onAuthStateChanged(auth, (user) => {
    if (user) showWorkspace();
    else {
        appWorkspace.style.display = "none";
        landingPage.style.display = "flex";
    }
});

document.getElementById("btn-submit").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
            showToast("System access granted.", "success");
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
            showToast("Account provisioned successfully.", "success");
        }
    } catch (error) { showToast(error.message, "error"); }
});

document.getElementById("btn-logout").addEventListener("click", () => {
    signOut(auth);
    showToast("Session terminated.", "success");
});

// ==========================================
// 5. DATABASE OPERATIONS & TABLES
// ==========================================
let globalWorkouts = []; // Cache for filtering

document.getElementById("btn-save-workout").addEventListener("click", async () => {
    const dateInput = document.getElementById("log-date").value;
    const cat = document.getElementById("log-category").value;
    const name = document.getElementById("log-name").value;
    const sets = Number(document.getElementById("log-sets").value);
    const reps = Number(document.getElementById("log-reps").value);
    const weight = Number(document.getElementById("log-weight").value);
    const notes = document.getElementById("log-notes").value;

    if(!name || !sets || !reps || !dateInput) {
        showToast("Missing required metrics.", "error");
        return;
    }

    try {
        await addDoc(collection(db, "workouts"), {
            uid: auth.currentUser.uid,
            date: dateInput,
            category: cat,
            exercise: name,
            sets: sets,
            reps: reps,
            weight: weight || 0,
            notes: notes || "",
            timestamp: Date.now() // for exact ordering
        });
        
        showToast("Record successfully committed.", "success");
        document.getElementById("log-name").value = "";
        document.getElementById("log-sets").value = "";
        document.getElementById("log-reps").value = "";
        document.getElementById("log-weight").value = "";
        document.getElementById("log-notes").value = "";
        
        loadSystemData();
    } catch (error) { showToast(error.message, "error"); }
});

async function loadSystemData() {
    const q = query(collection(db, "workouts"), where("uid", "==", auth.currentUser.uid), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    
    globalWorkouts = [];
    let totalWorkouts = snapshot.size;
    let totalVolume = 0;
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        globalWorkouts.push(data);
        totalVolume += (data.sets * data.reps * (data.weight || 1)); // Basic volume formula
    });

    // Update Dashboard Metrics
    document.getElementById("stat-workouts").innerText = totalWorkouts;
    document.getElementById("stat-volume").innerText = totalVolume.toLocaleString();
    document.getElementById("stat-cals").innerText = (totalWorkouts * 150).toLocaleString(); // Estimated flat rate

    renderTables(globalWorkouts);
}

function renderTables(dataArray) {
    let recentRows = "";
    let historyRows = "";
    
    dataArray.forEach((data, index) => {
        const dateStr = new Date(data.date).toLocaleDateString('en-GB');
        const metrics = `${data.sets} x ${data.reps} x ${data.weight}kg`;

        if(index < 5) {
            recentRows += `
                <tr>
                    <td><strong>${data.exercise}</strong></td>
                    <td>${dateStr}</td>
                    <td>${metrics}</td>
                    <td><span class="status-badge">Logged</span></td>
                </tr>
            `;
        }
        
        historyRows += `
            <tr>
                <td>${dateStr}</td>
                <td><strong>${data.category}</strong></td>
                <td>${data.exercise}</td>
                <td>${data.sets}</td>
                <td>${data.reps}</td>
                <td>${data.weight}</td>
                <td style="color:#64748b; font-size:0.8rem;">${data.notes}</td>
            </tr>
        `;
    });

    document.getElementById("recent-table-body").innerHTML = recentRows || `<tr><td colspan="4">No database records.</td></tr>`;
    document.getElementById("history-table-body").innerHTML = historyRows || `<tr><td colspan="7">No database records.</td></tr>`;
}

// History Table Search Filter
document.getElementById("search-history").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = globalWorkouts.filter(w => w.exercise.toLowerCase().includes(term) || w.category.toLowerCase().includes(term));
    renderTables(filtered);
});

// ==========================================
// 6. EXERCISE LIBRARY ENGINE
// ==========================================
const libraryDB = [
    { name: "Barbell Bench Press", type: "Push" }, { name: "Overhead Press", type: "Push" }, { name: "Tricep Dips", type: "Push" },
    { name: "Barbell Row", type: "Pull" }, { name: "Pull-ups", type: "Pull" }, { name: "Bicep Curls", type: "Pull" },
    { name: "Back Squat", type: "Legs" }, { name: "Romanian Deadlift", type: "Legs" }, { name: "Leg Press", type: "Legs" }
];

function renderLibrary(filterType = "all") {
    const grid = document.getElementById("library-grid");
    grid.innerHTML = "";
    
    const filtered = filterType === "all" ? libraryDB : libraryDB.filter(ex => ex.type === filterType);
    
    filtered.forEach(ex => {
        grid.innerHTML += `
            <div class="lib-card">
                <h4>${ex.name}</h4>
                <p>${ex.type}</p>
            </div>
        `;
    });
}

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        renderLibrary(e.target.getAttribute("data-filter"));
    });
});

renderLibrary();