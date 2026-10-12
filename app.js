import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, initializeAuth, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";



// Check session on page load
window.addEventListener("DOMContentLoaded", () => {
    const loginOverlay = document.getElementById("login-overlay");
    const isSessionActive = sessionStorage.getItem("gymrat_session_active");
    
    if (isSessionActive) {
        if (loginOverlay) loginOverlay.style.setProperty('display', 'none', 'important');
    } else {
        if (loginOverlay) loginOverlay.style.setProperty('display', 'flex', 'important');
    }
});

// PASTE YOUR REAL FIREBASE KEYS HERE
const firebaseConfig = {
    apiKey: "AIzaSyDMcZEWAepTtKiIucdKmXUi2euT29XPBFM",
    authDomain: "fir-71583.firebaseapp.com",
    projectId: "fir-71583",
    storageBucket: "fir-71583.firebasestorage.app",
    messagingSenderId: "131866556311",
    appId: "1:131866556311:web:7ceea259d54cde071df6d2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});

// Global object to store history for AI calculations
window.exerciseHistory = {};

// ==========================================
// --- SIDEBAR MENU & TAB NAVIGATION LOGIC ---
// ==========================================
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const menuCloseBtn = document.getElementById('menu-close-btn');
const sideMenu = document.getElementById('side-menu');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.system-view');

function toggleMenu() {
    if (sideMenu && sideMenu.classList.contains('side-menu-closed')) {
        sideMenu.classList.remove('side-menu-closed');
        sideMenu.classList.add('side-menu-open');
        if (menuToggleBtn) menuToggleBtn.style.transform = "rotate(90deg)";
    } else if (sideMenu) {
        sideMenu.classList.remove('side-menu-open');
        sideMenu.classList.add('side-menu-closed');
        if (menuToggleBtn) menuToggleBtn.style.transform = "rotate(0deg)";
    }
}

if (menuToggleBtn) menuToggleBtn.addEventListener('click', toggleMenu);
if (menuCloseBtn) menuCloseBtn.addEventListener('click', toggleMenu);

// Reusable navigation function for menus AND quick action buttons
function navigateToView(targetId) {
    // Hide all views
    views.forEach(view => {
        view.style.display = 'none';
        view.classList.remove('fade-in'); 
    });
    
    // Show target view
    const activeView = document.getElementById(targetId);
    if (activeView) {
        activeView.style.display = 'block';
        void activeView.offsetWidth; // Force reflow
        activeView.classList.add('fade-in');
    }

    // Update active class on side menu items
    navItems.forEach(nav => {
        if (nav.getAttribute('data-target') === targetId) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
}

// Side Menu Clicks
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (sideMenu && sideMenu.classList.contains('side-menu-open')) toggleMenu();
        navigateToView(item.getAttribute('data-target'));
    });
});

// Quick Action Button Clicks (Log Workout & Water Intake)
document.getElementById('quick-log-btn')?.addEventListener('click', () => navigateToView('view-log'));
document.getElementById('quick-water-btn')?.addEventListener('click', () => navigateToView('view-water'));


// ==========================================
// --- SMART DROPDOWNS & LIVE AI TARGET ---
// ==========================================
const exerciseDB = {
    "Chest": ["Barbell Bench Press", "Incline Barbell Press", "Dumbbell Bench Press", "Incline Dumbbell Press", "Machine Chest Press", "Cable Fly", "Pec Deck", "Chest Dips", "Push-Ups"],
    "Back": ["Pull-Ups", "Lat Pulldown", "Barbell Row", "T-Bar Row", "Chest-Supported Row", "Seated Cable Row", "Single-Arm Dumbbell Row", "Straight-Arm Pulldown", "Deadlift"],
    "Shoulders": ["Barbell Overhead Press", "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press", "Dumbbell Lateral Raise", "Cable Lateral Raise", "Reverse Pec Deck", "Rear-Delt Cable Fly", "Face Pull"],
    "Biceps": ["Barbell Curl", "EZ-Bar Curl", "Dumbbell Curl", "Incline Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Cable Curl", "Concentration Curl"],
    "Triceps": ["Close-Grip Bench Press", "Rope Pushdown", "Straight-Bar Pushdown", "Overhead Cable Extension", "Skull Crushers", "Dumbbell Overhead Extension", "Triceps Dips", "Cable Kickback"],
    "Forearms": ["Wrist Curl", "Reverse Wrist Curl", "Reverse Curl", "Hammer Curl", "Farmer's Walk", "Dead Hang", "Wrist Roller", "Plate Pinch"],
    "Abdominals": ["Cable Crunch", "Machine Crunch", "Hanging Knee Raise", "Hanging Leg Raise", "Reverse Crunch", "Ab Wheel Rollout", "Decline Sit-Up", "Plank"],
    "Obliques": ["Cable Woodchopper", "Cable Side Bend", "Russian Twist", "Side Plank", "Hanging Oblique Knee Raise", "Pallof Press"],
    "Lower Back": ["Deadlift", "Romanian Deadlift", "Good Morning", "Back Extension", "Reverse Hyperextension"],
    "Quads": ["Back Squat", "Front Squat", "Hack Squat", "Leg Press", "Bulgarian Split Squat", "Walking Lunges", "Reverse Lunges", "Leg Extension", "Step-Ups"],
    "Hamstrings": ["Romanian Deadlift", "Stiff-Leg Deadlift", "Seated Leg Curl", "Lying Leg Curl", "Nordic Curl", "Glute-Ham Raise", "Good Morning"],
    "Glutes": ["Barbell Hip Thrust", "Smith Machine Hip Thrust", "Bulgarian Split Squat", "Romanian Deadlift", "Walking Lunges", "Reverse Lunges", "Cable Kickback", "Hip Abduction"],
    "Calves": ["Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise", "Smith Machine Calf Raise", "Single-Leg Calf Raise", "Donkey Calf Raise"],
    "Adductors": ["Adductor Machine", "Cable Adduction", "Copenhagen Plank", "Cossack Squat", "Sumo Squat"],
    "Abductors": ["Abductor Machine", "Cable Abduction", "Side-Lying Hip Abduction", "Banded Lateral Walk"]
};

const catSelect = document.getElementById("log-category");
const exSelect = document.getElementById("log-exercise");

function updateAITarget(exercise) {
    const targetContainer = document.getElementById("ai-dynamic-target");
    if (!targetContainer || !exercise) return;

    const history = window.exerciseHistory[exercise];
    
    if (history && history.length > 0) {
        const lastSession = history[0]; 
        let text = "";
        
        if (lastSession.reps >= 10) {
            text = `🎯 AI Target: <strong style="color: white; font-size: 1.1rem;">${lastSession.weight + 2.5}kg</strong> for 8 reps`;
        } else {
            text = `🎯 AI Target: <strong style="color: white; font-size: 1.1rem;">${lastSession.weight}kg</strong> for ${lastSession.reps + 1} reps`;
        }
        
        targetContainer.innerHTML = `
            <div class="fade-in" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 10px 15px; border-radius: 8px; font-size: 0.9rem; animation: pulseGlowGreen 2s infinite;">
                ${text}
            </div>
        `;
    } else {
        targetContainer.innerHTML = `
            <div class="fade-in" style="background: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px dashed rgba(100, 116, 139, 0.5); padding: 10px 15px; border-radius: 8px; font-size: 0.85rem;">
                📊 First time doing ${exercise}? Log a baseline weight to unlock AI targets!
            </div>
        `;
    }
}

function updateExerciseDropdown() {
    if (!exSelect || !catSelect) return;
    exSelect.innerHTML = "";
    const exercises = exerciseDB[catSelect.value] || [];
    exercises.forEach(ex => {
        exSelect.innerHTML += `<option value="${ex}">${ex}</option>`;
    });
    updateAITarget(exSelect.value);
}

if (catSelect) {
    catSelect.addEventListener("change", updateExerciseDropdown);
    updateExerciseDropdown();
}

if (exSelect) {
    exSelect.addEventListener("change", () => updateAITarget(exSelect.value));
}

const logDateEl = document.getElementById("log-date");
if (logDateEl) logDateEl.valueAsDate = new Date();

function showToast(msg) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast fade-in";
    toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--primary-cyan); margin-right: 10px;"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==========================================
// --- FIREBASE CRUD, DASHBOARD, & AI INSIGHTS ---
// ==========================================
async function loadSystemData() {
    const user = auth.currentUser;
    if (!user) return; // Stop if no one is logged in

    try {
        const q = query(collection(db, "workouts"), where("userId", "==", user.uid), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        
        const historyBody = document.getElementById("history-table-body");
        const recentBody = document.getElementById("recent-table-body");
        if (historyBody) historyBody.innerHTML = "";
        if (recentBody) recentBody.innerHTML = "";
        
        let totalCals = 0, totalMins = 0, count = 0;
        window.exerciseHistory = {}; 
        
        snapshot.forEach((document) => {
            const row = document.data();
            const id = document.id;
            count++;
            totalMins += (row.duration || 0);
            const cals = (row.duration || 0) * 5; 
            totalCals += cals;
            
            if (!window.exerciseHistory[row.exercise]) window.exerciseHistory[row.exercise] = [];
            const oneRM = row.weight > 0 && row.reps > 0 ? row.weight * (36 / (37 - row.reps)) : 0;
            window.exerciseHistory[row.exercise].push({
                weight: row.weight,
                reps: row.reps,
                oneRM: oneRM,
                date: row.date
            
            
            });
             // --- PERSONAL RECORDS CALCULATOR ---
    const prContainer = window.document.getElementById("pr-container");
    if (prContainer) {
        let prHTML = "";
        
        // Scan the downloaded history for max weights
        for (const exercise in window.exerciseHistory) {
            let maxWeight = 0;
            window.exerciseHistory[exercise].forEach(set => {
                if (set.weight > maxWeight) maxWeight = set.weight;
            });
            
            // Build the visual card for any lift over 0kg
            if (maxWeight > 0) {
                prHTML += `
                <div style="display: flex; justify-content: space-between; background: rgba(30, 41, 59, 0.5); padding: 10px 15px; border-radius: 8px; margin-bottom: 8px;">
                    <span style="color: #cbd5e1; font-size: 0.9rem;">${exercise}</span>
                    <strong style="color: #10b981;">${maxWeight} kg</strong>
                </div>`;
            }
        }

        // Update the dashboard: Show PRs if they exist, otherwise keep the blank slate message
        if (prHTML !== "") {
            prContainer.innerHTML = prHTML;
        } else {
            prContainer.innerHTML = '<p style="color: #64748b; text-align: center; font-size: 0.9rem; padding: 20px;">No personal records yet. Log a workout to set your baseline!</p>';
        }
    }


            if (historyBody) {
                historyBody.innerHTML += `
                    <tr>
                        <td>${row.date}</td>
                        <td><span class="badge badge-cyan">${row.category}</span></td>
                        <td><strong>${row.exercise}</strong></td>
                        <td>${row.sets}</td>
                        <td>${row.reps}</td>
                        <td>${row.weight} kg</td>
                        <td>${row.duration || 0} min</td>
                        <td>
                            <button class="action-btn" onclick="deleteRecord('${id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }

            if(count <= 5 && recentBody) {
                recentBody.innerHTML += `
                    <div class="hover-lift" style="display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.4); padding: 15px; border-radius: 8px; border-left: 3px solid #3b82f6; margin-bottom: 10px;">
                        <div>
                            <span style="color: white; font-weight: bold; font-size: 0.95rem;">${row.date} &nbsp;&nbsp; ${row.exercise}</span><br>
                            <span style="color: #64748b; font-size: 0.8rem;">${row.sets} sets • ${row.reps} reps • ${row.weight}kg</span>
                        </div>
                        <strong style="color: #3b82f6;">${row.duration || 0} min</strong>
                    </div>
                `;
            }
        });
        
        const dashWorkouts = document.getElementById("dash-workouts");
        const dashMinutes = document.getElementById("dash-minutes");
        const dashCalories = document.getElementById("dash-calories");
        
        if (dashWorkouts) dashWorkouts.innerText = count;
        // Also update the new dashboard OLED layout elements if they exist
        const dashTime = document.getElementById("dash-time");
        if (dashTime) dashTime.innerText = `${Math.floor(totalMins/60)}h ${totalMins%60}m`;
        if (dashMinutes) dashMinutes.innerText = totalMins;
        if (dashCalories) dashCalories.innerText = totalCals;

        updateAchievements(count, totalCals);

        if (exSelect) updateAITarget(exSelect.value);

        const insightsContainer = document.getElementById("ai-insights-container");
        if (insightsContainer) {
            let insightsHTML = "";
            const exercises = Object.keys(window.exerciseHistory);
            
            if (exercises.length > 0) {
                let deloadFound = false;
                for (let ex of exercises) {
                    const history = window.exerciseHistory[ex];
                    if (history.length >= 3) {
                        const rm1 = history[0].oneRM; 
                        const rm2 = history[1].oneRM;
                        const rm3 = history[2].oneRM;
                        
                        if (rm1 <= rm2 && rm2 <= rm3 && rm1 > 0) {
                            insightsHTML += `
                                <div class="insight-card insight-plateau fade-in">
                                    <div style="display: flex; justify-content: space-between;">
                                        <h5 style="color: #f59e0b; font-size: 1.05rem; margin: 0 0 8px 0;">⚠️ Plateau Detected: ${ex}</h5>
                                        <span style="font-size: 1.2rem;">📉</span>
                                    </div>
                                    <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.5;">Your estimated 1RM has stagnated over 3 sessions. <br><strong style="color: white;">AI Recommendation:</strong> Deload weight to <strong>${Math.round(history[0].weight * 0.85)}kg</strong> next session.</p>
                                </div>
                            `;
                            deloadFound = true;
                            break; 
                        }
                    }
                }
                if (!deloadFound) {
                    const mostRecentEx = exercises[0]; 
                    const recentData = window.exerciseHistory[mostRecentEx][0];
                    let actionText = "";
                    if (recentData.reps >= 10) {
                        actionText = `Increase weight to <strong style="color: white; font-size: 1rem;">${recentData.weight + 2.5}kg</strong> for 8 reps.`;
                    } else {
                        actionText = `Hold weight at <strong style="color: white; font-size: 1rem;">${recentData.weight}kg</strong>. Aim for ${recentData.reps + 1} reps per set.`;
                    }
                    insightsHTML += `
                        <div class="insight-card insight-overload fade-in">
                            <div style="display: flex; justify-content: space-between;">
                                <h5 style="color: #10b981; font-size: 1.05rem; margin: 0 0 8px 0;">🚀 Next Target: ${mostRecentEx}</h5>
                                <span style="font-size: 1.2rem;">📈</span>
                            </div>
                            <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.5;">You hit ${recentData.reps} reps cleanly last session.<br><strong style="color: white;">AI Recommendation:</strong> ${actionText}</p>
                        </div>
                    `;
                }
            } else {
                insightsHTML = `<div style="padding: 15px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; text-align: center;"><p style="color: #64748b; font-size: 0.85rem; margin: 0;">Log your first workouts to unlock algorithmic training insights.</p></div>`;
            }
            insightsContainer.innerHTML = insightsHTML;
        }
    } catch (err) {
        console.error("Error loading system data:", err);
    }
}

const saveWorkoutBtn = document.getElementById("btn-save-workout");
if (saveWorkoutBtn) {
    saveWorkoutBtn.addEventListener("click", async () => {
        const setRows = document.querySelectorAll(".set-row");
        const setsData = [];

        setRows.forEach(row => {
            const weight = Number(row.querySelector(".set-weight").value) || 0;
            const reps = Number(row.querySelector(".set-reps").value) || 0;
            if (reps > 0) {
                setsData.push({ weight, reps });
            }
        });

        if (setsData.length === 0) {
            alert("Please enter valid reps for at least one set.");
            return;
        }

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const formattedDate = `${dd}-${mm}-${yyyy}`;

      const data = {
        userId: auth.currentUser.uid,
        date: formattedDate,
        category: document.getElementById("log-category").value,
        exercise: document.getElementById("log-exercise").value,
        setsSummary: setsData,
        sets: setsData.length,
        reps: setsData[0].reps,
        weight: setsData[0].weight,
        duration: setsData.length * 3
    };
        try {
            await addDoc(collection(db, "workouts"), data);
            showToast("Workout committed successfully!");
            
            let newlyCompleted = false;
            challengesState.forEach(chal => {
                if (chal.joined && !chal.completed) {
                    const matchesExercise = data.exercise.toLowerCase().includes(chal.name.toLowerCase());
                    if (matchesExercise) {
                        const maxLoggedWeight = Math.max(...setsData.map(s => s.weight));
                        if (maxLoggedWeight >= chal.target || chal.type === 'Workout Count') {
                            chal.completed = true;
                            newlyCompleted = true;
                            triggerCelebration(chal.name);
                        }
                    }
                }
            });
            if (newlyCompleted) saveChallengesState();

            setsContainer.innerHTML = `
                <div class="set-row" style="display: grid; grid-template-columns: 50px 1fr 1fr 40px; align-items: center; background: rgba(30, 41, 59, 0.7); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); gap: 15px;">
                    <span class="set-number" style="color: #06b6d4; font-weight: bold; font-size: 1rem; text-align: center;">1</span>
                    <div style="display: flex; align-items: center; justify-content: space-between; background: #0f172a; border-radius: 8px; padding: 6px 12px; border: 1px solid #334155;">
                        <span style="font-size: 0.75rem; color: #94a3b8;">REPS</span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button type="button" class="rep-minus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">-</button>
                            <input type="number" class="set-reps" value="10" style="background: transparent; border: none; color: white; width: 35px; text-align: center; font-size: 1rem; font-weight: bold;" />
                            <button type="button" class="rep-plus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; background: #0f172a; border-radius: 8px; padding: 6px 12px; border: 1px solid #334155;">
                        <span style="font-size: 0.75rem; color: #94a3b8;">WEIGHT (KG)</span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button type="button" class="weight-minus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">-</button>
                            <input type="number" class="set-weight" value="20" style="background: transparent; border: none; color: white; width: 40px; text-align: center; font-size: 1rem; font-weight: bold;" />
                            <button type="button" class="weight-plus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                    </div>
                    <button type="button" class="action-btn remove-set-btn" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 16px; text-align: center;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            loadSystemData();
        } catch (err) {
            console.error("Error saving workout:", err);
            alert("Error saving workout to database.");
        }
    });
}

window.deleteRecord = async (id) => {
    if(confirm("Delete this record permanently?")) {
        await deleteDoc(doc(db, "workouts", id));
        showToast("Record deleted.");
        loadSystemData();
    }
};

// ==========================================
// --- BIOMETRICS LAB: BMI & TDEE LOGIC ---
// ==========================================

// 1. Calculate BMI & Trigger Animated Gauge Needle
document.getElementById("btn-run-bmi")?.addEventListener("click", () => {
    let weight = Number(document.getElementById("bio-weight").value);
    let heightInput = Number(document.getElementById("bio-height").value);

    if (weight > 0 && heightInput > 0) {
        let heightM = heightInput / 100;
        const bmi = Number((weight / (heightM * heightM)).toFixed(1));
        
        let cat = "", color = "", needleAngle = -90; 
        if (bmi < 18.5) { cat = "Underweight"; color = "#3b82f6"; needleAngle = Math.max(-90, -90 + ((bmi - 10) / 8.5) * 45); } 
        else if (bmi < 25) { cat = "Normal weight"; color = "#10b981"; needleAngle = -45 + ((bmi - 18.5) / 6.5) * 45; } 
        else if (bmi < 30) { cat = "Overweight"; color = "#f59e0b"; needleAngle = 0 + ((bmi - 25) / 5) * 45; } 
        else { cat = "Obese"; color = "#ef4444"; needleAngle = Math.min(90, 45 + ((bmi - 30) / 15) * 45); }

        document.getElementById("bmi-score-text").innerHTML = `BMI = ${bmi} kg/m² (<span id="bmi-cat-label" style="color: ${color};">${cat}</span>)`;
        document.getElementById("bmi-result-card").style.display = "block";
        
        // Smooth gauge needle animation
        setTimeout(() => {
            document.getElementById("bmi-needle").style.transform = `rotate(${needleAngle}deg)`;
        }, 100);

        showToast("BMI calculated successfully!");
    } else {
        alert("Please enter valid height and weight values.");
    }
});

// 2. Calculate TDEE & Goal Target Suggestions (Fat Loss, Recomp, Muscle Build)
document.getElementById("btn-run-tdee")?.addEventListener("click", () => {
    let weight = Number(document.getElementById("bio-weight").value);
    let heightInput = Number(document.getElementById("bio-height").value);
    let age = Number(document.getElementById("bio-age").value) || 25;
    let genderRadio = document.querySelector('input[name="bio-gender"]:checked');
    let gender = genderRadio ? genderRadio.value : "male";
    let activityMultiplier = Number(document.getElementById("bio-activity").value);

    if (weight > 0 && heightInput > 0) {
        let heightCm = heightInput; // Already in CM from input

        // Mifflin-St Jeor BMR Equation
        let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
        bmr += (gender === "male" ? 5 : -161);

        // TDEE Maintenance Calories
        let tdee = Math.round(bmr * activityMultiplier);

        // Goal breakdown calculations
        let fatLossCalories = tdee - 500;
        let recompCalories = tdee;
        let muscleBuildCalories = tdee + 300;

        // Render displays
        document.getElementById("tdee-maintenance-text").innerText = `${tdee} kcal / day`;
        document.getElementById("goal-fatloss-text").innerText = `${fatLossCalories} kcal`;
        document.getElementById("goal-recomp-text").innerText = `${recompCalories} kcal`;
        document.getElementById("goal-muscle-text").innerText = `${muscleBuildCalories} kcal`;

        document.getElementById("tdee-result-card").style.display = "block";

        showToast("TDEE & goal recommendations generated!");
    } else {
        alert("Please enter valid height and weight values.");
    }
});


// ==========================================
// --- PROFILE LOGIC ---
// ==========================================
let profilePicBase64 = "https://via.placeholder.com/120";

document.getElementById("profile-pic-upload")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            profilePicBase64 = event.target.result;
            document.getElementById("display-profile-pic").src = profilePicBase64;
        };
        reader.readAsDataURL(file);
    }
});

const btnEditProfile = document.getElementById("btn-edit-profile");
const btnSaveProfile = document.getElementById("btn-save-profile");
const btnCancelEdit = document.getElementById("btn-cancel-edit");
const viewMode = document.getElementById("profile-view-mode");
const editMode = document.getElementById("profile-edit-mode");
const picOverlay = document.getElementById("pic-edit-overlay");

function toggleProfileMode(isEdit) {
    if (!viewMode || !editMode) return;
    if (isEdit) {
        viewMode.style.display = "none"; editMode.style.display = "block"; btnEditProfile.style.display = "none"; btnSaveProfile.style.display = "inline-block"; btnCancelEdit.style.display = "inline-block"; picOverlay.style.display = "block";
    } else {
        viewMode.style.display = "block"; editMode.style.display = "none"; btnEditProfile.style.display = "inline-block"; btnSaveProfile.style.display = "none"; btnCancelEdit.style.display = "none"; picOverlay.style.display = "none";
    }
}

btnEditProfile?.addEventListener("click", () => toggleProfileMode(true));
btnCancelEdit?.addEventListener("click", () => { loadProfileData(); toggleProfileMode(false); });

function loadProfileData() {
    if (!auth.currentUser) return;
    const profileKey = `gymrat_user_profile_${auth.currentUser.uid}`;
    const saved = localStorage.getItem(profileKey);
    let data = {}; if (saved) data = JSON.parse(saved);

    const name = data.name || "Athlete"; const age = data.age || "-"; const gender = data.gender || "Male"; const contact = data.contact || auth.currentUser?.email || "-"; const height = data.height || "-"; const weight = data.weight || "-"; const goal = data.goal || "Fat Loss";
    profilePicBase64 = data.profilePic || "https://via.placeholder.com/120";

    document.getElementById("display-name").innerText = name; document.getElementById("display-goal-badge").innerText = goal; document.getElementById("view-age").innerText = age; document.getElementById("view-gender").innerText = gender; document.getElementById("view-height").innerText = height !== "-" ? height + " cm" : "-"; document.getElementById("view-weight").innerText = weight !== "-" ? weight + " kg" : "-"; document.getElementById("view-contact").innerText = contact;
    const picEl = document.getElementById("display-profile-pic"); if (picEl) picEl.src = profilePicBase64;

    document.getElementById("profile-name").value = name !== "Athlete" ? name : ""; document.getElementById("profile-age").value = age !== "-" ? age : ""; document.getElementById("profile-gender").value = gender; document.getElementById("profile-contact").value = contact !== "-" ? contact : ""; document.getElementById("profile-height").value = height !== "-" ? height : ""; document.getElementById("profile-weight").value = weight !== "-" ? weight : ""; document.getElementById("profile-goal").value = goal;
}

btnSaveProfile?.addEventListener("click", () => {
    if (!auth.currentUser) return;
    const profileData = {
        name: document.getElementById("profile-name").value || "Athlete", age: document.getElementById("profile-age").value || "-", gender: document.getElementById("profile-gender").value, contact: document.getElementById("profile-contact").value || auth.currentUser.email, height: document.getElementById("profile-height").value || "-", weight: document.getElementById("profile-weight").value || "-", goal: document.getElementById("profile-goal").value, profilePic: profilePicBase64
    };
    localStorage.setItem(`gymrat_user_profile_${auth.currentUser.uid}`, JSON.stringify(profileData));
    showToast("Profile updated successfully!"); loadProfileData(); toggleProfileMode(false);
});

function updateAchievements(snapshotSize, totalCalories) {
    const streakEl = document.getElementById("achieve-streak"); const calsEl = document.getElementById("achieve-cals"); const sessionsEl = document.getElementById("achieve-sessions");
    if (sessionsEl) sessionsEl.innerText = snapshotSize; if (calsEl) calsEl.innerText = `${totalCalories} kcal`; if (streakEl) streakEl.innerText = `${snapshotSize > 0 ? Math.min(snapshotSize, 7) : 0} Days`;
}

// ==========================================
// --- AUTHENTICATION ---
// ==========================================
const authScreen = document.getElementById("auth-screen"); 
const appWorkspace = document.getElementById("app-workspace"); 
let isLoginMode = true;

document.getElementById("btn-toggle-mode")?.addEventListener("click", () => {
    isLoginMode = !isLoginMode; 
    document.getElementById("auth-title").innerText = isLoginMode ? "System Login" : "Create Account"; 
    document.getElementById("btn-auth-submit").innerText = isLoginMode ? "Login" : "Register"; 
    document.getElementById("auth-toggle-text").innerText = isLoginMode ? "Don't have an account?" : "Already have an account?"; 
    document.getElementById("btn-toggle-mode").innerText = isLoginMode ? "Register" : "Login";
});

// --> THIS IS THE MISSING LOGIN BUTTON CODE <--
document.getElementById("btn-auth-submit")?.addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value; 
    const pass = document.getElementById("auth-password").value;
    if (!email || !pass) return alert("Please enter both email and password.");
    try { 
        if (isLoginMode) await signInWithEmailAndPassword(auth, email, pass); 
        else await createUserWithEmailAndPassword(auth, email, pass); 
        showToast(isLoginMode ? "Login successful!" : "Account created successfully!"); 
    } catch (error) { 
        alert("Authentication Error: " + error.message); 
    }
});

// --> YOUR UPDATED LOGOUT BUTTON CODE <--
document.getElementById("btn-logout")?.addEventListener("click", async () => { 
    try { 
        // 1. Completely WIPE all local browser memory (Goals, PRs, Water, Food, everything)
        localStorage.clear();
        
        // 2. Sign out of Firebase
        await signOut(auth); 
        
        // 3. Force a complete page reload to instantly reset the app to a blank state
        window.location.reload();
    } catch (error) { 
        alert("Logout Error: " + error.message); 
    } 
});
// ==========================================
// --- ONBOARDING ---
// ==========================================
function checkOnboarding(user) {
    try { const profileKey = `gymrat_profile_${user.uid}`; const savedProfile = localStorage.getItem(profileKey); const modal = document.getElementById("onboarding-modal"); if (!savedProfile) { if (modal) modal.style.display = "flex"; } else { if (modal) modal.style.display = "none"; loadSplitData(JSON.parse(savedProfile)); } } catch (err) { console.error("Onboarding error:", err); }
}
document.getElementById("btn-save-onboarding")?.addEventListener("click", () => {
    try { const nameInput = document.getElementById("setup-name"); const splitInput = document.getElementById("setup-split"); if (!nameInput || !nameInput.value) return alert("Please enter your name."); const profile = { name: nameInput.value, split: splitInput ? splitInput.value : "ppl" }; if (auth.currentUser) localStorage.setItem(`gymrat_profile_${auth.currentUser.uid}`, JSON.stringify(profile)); const modal = document.getElementById("onboarding-modal"); if (modal) modal.style.display = "none"; showToast("Profile set up successfully!"); loadSplitData(profile); } catch (err) { console.error("Save onboarding error:", err); }
});
function loadSplitData(profile) { const titleEl = document.getElementById("welcome-title"); if (titleEl && profile && profile.name) titleEl.innerText = `Welcome back, ${profile.name}! 🚀`; }

// ==========================================
// --- DYNAMIC SETS ---
// ==========================================
const addSetRowBtn = document.getElementById("btn-add-set-row"); const setsContainer = document.getElementById("sets-rows-container");
function updateSetNumbers() { if (!setsContainer) return; setsContainer.querySelectorAll(".set-row").forEach((row, index) => { row.querySelector(".set-number").innerText = index + 1; }); }
if (addSetRowBtn && setsContainer) {
    addSetRowBtn.addEventListener("click", () => {
        const row = document.createElement("div"); row.className = "set-row"; row.style.cssText = "display: grid; grid-template-columns: 50px 1fr 1fr 40px; align-items: center; background: rgba(30, 41, 59, 0.7); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); gap: 15px;";
        row.innerHTML = `<span class="set-number" style="color: #06b6d4; font-weight: bold; font-size: 1rem; text-align: center;">1</span><div style="display: flex; align-items: center; justify-content: space-between; background: #0f172a; border-radius: 8px; padding: 6px 12px; border: 1px solid #334155;"><span style="font-size: 0.75rem; color: #94a3b8;">REPS</span><div style="display: flex; align-items: center; gap: 10px;"><button type="button" class="rep-minus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">-</button><input type="number" class="set-reps" value="10" style="background: transparent; border: none; color: white; width: 35px; text-align: center; font-size: 1rem; font-weight: bold;" /><button type="button" class="rep-plus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">+</button></div></div><div style="display: flex; align-items: center; justify-content: space-between; background: #0f172a; border-radius: 8px; padding: 6px 12px; border: 1px solid #334155;"><span style="font-size: 0.75rem; color: #94a3b8;">WEIGHT (KG)</span><div style="display: flex; align-items: center; gap: 10px;"><button type="button" class="weight-minus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">-</button><input type="number" class="set-weight" value="20" style="background: transparent; border: none; color: white; width: 40px; text-align: center; font-size: 1rem; font-weight: bold;" /><button type="button" class="weight-plus" style="background: #1e293b; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">+</button></div></div><button type="button" class="action-btn remove-set-btn" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 16px; text-align: center;"><i class="fas fa-trash"></i></button>`;
        setsContainer.appendChild(row); updateSetNumbers();
    });
    setsContainer.addEventListener("click", (e) => {
        const row = e.target.closest(".set-row"); if (!row) return; const repsInput = row.querySelector(".set-reps"); const weightInput = row.querySelector(".set-weight");
        if (e.target.classList.contains("rep-plus")) repsInput.value = Number(repsInput.value || 0) + 1; else if (e.target.classList.contains("rep-minus")) repsInput.value = Math.max(0, Number(repsInput.value || 0) - 1); else if (e.target.classList.contains("weight-plus")) weightInput.value = Number(weightInput.value || 0) + 2.5; else if (e.target.classList.contains("weight-minus")) weightInput.value = Math.max(0, Number(weightInput.value || 0) - 2.5); else if (e.target.closest(".remove-set-btn")) { if (setsContainer.querySelectorAll(".set-row").length > 1) { row.remove(); updateSetNumbers(); } else alert("You must keep at least one set row."); }
    });
}

// ==========================================
// --- CHALLENGES SYSTEM ---
// ==========================================
let challengesState = JSON.parse(localStorage.getItem("gymrat_challenges")) || [];
function saveChallengesState() { localStorage.setItem("gymrat_challenges", JSON.stringify(challengesState)); renderChallenges(); }
function renderChallenges() {
    const container = document.getElementById("challenges-container"); if (!container) return;
    if (challengesState.length === 0) { container.innerHTML = `<p style="color: #64748b; font-size: 0.85rem; grid-column: span 2; text-align: center;">No challenges active right now. Launch one above!</p>`; return; }
    container.innerHTML = challengesState.map(chal => `<div class="challenge-card fade-in" style="${chal.completed ? 'border-color: #10b981; background: rgba(16, 185, 129, 0.05);' : ''}"><div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;"><h4 style="color: white; font-size: 1.05rem; margin: 0;">${chal.name} ${chal.completed ? '✅' : ''}</h4><div style="display: flex; gap: 6px;"><button onclick="restartChallenge('${chal.id}')" title="Restart Challenge" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; font-weight: bold; transition: all 0.2s;">🔄 Restart</button><button onclick="deleteChallenge('${chal.id}')" title="Delete Challenge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; font-weight: bold; transition: all 0.2s;">🗑️</button></div></div><p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 12px; line-height: 1.4;">${chal.desc}</p><div style="display: inline-block; background: ${chal.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.1)'}; color: ${chal.completed ? '#10b981' : '#06b6d4'}; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; margin-bottom: 15px;">Target: ${chal.target} ${chal.type === 'Total Volume (KG)' ? 'KG' : chal.type === 'Running Distance' ? 'KM' : 'Workouts'}</div><div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-size: 0.75rem; color: #64748b;">${chal.start} to ${chal.end}</span><button onclick="toggleJoinChallenge('${chal.id}')" style="background: ${chal.completed ? '#10b981' : chal.joined ? '#334155' : '#06b6d4'}; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: opacity 0.2s;">${chal.completed ? 'Completed 🏆' : chal.joined ? 'Joined ✓' : 'Join Challenge'}</button></div></div>`).join('');
}
document.getElementById("btn-create-challenge")?.addEventListener("click", () => {
    const name = document.getElementById("chal-name").value; const target = Number(document.getElementById("chal-target").value);
    if (!name || !target) return alert("Please provide at least a challenge name and target value.");
    challengesState.push({ id: 'chal_' + Date.now(), name, desc: document.getElementById("chal-desc").value || "Custom fitness milestone.", start: document.getElementById("chal-start").value || new Date().toISOString().split('T')[0], end: document.getElementById("chal-end").value || new Date().toISOString().split('T')[0], type: document.getElementById("chal-type").value, target, joined: true, completed: false }); saveChallengesState(); showToast("New challenge launched successfully!"); document.getElementById("chal-name").value = ""; document.getElementById("chal-desc").value = ""; document.getElementById("chal-target").value = "";
});
window.toggleJoinChallenge = (id) => { const chal = challengesState.find(c => c.id === id); if (chal) { chal.joined = !chal.joined; saveChallengesState(); showToast(chal.joined ? "Challenge joined!" : "Challenge left."); } };
window.restartChallenge = (id) => { const chal = challengesState.find(c => c.id === id); if (chal) { chal.joined = false; chal.completed = false; saveChallengesState(); showToast("Challenge restarted."); } };
window.deleteChallenge = (id) => { if (confirm("Are you sure you want to delete this challenge?")) { challengesState = challengesState.filter(c => c.id !== id); saveChallengesState(); showToast("Challenge deleted."); } };
function triggerCelebration(challengeName) { const modal = document.getElementById("celebration-modal"); const textEl = document.getElementById("celebration-text"); if (textEl) textEl.innerText = `Incredible work! You successfully conquered the "${challengeName}" challenge!`; if (modal) modal.style.display = "flex"; }
window.closeCelebrationModal = () => { const modal = document.getElementById("celebration-modal"); if (modal) modal.style.display = "none"; };
renderChallenges();

// ==========================================
// --- ⚡ CUSTOM ROUTINE BLUEPRINTS ---
// ==========================================
const blueprints = {
    "Chest & Triceps": [
        { cat: "Chest", ex: "Barbell Bench Press" },
        { cat: "Chest", ex: "Incline Barbell Press" },
        { cat: "Chest", ex: "Machine Chest Press" },
        { cat: "Chest", ex: "Cable Fly" },
        { cat: "Triceps", ex: "Rope Pushdown" },
        { cat: "Triceps", ex: "Skull Crushers" },
        { cat: "Triceps", ex: "Overhead Cable Extension" }
    ],
    "Back & Biceps": [
        { cat: "Back", ex: "Pull-Ups" },
        { cat: "Back", ex: "Lat Pulldown" },
        { cat: "Back", ex: "Barbell Row" },
        { cat: "Back", ex: "Seated Cable Row" },
        { cat: "Biceps", ex: "Barbell Curl" },
        { cat: "Biceps", ex: "Hammer Curl" },
        { cat: "Biceps", ex: "Preacher Curl" }
    ],
    "Legs & Shoulders": [
        { cat: "Quads", ex: "Back Squat" },
        { cat: "Quads", ex: "Leg Press" },
        { cat: "Hamstrings", ex: "Romanian Deadlift" },
        { cat: "Hamstrings", ex: "Seated Leg Curl" },
        { cat: "Shoulders", ex: "Barbell Overhead Press" },
        { cat: "Shoulders", ex: "Dumbbell Lateral Raise" },
        { cat: "Shoulders", ex: "Face Pull" }
    ]
};

const bpContainer = document.getElementById("blueprint-buttons");
const bpChecklist = document.getElementById("routine-checklist");

if (bpContainer) {
    Object.keys(blueprints).forEach(plan => {
        const btn = document.createElement("button");
        btn.className = "hover-lift";
        btn.style.cssText = "background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.4); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: bold;";
        btn.innerText = plan;
        btn.onclick = () => loadBlueprint(plan);
        bpContainer.appendChild(btn);
    });
}

function loadBlueprint(planName) {
    if (!bpChecklist) return;
    bpChecklist.style.display = "flex";
    bpChecklist.innerHTML = `<span style="color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">${planName} Queue:</span>`;
    
    blueprints[planName].forEach((item) => {
        const row = document.createElement("div");
        row.className = "blueprint-row"; // Added class for resetting
        row.setAttribute("data-ex", item.ex); // Store name to restore it
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); padding: 12px 16px; border-radius: 8px; cursor: pointer; border-left: 3px solid #3b82f6; transition: all 0.2s;";
        row.innerHTML = `<strong style="color: white; font-size: 0.95rem;">${item.ex}</strong> <span style="font-size: 0.8rem; color: #3b82f6; font-weight: bold;">Load ➔</span>`;
        
        row.onclick = () => {
            // 1. Reset all rows in the checklist back to default blue
            const allRows = bpChecklist.querySelectorAll('.blueprint-row');
            allRows.forEach(r => {
                r.style.borderLeft = "3px solid #3b82f6";
                r.style.background = "rgba(15, 23, 42, 0.6)";
                r.innerHTML = `<strong style="color: white; font-size: 0.95rem;">${r.getAttribute("data-ex")}</strong> <span style="font-size: 0.8rem; color: #3b82f6; font-weight: bold;">Load ➔</span>`;
            });

            // 2. Set only the clicked row to active green
            row.style.borderLeft = "3px solid #10b981";
            row.style.background = "rgba(16, 185, 129, 0.1)";
            row.innerHTML = `<strong style="color: #10b981; font-size: 0.95rem;">${item.ex}</strong> <span style="font-size: 0.8rem; color: #10b981; font-weight: bold;">Ready ✅</span>`;

            // 3. Load the exercise into the dropdowns
            const cSelect = document.getElementById("log-category");
            const eSelect = document.getElementById("log-exercise");
            if(cSelect && eSelect) {
                cSelect.value = item.cat;
                cSelect.dispatchEvent(new Event('change')); 
                
                setTimeout(() => {
                    eSelect.value = item.ex;
                    eSelect.dispatchEvent(new Event('change')); 
                }, 50);
            }
        };
        bpChecklist.appendChild(row);
    });
}

// ==========================================
// --- 💧 WATER & 🔥 MACRO TRACKER ENGINE ---
// ==========================================

// Global Goal State
let targetGoals = JSON.parse(localStorage.getItem("gymrat_targets")) || 
        { water: 0, cals: 0, p: 0, c: 0, f: 0 };

const goalsViewMode = document.getElementById("goals-view-mode");
const goalsEditMode = document.getElementById("goals-edit-mode");

function toggleGoalsMode(isEdit) {
    if (!goalsViewMode || !goalsEditMode) return;
    if (isEdit) {
        goalsViewMode.style.display = "none";
        goalsEditMode.style.display = "flex";
    } else {
        goalsViewMode.style.display = "flex";
        goalsEditMode.style.display = "none";
    }
}

document.getElementById("btn-edit-targets")?.addEventListener("click", () => toggleGoalsMode(true));
document.getElementById("btn-cancel-targets")?.addEventListener("click", () => {
    initTargetInputs(); 
    toggleGoalsMode(false);
});

// Handle Goal Saving
document.getElementById("btn-save-targets")?.addEventListener("click", () => {
    if (!auth.currentUser) return alert("Please log in to save goals.");

    targetGoals.water = Number(document.getElementById("goal-water-input").value) || targetGoals.water;
    targetGoals.cals = Number(document.getElementById("goal-cals-input").value) || targetGoals.cals;
    targetGoals.p = Number(document.getElementById("goal-p-input").value) || targetGoals.p;
    targetGoals.c = Number(document.getElementById("goal-c-input").value) || targetGoals.c;
    targetGoals.f = Number(document.getElementById("goal-f-input").value) || targetGoals.f;

    // Lock the goals to this specific user's ID
    localStorage.setItem(`gymrat_targets_${auth.currentUser.uid}`, JSON.stringify(targetGoals));
    
    initTargetInputs();
    toggleGoalsMode(false);
    showToast("Daily targets locked in!");
    renderWaterUI();
    renderFoodUI();
});

// Populate target inputs and displays on load
function initTargetInputs() {
    // 1. Fetch this specific user's goals
    if (auth.currentUser) {
        const savedTargets = localStorage.getItem(`gymrat_targets_${auth.currentUser.uid}`);
        if (savedTargets) {
            targetGoals = JSON.parse(savedTargets);
        } else {
            // New user blank slate defaults
            targetGoals ={ water: 0, cals: 0, p: 0, c: 0, f: 0 };
        }
    }

    // 2. Populate the View Mode Text
    if (document.getElementById("display-goal-water")) {
        document.getElementById("display-goal-water").innerText = targetGoals.water;
        document.getElementById("display-goal-cals").innerText = targetGoals.cals;
        document.getElementById("display-goal-p").innerText = targetGoals.p;
        document.getElementById("display-goal-c").innerText = targetGoals.c;
        document.getElementById("display-goal-f").innerText = targetGoals.f;
    }
    
    // 3. Populate the Edit Mode Inputs
    if (document.getElementById("goal-water-input")) {
        document.getElementById("goal-water-input").value = targetGoals.water;
        document.getElementById("goal-cals-input").value = targetGoals.cals;
        document.getElementById("goal-p-input").value = targetGoals.p;
        document.getElementById("goal-c-input").value = targetGoals.c;
        document.getElementById("goal-f-input").value = targetGoals.f;
    }
}

// --- WATER LOGIC ---
let waterState = JSON.parse(localStorage.getItem("gymrat_water_state")) || {
    current: 0, logs: [], lastDate: new Date().toDateString()
};

function renderWaterUI() {
    const todayStr = new Date().toDateString();
    if (waterState.lastDate !== todayStr) {
        waterState.current = 0; waterState.logs = []; waterState.lastDate = todayStr;
        localStorage.setItem("gymrat_water_state", JSON.stringify(waterState));
    }

    const totalEl = document.getElementById("water-total-display");
    const goalEl = document.getElementById("water-goal-display");
    const fillEl = document.getElementById("water-visual-fill");
    const logsContainer = document.getElementById("today-water-logs");

    if (totalEl) totalEl.innerText = waterState.current;
    if (goalEl) goalEl.innerText = targetGoals.water;
    
    if (fillEl) {
        const percentage = Math.min(100, Math.max(0, (waterState.current / targetGoals.water) * 100));
        fillEl.style.height = `${percentage}%`;
    }

    if (logsContainer) {
        if (waterState.logs.length === 0) logsContainer.innerHTML = `<p style="color: #64748b; font-size: 0.85rem; text-align: center; margin: 10px 0;">No water logged today.</p>`;
        else logsContainer.innerHTML = waterState.logs.map(log => `<div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15,23,42,0.6); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;"><span style="color: #38bdf8; font-weight: bold;">💧 ${log.amount} mL</span><span style="color: #94a3b8;">${log.time}</span></div>`).join('');
    }
}

window.addWater = (amount) => {
    waterState.current += amount;
    waterState.logs.unshift({ amount, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem("gymrat_water_state", JSON.stringify(waterState));
    renderWaterUI(); 
    showToast(`Added ${amount}ml of water`);
};

document.getElementById("btn-record-custom-water")?.addEventListener("click", () => {
    const input = document.getElementById("custom-water-input");
    const val = Number(input.value);
    if (val > 0) { addWater(val); input.value = ""; } else alert("Please enter a valid amount.");
});

// --- MACRO (FOOD) LOGIC ---
const macroDatabase = {
    // PROTEIN (COOKED WEIGHTS)
    "Chicken breast": { cals: 165, p: 31, c: 0, f: 3.6 },
    "Whole egg": { cals: 155, p: 13, c: 1.1, f: 11 },
    "Egg white": { cals: 52, p: 11, c: 0.7, f: 0.2 },
    "Fish": { cals: 105, p: 22, c: 0, f: 2 }, 
    "Paneer": { cals: 265, p: 18, c: 1.2, f: 20 },
    "Tofu": { cals: 76, p: 8, c: 1.9, f: 4.8 },
    "Soy chunks": { cals: 115, p: 17, c: 11, f: 0.2 }, // Boiled
    "Dal": { cals: 116, p: 7, c: 20, f: 0.4 }, // Cooked
    "Chickpeas": { cals: 164, p: 8.9, c: 27, f: 2.6 }, // Boiled
    "Curd": { cals: 61, p: 3.5, c: 4.7, f: 3.3 },

    // CARBS (COOKED WEIGHTS)
    "Rice": { cals: 130, p: 2.7, c: 28, f: 0.3 }, // Cooked White Rice
    "Oats": { cals: 71, p: 2.5, c: 12, f: 1.5 }, // Cooked/Prepared
    "Roti": { cals: 297, p: 9, c: 46, f: 9 }, // Prepared with slight oil
    "Bread": { cals: 265, p: 9, c: 49, f: 3.2 },
    "Poha": { cals: 130, p: 2.5, c: 25, f: 2 }, // Prepared
    "Dosa": { cals: 168, p: 3.9, c: 29, f: 3.7 }, // Prepared
    "Idli": { cals: 100, p: 3, c: 21, f: 0.4 }, // Steamed
    "Potato": { cals: 87, p: 1.9, c: 20, f: 0.1 }, // Boiled
    "Sweet potato": { cals: 90, p: 2, c: 21, f: 0.2 }, // Boiled

    // FRUITS & VEGGIES
    "Banana": { cals: 89, p: 1.1, c: 23, f: 0.3 },
    "Apple": { cals: 52, p: 0.3, c: 14, f: 0.2 },
    "Mango": { cals: 60, p: 0.8, c: 15, f: 0.4 },
    "Tomato": { cals: 18, p: 0.9, c: 3.9, f: 0.2 },
    "Onion": { cals: 40, p: 1.1, c: 9.3, f: 0.1 },
    "Spinach": { cals: 23, p: 2.9, c: 3.6, f: 0.4 },

    // OTHER
    "Peanut butter": { cals: 588, p: 25, c: 20, f: 50 },
    "Pappula Podi": { cals: 450, p: 20, c: 50, f: 20 }
};

let foodState = JSON.parse(localStorage.getItem("gymrat_food_state")) || {};

// Failsafe
if (!foodState.date || typeof foodState.totalP === "undefined" || isNaN(foodState.totalP)) {
    foodState = { date: new Date().toDateString(), totalCals: 0, totalP: 0, totalC: 0, totalF: 0, logs: [] };
    localStorage.setItem("gymrat_food_state", JSON.stringify(foodState));
}

function renderFoodUI() {
    const todayStr = new Date().toDateString();
    if (foodState.date !== todayStr) {
        foodState = { date: todayStr, totalCals: 0, totalP: 0, totalC: 0, totalF: 0, logs: [] };
        localStorage.setItem("gymrat_food_state", JSON.stringify(foodState));
    }

    // Displays
    document.getElementById("macro-cal-total").innerText = Math.round(foodState.totalCals || 0);
    document.getElementById("macro-cal-goal").innerText = targetGoals.cals;
    
    document.getElementById("macro-p-total").innerText = Math.round(foodState.totalP || 0);
    document.getElementById("macro-p-goal").innerText = targetGoals.p;
    
    document.getElementById("macro-c-total").innerText = Math.round(foodState.totalC || 0);
    document.getElementById("macro-c-goal").innerText = targetGoals.c;
    
    document.getElementById("macro-f-total").innerText = Math.round(foodState.totalF || 0);
    document.getElementById("macro-f-goal").innerText = targetGoals.f;

    // Progress Bars based on custom goals
    document.getElementById("bar-protein").style.width = `${Math.min(100, ((foodState.totalP || 0) / targetGoals.p) * 100)}%`;
    document.getElementById("bar-carbs").style.width = `${Math.min(100, ((foodState.totalC || 0) / targetGoals.c) * 100)}%`;
    document.getElementById("bar-fats").style.width = `${Math.min(100, ((foodState.totalF || 0) / targetGoals.f) * 100)}%`;

    const listEl = document.getElementById("food-log-list");
    if (listEl) {
        if (foodState.logs.length === 0) {
            listEl.innerHTML = `<p style="color: #64748b; font-size: 0.85rem; text-align: center; margin: 10px 0;">No meals logged today.</p>`;
        } else {
            listEl.innerHTML = foodState.logs.map(log => `
                <div style="display: flex; flex-direction: column; background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3px solid #10b981; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="color: white; font-size: 0.9rem;"><strong>${log.grams}g</strong> ${log.name}</span>
                        <span style="color: #10b981; font-weight: bold; font-size: 0.9rem;">${Math.round(log.cals)} kcal</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8; display: flex; gap: 10px;">
                        <span>P: ${Math.round(log.p)}g</span>
                        <span>C: ${Math.round(log.c)}g</span>
                        <span>F: ${Math.round(log.f)}g</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

document.getElementById("btn-add-food")?.addEventListener("click", () => {
    const name = document.getElementById("food-item-select").value;
    const grams = Number(document.getElementById("food-grams-input").value);

    if (grams > 0) {
        const data = macroDatabase[name];
        const multiplier = grams / 100;
        
        const addedCals = data.cals * multiplier;
        const addedP = data.p * multiplier;
        const addedC = data.c * multiplier;
        const addedF = data.f * multiplier;

        foodState.totalCals += addedCals;
        foodState.totalP += addedP;
        foodState.totalC += addedC;
        foodState.totalF += addedF;
        
        foodState.logs.unshift({ name, grams, cals: addedCals, p: addedP, c: addedC, f: addedF });
        localStorage.setItem("gymrat_food_state", JSON.stringify(foodState));
        
        document.getElementById("food-grams-input").value = "";
        renderFoodUI();
        showToast(`Logged ${grams}g of ${name}`);
    } else {
        alert("Please enter a valid weight in grams.");
    }
});

// Initialize on load
initTargetInputs();
renderWaterUI();
renderFoodUI();

// ==========================================
// --- ⏱️ SMART REST TIMER ENGINE ---
// ==========================================
let restInterval;

window.startTimer = (seconds) => {
    clearInterval(restInterval);
    let timeRemaining = seconds;
    const display = document.getElementById("timer-display");
    
    // UI changes to indicate active timer
    display.style.color = "#10b981"; // Emerald Green
    
    const updateDisplay = () => {
        const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const secs = (timeRemaining % 60).toString().padStart(2, '0');
        display.innerText = `${mins}:${secs}`;
    };
    
    updateDisplay(); // Show immediately
    
    restInterval = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(restInterval);
            display.style.color = "#ef4444"; // Red when done
            display.innerText = "00:00";
            showToast("⏱️ Rest is over! Back to work! 🚀");
            
            // Try to vibrate the phone if supported (great for mobile)
            if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200, 100, 500]);
            }
        }
    }, 1000);
};

window.stopTimer = () => {
    clearInterval(restInterval);
    const display = document.getElementById("timer-display");
    if (display) {
        display.innerText = "00:00";
        display.style.color = "#38bdf8"; // Reset to Cyan
    }
};

function clearDashboardUI() {
    // 1. Clear Profile
    const nameInput = document.getElementById("profile-name");
    const ageInput = document.getElementById("profile-age");
    if (nameInput) nameInput.value = "";
    if (ageInput) ageInput.value = "";

    // 2. Clear Workout History & Top Stats
    const historyBody = document.getElementById("history-table-body");
    const recentBody = document.getElementById("recent-table-body");
    if (historyBody) historyBody.innerHTML = "";
    if (recentBody) recentBody.innerHTML = "";

    if (document.getElementById("dash-workouts")) document.getElementById("dash-workouts").innerText = "0";
    if (document.getElementById("dash-minutes")) document.getElementById("dash-minutes").innerText = "0";
    if (document.getElementById("dash-calories")) document.getElementById("dash-calories").innerText = "0";
    
    const workoutContainer = document.getElementById("workout-history-container");
    if (workoutContainer) workoutContainer.innerHTML = `<p style="color: #64748b; text-align: center;">No workout history found. Start tracking today!</p>`;

    // 3. Clear AI Insights & Personal Records
    const insightsContainer = document.getElementById("ai-insights-container");
    if (insightsContainer) insightsContainer.innerHTML = `<div style="padding: 15px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; text-align: center;"><p style="color: #64748b; font-size: 0.85rem; margin: 0;">Log your first workouts to unlock algorithmic training insights.</p></div>`;

    // 4. Clear Biometrics
    if (document.getElementById("bio-weight")) document.getElementById("bio-weight").value = "";
    if (document.getElementById("bio-height")) document.getElementById("bio-height").value = "";
    if (document.getElementById("bio-age")) document.getElementById("bio-age").value = "";
    if (document.getElementById("bmi-result-card")) document.getElementById("bmi-result-card").style.display = "none";
    if (document.getElementById("tdee-result-card")) document.getElementById("tdee-result-card").style.display = "none";

    // 5. Clear Daily Fuel (Water & Macros)
    if (document.getElementById("water-total-display")) document.getElementById("water-total-display").innerText = "0";
    if (document.getElementById("water-visual-fill")) document.getElementById("water-visual-fill").style.height = "0%";
    if (document.getElementById("today-water-logs")) document.getElementById("today-water-logs").innerHTML = "";
    
    if (document.getElementById("macro-cal-total")) document.getElementById("macro-cal-total").innerText = "0";
    if (document.getElementById("macro-p-total")) document.getElementById("macro-p-total").innerText = "0";
    if (document.getElementById("macro-c-total")) document.getElementById("macro-c-total").innerText = "0";
    if (document.getElementById("macro-f-total")) document.getElementById("macro-f-total").innerText = "0";
    
    if (document.getElementById("bar-protein")) document.getElementById("bar-protein").style.width = "0%";
    if (document.getElementById("bar-carbs")) document.getElementById("bar-carbs").style.width = "0%";
    if (document.getElementById("bar-fats")) document.getElementById("bar-fats").style.width = "0%";
    
    if (document.getElementById("food-log-list")) document.getElementById("food-log-list").innerHTML = "";
}

onAuthStateChanged(auth, (user) => {
    if (user) { 
        // Hide login screen, show app
        if (authScreen) authScreen.style.display = "none"; 
        if (appWorkspace) appWorkspace.style.display = "block"; 
        
        // Load this specific user's data
        console.log("Active User UID:", user.uid);
        loadSystemData(user.uid); 
        loadProfileData(); 
        initTargetInputs(); // <-- Added to load the user's saved Daily Fuel targets safely
    } else { 
        // Show login screen, hide app
        if (authScreen) authScreen.style.display = "flex"; 
        if (appWorkspace) appWorkspace.style.display = "none"; 
        
        // Wipe the dashboard clean
        clearDashboardUI();
    }
});

