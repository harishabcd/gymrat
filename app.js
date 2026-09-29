import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
// 2. UI ELEMENTS & NAVIGATION LOGIC
// ==========================================
const landingPage = document.getElementById("landing-page");
const appWorkspace = document.getElementById("app-workspace");
const viewLogger = document.getElementById("view-logger");
const viewHistory = document.getElementById("view-history");
const navLogger = document.getElementById("nav-logger");
const navHistory = document.getElementById("nav-history");

// Switch to Dashboard
function showDashboard() {
    landingPage.style.display = "none";
    appWorkspace.style.display = "block";
    window.scrollTo(0, 0); // Force scroll to top
}

// Switch back to Login Screen
function showLandingPage() {
    appWorkspace.style.display = "none";
    landingPage.style.display = "flex";
}

// Internal Menu Tabs
navLogger.addEventListener("click", () => {
    viewLogger.style.display = "block";
    viewHistory.style.display = "none";
    navLogger.classList.add("active");
    navHistory.classList.remove("active");
});

navHistory.addEventListener("click", () => {
    viewLogger.style.display = "none";
    viewHistory.style.display = "block";
    navHistory.classList.add("active");
    navLogger.classList.remove("active");
    loadHistory(); // Load data when clicking history tab
});

// ==========================================
// 3. AUTHENTICATION LOGIC
// ==========================================
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const authError = document.getElementById("auth-error");

// Listen for Login Status
onAuthStateChanged(auth, (user) => {
    if (user) {
        showDashboard();
    } else {
        showLandingPage();
    }
});

// Sign Up
document.getElementById("btn-signup").addEventListener("click", async () => {
    try {
        authError.innerText = "";
        await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
    } catch (error) {
        authError.innerText = error.message;
    }
});

// Sign In
document.getElementById("btn-login").addEventListener("click", async () => {
    try {
        authError.innerText = "";
        await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
    } catch (error) {
        authError.innerText = "Invalid credentials. Try again.";
    }
});

// Logout
document.getElementById("btn-logout").addEventListener("click", async () => {
    await signOut(auth);
    emailInput.value = "";
    passInput.value = "";
});

// ==========================================
// 4. DATABASE LOGIC (FIRESTORE)
// ==========================================
// Save Workout
document.getElementById("btn-save-workout").addEventListener("click", async () => {
    const name = document.getElementById("exercise-name").value;
    const weight = document.getElementById("exercise-weight").value;
    const reps = document.getElementById("exercise-reps").value;
    const statusText = document.getElementById("save-status");

    if(!name || !weight || !reps) {
        statusText.style.color = "red";
        statusText.innerText = "Please fill all fields.";
        return;
    }

    try {
        await addDoc(collection(db, "workouts"), {
            uid: auth.currentUser.uid,
            exercise: name,
            weight: Number(weight),
            reps: Number(reps),
            date: new Date().toISOString()
        });
        
        statusText.style.color = "#22c55e";
        statusText.innerText = "Workout Saved Successfully!";
        
        // Clear inputs
        document.getElementById("exercise-name").value = "";
        document.getElementById("exercise-weight").value = "";
        document.getElementById("exercise-reps").value = "";
        
        setTimeout(() => statusText.innerText = "", 3000);
    } catch (error) {
        statusText.style.color = "red";
        statusText.innerText = "Database Error: " + error.message;
    }
});

// Load History
async function loadHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "Loading...";
    
    try {
        const q = query(collection(db, "workouts"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        list.innerHTML = "";
        let hasData = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only show workouts for the logged-in user
            if(data.uid === auth.currentUser.uid) {
                hasData = true;
                const li = document.createElement("li");
                li.innerText = `${data.exercise} - ${data.weight}kg x ${data.reps} reps`;
                list.appendChild(li);
            }
        });

        if(!hasData) list.innerHTML = "No workouts found.";
        
    } catch (error) {
        list.innerHTML = "Error loading history.";
    }
}