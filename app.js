import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. YOUR REAL FIREBASE CONFIG (DO NOT CHANGE)
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
// 2. EXERCISE DATABASE
// ==========================================
const exerciseDB = {
    "Chest": ["Flat Bench Press", "Incline Dumbbell Press", "Chest Dumbbell Pullover", "Cable Crossovers"],
    "Back": ["Barbell Row", "Rack Pulls", "Lat Pulldown", "Pull-ups"],
    "Legs": ["Squats", "Leg Press", "Romanian Deadlift", "Calf Raises"],
    "Shoulders": ["Overhead Press", "Lateral Raises", "Face Pulls"],
    "Arms": ["Bicep Curls (Incline Angle)", "Tricep Pushdowns", "Hammer Curls", "Skull Crushers"]
};

// ==========================================
// 3. UI & NAVIGATION LOGIC
// ==========================================
const views = {
    profile: document.getElementById("view-profile"),
    tracker: document.getElementById("view-tracker"),
    library: document.getElementById("view-library"),
    special: document.getElementById("view-special")
};
const navBtns = {
    profile: document.getElementById("nav-profile"),
    tracker: document.getElementById("nav-tracker"),
    library: document.getElementById("nav-library"),
    special: document.getElementById("nav-special")
};

function switchView(targetView) {
    // Hide all views and remove active class from all buttons
    Object.keys(views).forEach(key => {
        views[key].style.display = "none";
        navBtns[key].classList.remove("active");
    });
    // Show target view and set active button
    views[targetView].style.display = "block";
    navBtns[targetView].classList.add("active");

    if(targetView === 'profile') loadHistory();
    if(targetView === 'library') loadLibrary();
}

// Attach click listeners to nav buttons
Object.keys(navBtns).forEach(key => {
    navBtns[key].addEventListener("click", () => switchView(key));
});

function showDashboard() {
    document.getElementById("landing-page").style.display = "none";
    document.getElementById("app-workspace").style.display = "block";
    switchView('tracker'); // Default to tracker on login
}

function showLandingPage() {
    document.getElementById("app-workspace").style.display = "none";
    document.getElementById("landing-page").style.display = "flex";
}

// Password Toggle Logic
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
});

// ==========================================
// 4. WORKOUT TRACKER LOGIC
// ==========================================
const muscleSelect = document.getElementById("muscle-group-select");
const exerciseSelect = document.getElementById("exercise-select");

muscleSelect.addEventListener("change", (e) => {
    const selectedMuscle = e.target.value;
    exerciseSelect.innerHTML = '<option value="">-- Select Exercise --</option>'; // Reset
    
    if (selectedMuscle && exerciseDB[selectedMuscle]) {
        exerciseSelect.disabled = false;
        exerciseDB[selectedMuscle].forEach(ex => {
            const opt = document.createElement("option");
            opt.value = ex;
            opt.innerText = ex;
            exerciseSelect.appendChild(opt);
        });
    } else {
        exerciseSelect.disabled = true;
    }
});

// ==========================================
// 5. AUTHENTICATION
// ==========================================
const emailInput = document.getElementById("email");
const authError = document.getElementById("auth-error");

onAuthStateChanged(auth, (user) => {
    if (user) showDashboard();
    else showLandingPage();
});

document.getElementById("btn-signup").addEventListener("click", async () => {
    try {
        authError.innerText = "";
        await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error) { authError.innerText = error.message; }
});

document.getElementById("btn-login").addEventListener("click", async () => {
    try {
        authError.innerText = "";
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error) { authError.innerText = "Invalid credentials. Try again."; }
});

document.getElementById("btn-logout").addEventListener("click", async () => {
    await signOut(auth);
    emailInput.value = "";
    passwordInput.value = "";
});

// ==========================================
// 6. DATABASE LOGIC (FIRESTORE)
// ==========================================
document.getElementById("btn-save-workout").addEventListener("click", async () => {
    const name = exerciseSelect.value;
    const weight = document.getElementById("exercise-weight").value;
    const reps = document.getElementById("exercise-reps").value;
    const statusText = document.getElementById("save-status");

    if(!name || !weight || !reps) {
        statusText.style.color = "red";
        statusText.innerText = "Select exercise and enter weight/reps.";
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
        statusText.innerText = "Set Logged Successfully!";
        document.getElementById("exercise-weight").value = "";
        document.getElementById("exercise-reps").value = "";
        setTimeout(() => statusText.innerText = "", 3000);
    } catch (error) {
        statusText.style.color = "red";
        statusText.innerText = "Database Error: " + error.message;
    }
});

async function loadHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "Loading your growth data...";
    
    try {
        const q = query(collection(db, "workouts"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        list.innerHTML = "";
        let hasData = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if(data.uid === auth.currentUser.uid) {
                hasData = true;
                const li = document.createElement("li");
                li.innerText = `${new Date(data.date).toLocaleDateString()} | ${data.exercise} - ${data.weight}kg x ${data.reps} reps`;
                list.appendChild(li);
            }
        });

        if(!hasData) list.innerHTML = "No workouts logged yet. Start lifting!";
    } catch (error) { list.innerHTML = "Error loading history."; }
}

// Load Exercise Library for Search Tab
function loadLibrary() {
    const libraryList = document.getElementById("library-list");
    const searchInput = document.getElementById("search-library");
    
    // Flatten the database into one array
    let allExercises = [];
    Object.values(exerciseDB).forEach(arr => allExercises = allExercises.concat(arr));
    
    const renderList = (filterText = "") => {
        libraryList.innerHTML = "";
        allExercises.filter(ex => ex.toLowerCase().includes(filterText.toLowerCase())).forEach(ex => {
            const li = document.createElement("li");
            li.innerText = ex;
            libraryList.appendChild(li);
        });
    };
    
    renderList(); // Initial render
    searchInput.addEventListener("input", (e) => renderList(e.target.value));
}