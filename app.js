// ==========================================================
// GYMRAT COMPLETE ENGINE: ANATOMY REGISTRY & CORE LOGIC
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Comprehensive Anatomy & Exercise Master Registry
  const EXERCISE_CATALOG = [
    // --- CHEST ---
    { id: "c1", name: "Incline Bench Press (30°)", split: "push", category: "Chest", area: "Upper Chest", equip: "Barbell", cue: "Lower to upper clavicles; maximize upper pec stretch." },
    { id: "c2", name: "Incline Dumbbell Press", split: "push", category: "Chest", area: "Upper Chest", equip: "Dumbbells", cue: "Keep elbows tucked at 45°; press with adduction." },
    { id: "c3", name: "Low-to-High Cable Fly", split: "push", category: "Chest", area: "Upper Chest", equip: "Cable Machine", cue: "Drive hands upward following clavicular fiber angle." },
    { id: "c4", name: "Flat Barbell Bench Press", split: "push", category: "Chest", area: "Middle Chest", equip: "Barbell", cue: "Plant feet firmly, retract scapulae, touch mid-sternum." },
    { id: "c5", name: "Pec Deck Fly Machine", split: "push", category: "Chest", area: "Middle Chest", equip: "Machine", cue: "Maintain slight elbow bend; focus on deep horizontal adduction." },
    { id: "c6", name: "Standard Chest Dips", split: "push", category: "Chest", area: "Lower Chest", equip: "Dip Station", cue: "Lean torso 30° forward to bias sternal/costal heads." },
    { id: "c7", name: "High-to-Low Cable Fly", split: "push", category: "Chest", area: "Lower Chest", equip: "Cable Machine", cue: "Cross hands down toward hips to bias lower pec fibers." },
    { id: "c8", name: "Decline Barbell Press", split: "push", category: "Chest", area: "Lower Chest", equip: "Barbell", cue: "Press along lower chest contour." },

    // --- BACK ---
    { id: "b1", name: "Lat Pulldown (Wide Grip)", split: "pull", category: "Back", area: "Width (Lats)", equip: "Cable Machine", cue: "Depress scapulae first; pull bar toward upper sternum." },
    { id: "b2", name: "Pronated Pull-ups", split: "pull", category: "Back", area: "Width (Lats)", equip: "Pull-up Bar", cue: "Drive elbows down and back into your ribcage." },
    { id: "b3", name: "Lat Pullover", split: "pull", category: "Back", area: "Width (Lats)", equip: "Cable / Rope", cue: "Slight elbow bend, stretch near armpit, squeeze down to hips." },
    { id: "b4", name: "Seated Cable Row (Close Grip)", split: "pull", category: "Back", area: "Thickness", equip: "Cable Machine", cue: "Elbows tucked tight; retract lats and mid-back." },
    { id: "b5", name: "Chest-Supported Row", split: "pull", category: "Back", area: "Thickness", equip: "Dumbbells", cue: "Chest anchored against incline pad; eliminates lower back fatigue." },
    { id: "b6", name: "T-Bar Row", split: "pull", category: "Back", area: "Thickness", equip: "Barbell / T-Bar", cue: "Hinge at hips; drive elbows straight back." },
    { id: "b7", name: "Dumbbell Shrugs", split: "pull", category: "Back", area: "Traps", equip: "Dumbbells", cue: "Straight elevation toward ears; hold 1s at top peak." },
    { id: "b8", name: "Kelso Shrugs", split: "pull", category: "Back", area: "Traps", equip: "Incline Bench", cue: "Retract scapulae horizontally to target mid/lower traps." },
    { id: "b9", name: "Barbell Deadlift", split: "pull", category: "Back", area: "Lower Back", equip: "Barbell", cue: "Drive through heels, brace core, hinge spine neutrally." },
    { id: "b10", name: "Rack Pulls", split: "pull", category: "Back", area: "Lower Back", equip: "Power Rack", cue: "Set pins below knee; overload upper/lower back chain." },
    { id: "b11", name: "Hyperextensions", split: "pull", category: "Back", area: "Lower Back", equip: "Roman Chair", cue: "Squeeze erector spinae and glutes at the top." },

    // --- SHOULDERS ---
    { id: "s1", name: "Standing Overhead Press", split: "push", category: "Shoulders", area: "Front Delts", equip: "Barbell", cue: "Full vertical press; lock out with head through the window." },
    { id: "s2", name: "Seated Dumbbell Shoulder Press", split: "push", category: "Shoulders", area: "Front Delts", equip: "Dumbbells", cue: "Bench angle 60-75°; press through the shoulder plane." },
    { id: "s3", name: "Cable Lateral Raises", split: "push", category: "Shoulders", area: "Side Delts", equip: "Cable Machine", cue: "Consistent tension from bottom to 90° abduction." },
    { id: "s4", name: "Dumbbell Lateral Raises", split: "push", category: "Shoulders", area: "Side Delts", equip: "Dumbbells", cue: "Lead with elbows; avoid swinging torso." },
    { id: "s5", name: "Reverse Pec Deck", split: "pull", category: "Shoulders", area: "Rear Delts", equip: "Machine", cue: "Keep elbows level with shoulders; pull outward horizontally." },
    { id: "s6", name: "Rope Face Pulls", split: "pull", category: "Shoulders", area: "Rear Delts", equip: "Cable Machine", cue: "Pull rope directly to eye level while externally rotating." },
    { id: "s7", name: "Bent-Over Rear Delt Fly", split: "pull", category: "Shoulders", area: "Rear Delts", equip: "Dumbbells", cue: "Hinge torso flat; sweep arms wide." },

    // --- BICEPS ---
    { id: "bi1", name: "Incline Dumbbell Curl", split: "pull", category: "Biceps", area: "Long Head", equip: "Dumbbells (45°)", cue: "Elbows held behind torso to maximize long head stretch." },
    { id: "bi2", name: "Bayesian Cable Curl", split: "pull", category: "Biceps", area: "Long Head", equip: "Cable Machine", cue: "Facing away from cable; constant stretch throughout." },
    { id: "bi3", name: "Standing Barbell Curl", split: "pull", category: "Biceps", area: "Long Head", equip: "Straight / EZ Bar", cue: "Strict arm mechanics without hip momentum." },
    { id: "bi4", name: "Preacher Curl", split: "pull", category: "Biceps", area: "Short Head", equip: "Preacher Bench", cue: "Arms forward on pad; peak tension at initial curl." },
    { id: "bi5", name: "Spider Curl", split: "pull", category: "Biceps", area: "Short Head", cue: "Chest against incline; elbows hang vertical." },
    { id: "bi6", name: "Dumbbell Hammer Curls", split: "pull", category: "Biceps", area: "Brachialis", equip: "Dumbbells", cue: "Neutral grip; thickens the upper forearm and outer arm." },
    { id: "bi7", name: "Reverse Grip Barbell Curl", split: "pull", category: "Biceps", area: "Brachioradialis", equip: "Barbell", cue: "Overhand grip to bias forearm musculature." },

    // --- TRICEPS ---
    { id: "t1", name: "Overhead Triceps Extension", split: "push", category: "Triceps", area: "Long Head", equip: "Cable / Dumbbell", cue: "Elbows overhead to place the long head into full stretch." },
    { id: "t2", name: "Skull Crushers", split: "push", category: "Triceps", area: "Long Head", equip: "EZ Bar", cue: "Lower bar toward crown of head; extend strictly at elbows." },
    { id: "t3", name: "Triceps Rope Pushdown", split: "push", category: "Triceps", area: "Lateral Head", equip: "Cable Machine", cue: "Flare ends of rope apart at full lockout." },
    { id: "t4", name: "Close-Grip Bench Press", split: "push", category: "Triceps", area: "Lateral Head", equip: "Barbell", cue: "Hands shoulder-width apart; press using triceps drive." },
    { id: "t5", name: "Reverse-Grip Pushdown", split: "push", category: "Triceps", area: "Medial Head", equip: "Cable Machine", cue: "Supinated grip for locked-out medial head contraction." },
    { id: "t6", name: "Diamond Push-ups", split: "push", category: "Triceps", area: "Medial Head", equip: "Bodyweight", cue: "Hands touching together below sternum." },

    // --- LEGS ---
    { id: "l1", name: "Barbell Back Squats", split: "legs", category: "Legs", area: "Quads & Glutes", equip: "Barbell / Rack", cue: "Squat below parallel; drive up through whole foot." },
    { id: "l2", name: "Leg Press", split: "legs", category: "Legs", area: "Quads", equip: "Sled Machine", cue: "Feet mid-plate; deep knee flexion without pelvic tuck." },
    { id: "l3", name: "Bulgarian Split Squats", split: "legs", category: "Legs", area: "Quads & Glutes", equip: "Dumbbells", cue: "Rear foot elevated on bench; torso forward for glutes, upright for quads." },
    { id: "l4", name: "Leg Extensions", split: "legs", category: "Legs", area: "Quads (Isolation)", equip: "Machine", cue: "Pause at full knee extension for peak rectus femoris load." },
    { id: "l5", name: "Romanian Deadlift (RDL)", split: "legs", category: "Legs", area: "Hamstrings", equip: "Barbell / DBs", cue: "Push hips back; stop when hamstrings hit max stretch." },
    { id: "l6", name: "Seated Leg Curls", split: "legs", category: "Legs", area: "Hamstrings", equip: "Machine", cue: "Dorsiflex toes; smooth eccentric return." },
    { id: "l7", name: "Barbell Hip Thrusts", split: "legs", category: "Legs", area: "Glutes", equip: "Barbell & Bench", cue: "Upper back fixed on bench; full hip extension lockout." },
    { id: "l8", name: "Adductor Machine", split: "legs", category: "Legs", area: "Adductors", equip: "Machine", cue: "Squeeze knees together to target inner thigh muscles." },
    { id: "l9", name: "Abductor Machine", split: "legs", category: "Legs", area: "Abductors", equip: "Machine", cue: "Drive knees outward to isolate gluteus medius." },
    { id: "l10", name: "Standing Calf Raises", split: "legs", category: "Legs", area: "Calves (Gastrocnemius)", equip: "Smith / Machine", cue: "Full stretch at bottom; push through big toes." },
    { id: "l11", name: "Seated Calf Raises", split: "legs", category: "Legs", area: "Calves (Soleus)", equip: "Machine", cue: "Bent knees isolate soleus muscle fiber." },

    // --- ABS / CORE ---
    { id: "a1", name: "Cable Crunches", split: "push", category: "Abs / Core", area: "Upper Abs", equip: "Cable Machine", cue: "Spinal flexion: curl ribs down toward pelvis, don't bend at hips." },
    { id: "a2", name: "Decline Bench Crunches", split: "push", category: "Abs / Core", area: "Upper Abs", equip: "Decline Bench", cue: "Curl torso upward against gravity." },
    { id: "a3", name: "Hanging Leg / Knee Raises", split: "pull", category: "Abs / Core", area: "Lower Abs", equip: "Pull-up Bar", cue: "Posterior pelvic tilt: curl pelvis up toward chest." },
    { id: "a4", name: "Lying Leg Raises", split: "pull", category: "Abs / Core", area: "Lower Abs", equip: "Mat", cue: "Press lower back firmly into the floor throughout." },
    { id: "a5", name: "Russian Twists", split: "pull", category: "Abs / Core", area: "Obliques", equip: "Plate / Med Ball", cue: "Controlled trunk rotation under active tension." },
    { id: "a6", name: "Cable Woodchoppers", split: "push", category: "Abs / Core", area: "Obliques", equip: "Cable Machine", cue: "Rotational power from the torso." },
    { id: "a7", name: "Ab Wheel Rollouts", split: "push", category: "Abs / Core", area: "Core Stability", equip: "Ab Wheel", cue: "Maintain posterior pelvic tilt; don't let lower back sag." },
    { id: "a8", name: "Standard Plank", split: "legs", category: "Abs / Core", area: "Core Stability", equip: "Mat", cue: "Static isometric anti-extension hold." }
  ];

  // State Management
  let activeSession = null;
  let sessionTimer = null;
  let restTimerInterval = null;
  let restTimeLeft = 90;
  let restTimerActive = false;

  // View Containers
  const landingPage = document.getElementById("landing-page");
  const appWorkspace = document.getElementById("app-workspace");
  const subviews = document.querySelectorAll(".subview");
  const sideLinks = document.querySelectorAll(".side-link");
  const toastCont = document.getElementById("toast-container");

  function toast(message) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    toastCont.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 250);
    }, 2800);
  }

  // --- 1. PERSISTENCE & DATA SEEDING ---
  function getWorkouts() {
    return JSON.parse(localStorage.getItem("gymrat_history") || "[]");
  }

  function saveWorkouts(data) {
    localStorage.setItem("gymrat_history", JSON.stringify(data));
  }

  function getProfile() {
    return JSON.parse(localStorage.getItem("gymrat_user_profile") || JSON.stringify({
      name: "Harish",
      division: "Gymrat Division",
      weight: 70,
      targetWorkouts: 5,
      focus: "Hypertrophy"
    }));
  }

  function saveProfile(prof) {
    localStorage.setItem("gymrat_user_profile", JSON.stringify(prof));
  }

  function seedInitialDataIfEmpty() {
    const current = getWorkouts();
    if (current.length === 0) {
      const now = Date.now();
      const oneDay = 86400000;
      const initialLogs = [
        {
          id: "w-seed-1",
          name: "Push Hypertrophy Session",
          split: "push",
          timestamp: now - (oneDay * 8),
          duration: 55,
          totalVolume: 4200,
          totalSets: 12,
          exercises: [
            {
              name: "Flat Barbell Bench Press",
              sets: [
                { setNum: 1, weight: 60, reps: 10 },
                { setNum: 2, weight: 65, reps: 8 },
                { setNum: 3, weight: 70, reps: 6 }
              ]
            },
            {
              name: "Incline Dumbbell Press",
              sets: [
                { setNum: 1, weight: 22, reps: 10 },
                { setNum: 2, weight: 24, reps: 8 }
              ]
            }
          ]
        },
        {
          id: "w-seed-2",
          name: "Pull Hypertrophy Session",
          split: "pull",
          timestamp: now - (oneDay * 5),
          duration: 60,
          totalVolume: 5100,
          totalSets: 14,
          exercises: [
            {
              name: "Barbell Deadlift",
              sets: [
                { setNum: 1, weight: 100, reps: 6 },
                { setNum: 2, weight: 110, reps: 5 }
              ]
            },
            {
              name: "Lat Pulldown (Wide Grip)",
              sets: [
                { setNum: 1, weight: 55, reps: 10 },
                { setNum: 2, weight: 60, reps: 8 }
              ]
            }
          ]
        },
        {
          id: "w-seed-3",
          name: "Push Overload Session",
          split: "push",
          timestamp: now - (oneDay * 2),
          duration: 58,
          totalVolume: 4800,
          totalSets: 12,
          exercises: [
            {
              name: "Flat Barbell Bench Press",
              sets: [
                { setNum: 1, weight: 65, reps: 10 },
                { setNum: 2, weight: 70, reps: 8 },
                { setNum: 3, weight: 75, reps: 5 }
              ]
            }
          ]
        }
      ];
      saveWorkouts(initialLogs);
    }
  }

  // --- 2. NAVIGATION & ROUTING ---
  function enterAppWorkspace() {
    landingPage.classList.remove("active-panel");
    appWorkspace.classList.add("active-panel");
    switchSubView("view-dashboard");
    syncUserProfileUI();
  }

  function enterLandingPage() {
    appWorkspace.classList.remove("active-panel");
    landingPage.classList.add("active-panel");
  }

  function switchSubView(viewId) {
    subviews.forEach(v => v.classList.remove("active"));
    const target = document.getElementById(viewId);
    if (target) target.classList.add("active");

    sideLinks.forEach(l => {
      l.classList.toggle("active", l.dataset.target === viewId);
    });

    if (viewId === "view-dashboard") renderDashboard();
    if (viewId === "view-history") renderHistoryTable();
    if (viewId === "view-analytics") renderAnalytics();
    if (viewId === "view-library") renderLibraryGrid();
    if (viewId === "view-profile") loadProfileForm();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Welcome Screen actions
  document.getElementById("landing-start-btn").addEventListener("click", enterAppWorkspace);
  document.getElementById("landing-login-btn").addEventListener("click", () => {
    document.getElementById("login-modal").style.display = "flex";
  });
  document.getElementById("login-modal-close").addEventListener("click", () => {
    document.getElementById("login-modal").style.display = "none";
  });
  document.getElementById("login-quick-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const val = document.getElementById("quick-login-name").value.trim();
    if (val) {
      const prof = getProfile();
      prof.name = val;
      saveProfile(prof);
      document.getElementById("login-modal").style.display = "none";
      enterAppWorkspace();
    }
  });

  document.getElementById("brand-home-link").addEventListener("click", () => switchSubView("view-dashboard"));
  document.getElementById("sidebar-logout-btn").addEventListener("click", enterLandingPage);
  document.getElementById("topbar-quick-workout-btn").addEventListener("click", () => {
    switchSubView("view-logger");
    startActiveWorkoutSession("push");
  });

  sideLinks.forEach(link => {
    link.addEventListener("click", () => switchSubView(link.dataset.target));
  });

  // --- 3. PROGRESSION INSIGHTS ENGINE ---
  function computeProgressionInsights(workouts) {
    const insights = [];
    if (workouts.length < 2) {
      insights.push("Log at least two completed workouts to initiate multi-week progression trends.");
      return insights;
    }

    const benchSessions = workouts
      .filter(w => w.exercises.some(e => e.name === "Flat Barbell Bench Press"))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (benchSessions.length >= 2) {
      const first = benchSessions[0];
      const latest = benchSessions[benchSessions.length - 1];
      const firstMax = Math.max(...first.exercises.find(e => e.name === "Flat Barbell Bench Press").sets.map(s => s.weight));
      const latestMax = Math.max(...latest.exercises.find(e => e.name === "Flat Barbell Bench Press").sets.map(s => s.weight));

      if (latestMax > firstMax) {
        const gain = Math.round(((latestMax - firstMax) / firstMax) * 100);
        insights.push(`Your Barbell Bench Press working load increased by ${gain}% (${firstMax}kg → ${latestMax}kg).`);
      } else if (latestMax === firstMax) {
        insights.push(`Barbell Bench Press load remained steady at ${latestMax}kg across your latest sessions.`);
      }
    }

    const oneWeekAgo = Date.now() - (7 * 86400000);
    const recentWorkouts = workouts.filter(w => w.timestamp >= oneWeekAgo);
    const hasLegs = recentWorkouts.some(w => w.split === "legs");

    if (!hasLegs && workouts.length >= 3) {
      insights.push("Observation: No Leg split logged in the past 7 days. Ensure posterior chain recovery balance.");
    } else if (hasLegs) {
      insights.push("Equilibrium maintained: Upper and lower splits logged evenly this week.");
    }

    const thisMonthWorkouts = workouts.filter(w => new Date(w.timestamp).getMonth() === new Date().getMonth()).length;
    insights.push(`Active cadence: You have completed ${thisMonthWorkouts} total training sessions this calendar month.`);

    return insights;
  }

  // --- 4. DASHBOARD RENDERING ---
  function renderDashboard() {
    const workouts = getWorkouts();
    const profile = getProfile();
    const now = Date.now();
    const oneWeekAgo = now - (7 * 86400000);

    const weeklyWorkouts = workouts.filter(w => w.timestamp >= oneWeekAgo);
    const weeklyVol = weeklyWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    document.getElementById("dash-weekly-vol").innerHTML = `${weeklyVol.toLocaleString()} <small>kg</small>`;

    document.getElementById("dash-total-workouts").textContent = workouts.length;
    const thisMonth = workouts.filter(w => new Date(w.timestamp).getMonth() === new Date().getMonth()).length;
    document.getElementById("dash-workouts-month").textContent = `${thisMonth} completed this month`;

    const datesTrained = new Set(workouts.map(w => new Date(w.timestamp).toDateString()));
    document.getElementById("dash-streak").innerHTML = `${datesTrained.size} <small>days</small>`;

    const prMap = {};
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (!prMap[ex.name] || s.weight > prMap[ex.name]) {
            prMap[ex.name] = s.weight;
          }
        });
      });
    });
    document.getElementById("dash-pr-count").textContent = Object.keys(prMap).length;

    const goalTarget = profile.targetWorkouts || 5;
    const workoutsDoneThisWeek = weeklyWorkouts.length;
    document.getElementById("dash-goal-compliance").textContent = `${workoutsDoneThisWeek}/${goalTarget}`;
    const goalPct = Math.min(100, Math.round((workoutsDoneThisWeek / goalTarget) * 100));
    document.getElementById("dash-goal-bar").style.width = `${goalPct}%`;

    const insightsContainer = document.getElementById("insights-container");
    insightsContainer.innerHTML = "";
    const activeInsights = computeProgressionInsights(workouts);
    activeInsights.forEach(txt => {
      const d = document.createElement("div");
      d.className = "insight-item";
      d.textContent = txt;
      insightsContainer.appendChild(d);
    });

    const heatContainer = document.getElementById("dashboard-heatmap-bars");
    heatContainer.innerHTML = "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyVolume = [0, 0, 0, 0, 0, 0, 0];

    weeklyWorkouts.forEach(w => {
      const dayIdx = new Date(w.timestamp).getDay();
      dailyVolume[dayIdx] += w.totalVolume || 0;
    });

    const maxDayVol = Math.max(...dailyVolume, 1000);
    days.forEach((dayName, idx) => {
      const col = document.createElement("div");
      col.className = "heat-day-col";
      const heightPercent = Math.max(5, Math.round((dailyVolume[idx] / maxDayVol) * 100));
      col.innerHTML = `
        <div class="heat-bar-fill" style="height: ${heightPercent}%;" title="${dailyVolume[idx]} kg"></div>
        <span class="heat-lbl">${dayName}</span>
      `;
      heatContainer.appendChild(col);
    });
  }

  // --- 5. WORKOUT LOGGER ---
  const splitOptions = document.querySelectorAll(".split-opt");
  splitOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      splitOptions.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      if (activeSession) {
        activeSession.split = opt.dataset.split;
        document.getElementById("session-name-input").value = `${opt.dataset.split.toUpperCase()} Hypertrophy Session`;
        populateLoggerExerciseDropdown(opt.dataset.split);
      }
    });
  });

  function populateLoggerExerciseDropdown(split) {
    const dropdown = document.getElementById("logger-exercise-dropdown");
    dropdown.innerHTML = "";
    EXERCISE_CATALOG.filter(e => e.split === split).forEach(ex => {
      const opt = document.createElement("option");
      opt.value = ex.name;
      opt.textContent = `${ex.name} (${ex.area})`;
      dropdown.appendChild(opt);
    });
  }

  function startActiveWorkoutSession(split = "push") {
    activeSession = {
      id: `w-${Date.now()}`,
      name: `${split.toUpperCase()} Hypertrophy Session`,
      split: split,
      startTime: Date.now(),
      exercises: []
    };

    document.getElementById("session-name-input").value = activeSession.name;
    splitOptions.forEach(o => o.classList.toggle("active", o.dataset.split === split));
    populateLoggerExerciseDropdown(split);

    document.getElementById("logger-exercises-list").innerHTML = "";
    const defaults = EXERCISE_CATALOG.filter(e => e.split === split).slice(0, 2);
    defaults.forEach(ex => addExerciseToLogger(ex.name));

    clearInterval(sessionTimer);
    sessionTimer = setInterval(() => {
      const sec = Math.floor((Date.now() - activeSession.startTime) / 1000);
      const m = String(Math.floor(sec / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      document.getElementById("session-stopwatch").textContent = `${m}:${s}`;
    }, 1000);

    recalculateLiveLoggerTotals();
  }

  document.getElementById("logger-add-exercise-btn").addEventListener("click", () => {
    const val = document.getElementById("logger-exercise-dropdown").value;
    if (val) addExerciseToLogger(val);
  });

  function addExerciseToLogger(exerciseName) {
    const exId = `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const exObj = { id: exId, name: exerciseName, sets: [] };
    activeSession.exercises.push(exObj);

    const card = document.createElement("div");
    card.className = "logged-exercise-card";
    card.id = exId;
    card.innerHTML = `
      <div class="logged-ex-header">
        <h4 class="logged-ex-title">${exerciseName}</h4>
        <button class="btn-remove-ex" data-target="${exId}">✕ Remove</button>
      </div>
      <table class="logger-sets-table">
        <thead>
          <tr><th>SET</th><th>WEIGHT (KG)</th><th>REPS</th><th>ACTION</th></tr>
        </thead>
        <tbody class="sets-tbody"></tbody>
      </table>
      <button class="btn-add-set-row" data-target="${exId}">+ Add Working Set</button>
    `;

    document.getElementById("logger-exercises-list").appendChild(card);
    addSetRow(exObj, card.querySelector(".sets-tbody"));
  }

  function addSetRow(exObj, tbody) {
    const setNum = exObj.sets.length + 1;
    const lastWeight = exObj.sets.length > 0 ? exObj.sets[exObj.sets.length - 1].weight : 60;
    const lastReps = exObj.sets.length > 0 ? exObj.sets[exObj.sets.length - 1].reps : 10;

    const setObj = { setNum, weight: lastWeight, reps: lastReps };
    exObj.sets.push(setObj);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>#${setNum}</strong></td>
      <td><input type="number" class="table-input in-w" value="${lastWeight}" step="0.5" min="1"></td>
      <td><input type="number" class="table-input in-r" value="${lastReps}" min="1"></td>
      <td><button class="btn-del-set">✕</button></td>
    `;

    const inW = tr.querySelector(".in-w");
    const inR = tr.querySelector(".in-r");
    const btnDel = tr.querySelector(".btn-del-set");

    const sync = () => {
      setObj.weight = parseFloat(inW.value) || 0;
      setObj.reps = parseInt(inR.value) || 0;
      recalculateLiveLoggerTotals();
    };

    inW.addEventListener("input", sync);
    inR.addEventListener("input", sync);

    btnDel.addEventListener("click", () => {
      const idx = exObj.sets.indexOf(setObj);
      if (idx > -1) {
        exObj.sets.splice(idx, 1);
        tr.remove();
        recalculateLiveLoggerTotals();
      }
    });

    tbody.appendChild(tr);
    recalculateLiveLoggerTotals();
  }

  document.getElementById("logger-exercises-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-add-set-row")) {
      const exId = e.target.dataset.target;
      const exObj = activeSession.exercises.find(x => x.id === exId);
      const tbody = document.getElementById(exId).querySelector(".sets-tbody");
      if (exObj && tbody) addSetRow(exObj, tbody);
    }
    if (e.target.classList.contains("btn-remove-ex")) {
      const exId = e.target.dataset.target;
      activeSession.exercises = activeSession.exercises.filter(x => x.id !== exId);
      document.getElementById(exId).remove();
      recalculateLiveLoggerTotals();
    }
  });

  function recalculateLiveLoggerTotals() {
    let totVol = 0;
    let totSets = 0;
    if (activeSession) {
      activeSession.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          totVol += (s.weight * s.reps);
          totSets++;
        });
      });
    }
    document.getElementById("logger-live-volume").textContent = `${totVol.toLocaleString()} kg`;
    document.getElementById("logger-live-sets").textContent = totSets;
  }

  document.getElementById("logger-cancel-btn").addEventListener("click", () => {
    if (confirm("Discard this active workout session?")) {
      clearInterval(sessionTimer);
      activeSession = null;
      switchSubView("view-dashboard");
      toast("Workout session discarded.");
    }
  });

  document.getElementById("logger-finish-btn").addEventListener("click", () => {
    let totVol = 0;
    let totSets = 0;

    activeSession.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        totVol += (s.weight * s.reps);
        totSets++;
      });
    });

    if (totSets === 0) {
      toast("Add at least one working set before finishing.");
      return;
    }

    clearInterval(sessionTimer);
    const duration = Math.max(1, Math.floor((Date.now() - activeSession.startTime) / 60000));
    const titleVal = document.getElementById("session-name-input").value.trim();

    const record = {
      id: `w-${Date.now()}`,
      name: titleVal || activeSession.name,
      split: activeSession.split,
      timestamp: Date.now(),
      duration: duration,
      totalVolume: totVol,
      totalSets: totSets,
      exercises: activeSession.exercises
    };

    const workouts = getWorkouts();
    workouts.unshift(record);
    saveWorkouts(workouts);

    activeSession = null;
    toast("Workout logged successfully.");
    switchSubView("view-history");
  });

  // --- 6. REST TIMER WIDGET ---
  const presetPills = document.querySelectorAll(".preset-pill");
  presetPills.forEach(pill => {
    pill.addEventListener("click", () => {
      if (pill.parentElement.classList.contains("preset-pills")) {
        presetPills.forEach(p => {
          if (p.parentElement.classList.contains("preset-pills")) p.classList.remove("active");
        });
        pill.classList.add("active");
        restTimeLeft = parseInt(pill.dataset.seconds);
        updateRestTimerDisplay();
        if (restTimerActive) {
          clearInterval(restTimerInterval);
          startRestCountdown();
        }
      }
    });
  });

  function updateRestTimerDisplay() {
    const m = String(Math.floor(restTimeLeft / 60)).padStart(2, "0");
    const s = String(restTimeLeft % 60).padStart(2, "0");
    document.getElementById("rest-timer-digits").textContent = `${m}:${s}`;
  }

  function startRestCountdown() {
    restTimerActive = true;
    document.getElementById("rest-timer-toggle").textContent = "Pause";
    restTimerInterval = setInterval(() => {
      if (restTimeLeft > 0) {
        restTimeLeft--;
        updateRestTimerDisplay();
      } else {
        clearInterval(restTimerInterval);
        restTimerActive = false;
        document.getElementById("rest-timer-toggle").textContent = "Start";
        toast("Rest complete! Begin your next working set.");
      }
    }, 1000);
  }

  document.getElementById("rest-timer-toggle").addEventListener("click", () => {
    if (restTimerActive) {
      clearInterval(restTimerInterval);
      restTimerActive = false;
      document.getElementById("rest-timer-toggle").textContent = "Resume";
    } else {
      startRestCountdown();
    }
  });

  document.getElementById("rest-timer-reset").addEventListener("click", () => {
    clearInterval(restTimerInterval);
    restTimerActive = false;
    document.getElementById("rest-timer-toggle").textContent = "Start";
    const activePill = document.querySelector(".preset-pills .preset-pill.active");
    restTimeLeft = activePill ? parseInt(activePill.dataset.seconds) : 90;
    updateRestTimerDisplay();
  });

  // --- 7. WORKOUT HISTORY CRUD ---
  function renderHistoryTable() {
    const workouts = getWorkouts();
    const filter = document.getElementById("history-filter-select").value;
    const tbody = document.getElementById("history-tbody");
    tbody.innerHTML = "";

    const filtered = filter === "all" ? workouts : workouts.filter(w => w.split === filter);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No logged workouts found for split: ${filter}.</td></tr>`;
      return;
    }

    filtered.forEach(w => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${new Date(w.timestamp).toLocaleDateString()}</strong></td>
        <td><span class="stat-trend positive">${w.split.toUpperCase()}</span> ${w.name}</td>
        <td>${w.duration} min</td>
        <td><strong>${w.totalVolume.toLocaleString()} kg</strong></td>
        <td>${w.totalSets}</td>
        <td>${w.exercises.length} movements</td>
        <td>
          <button class="btn btn-outline btn-sm btn-view-modal" data-id="${w.id}">Details</button>
          <button class="btn btn-ghost btn-sm btn-del-workout" data-id="${w.id}" style="color:var(--accent-crimson)">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("history-filter-select").addEventListener("change", renderHistoryTable);

  document.getElementById("history-tbody").addEventListener("click", (e) => {
    const wid = e.target.dataset.id;
    if (!wid) return;

    if (e.target.classList.contains("btn-del-workout")) {
      if (confirm("Delete this workout from progression records?")) {
        const remaining = getWorkouts().filter(w => w.id !== wid);
        saveWorkouts(remaining);
        renderHistoryTable();
        toast("Workout deleted.");
      }
    }

    if (e.target.classList.contains("btn-view-modal")) {
      const target = getWorkouts().find(w => w.id === wid);
      if (target) {
        document.getElementById("modal-workout-title").textContent = target.name;
        let html = `
          <div style="margin-bottom:1rem; color:var(--text-dim); font-size:0.85rem;">
            Logged on ${new Date(target.timestamp).toLocaleString()} • Duration: ${target.duration} min • Volume: ${target.totalVolume.toLocaleString()} kg
          </div>
        `;
        target.exercises.forEach(ex => {
          html += `
            <div style="margin-top:1rem; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px;">
              <strong style="color:var(--text-primary); font-size:0.95rem;">${ex.name}</strong>
              <div style="display:flex; gap:10px; margin-top:6px; flex-wrap:wrap;">
          `;
          ex.sets.forEach(s => {
            html += `<span class="stat-note" style="background:#090d16; padding:4px 8px; border-radius:4px;">Set ${s.setNum}: ${s.weight}kg × ${s.reps}</span>`;
          });
          html += `</div></div>`;
        });
        document.getElementById("modal-workout-body").innerHTML = html;
        document.getElementById("detail-modal").style.display = "flex";
      }
    }
  });

  document.getElementById("modal-close-btn").addEventListener("click", () => {
    document.getElementById("detail-modal").style.display = "none";
  });

  // --- 8. PROGRESSION ANALYTICS & CANVAS GRAPH ---
  function renderAnalytics() {
    const workouts = getWorkouts();
    const picker = document.getElementById("analytics-select-exercise");
    picker.innerHTML = "";

    EXERCISE_CATALOG.forEach(ex => {
      const opt = document.createElement("option");
      opt.value = ex.name;
      opt.textContent = `${ex.name} (${ex.category})`;
      picker.appendChild(opt);
    });

    drawExerciseProgression(picker.value);
  }

  document.getElementById("analytics-select-exercise").addEventListener("change", (e) => {
    drawExerciseProgression(e.target.value);
  });

  function drawExerciseProgression(exerciseName) {
    const workouts = getWorkouts().slice().reverse();
    const dataPoints = [];

    workouts.forEach(w => {
      const match = w.exercises.find(e => e.name === exerciseName);
      if (match && match.sets.length > 0) {
        const topWeight = Math.max(...match.sets.map(s => s.weight));
        dataPoints.push({
          date: new Date(w.timestamp).toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
          weight: topWeight
        });
      }
    });

    if (dataPoints.length > 0) {
      const allWeights = dataPoints.map(d => d.weight);
      document.getElementById("an-top-pr").textContent = `${Math.max(...allWeights)} kg`;
      document.getElementById("an-total-sessions").textContent = dataPoints.length;
      const avg = Math.round(allWeights.reduce((a, b) => a + b, 0) / allWeights.length);
      document.getElementById("an-avg-weight").textContent = `${avg} kg`;
    } else {
      document.getElementById("an-top-pr").textContent = "0 kg";
      document.getElementById("an-total-sessions").textContent = "0";
      document.getElementById("an-avg-weight").textContent = "0 kg";
    }

    const canvas = document.getElementById("progression-canvas");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = 280 * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 280;
    ctx.clearRect(0, 0, w, h);

    if (dataPoints.length === 0) {
      ctx.fillStyle = "#4b5563";
      ctx.font = "14px Plus Jakarta Sans";
      ctx.textAlign = "center";
      ctx.fillText(`No workout logs registered for ${exerciseName}.`, w / 2, h / 2);
      return;
    }

    const padding = 45;
    const maxVal = Math.max(...dataPoints.map(d => d.weight)) * 1.15;
    const minVal = Math.max(0, Math.min(...dataPoints.map(d => d.weight)) * 0.85);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + ((h - padding * 2) * (i / 4));
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    const points = dataPoints.map((dp, i) => {
      const x = padding + ((w - padding * 2) * (i / Math.max(dataPoints.length - 1, 1)));
      const y = h - padding - (((dp.weight - minVal) / (maxVal - minVal || 1)) * (h - padding * 2));
      return { x, y, dp };
    });

    ctx.strokeStyle = "#ff2b43";
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    points.forEach(pt => {
      ctx.fillStyle = "#ff2b43";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f8fafc";
      ctx.font = "10px Plus Jakarta Sans";
      ctx.textAlign = "center";
      ctx.fillText(`${pt.dp.weight}kg`, pt.x, pt.y - 10);
      ctx.fillStyle = "#7e8c9f";
      ctx.fillText(pt.dp.date, pt.x, h - 15);
    });
  }

  // --- 9. ADVANCED ANATOMY EXERCISE LIBRARY ---
  function renderLibraryGrid() {
    const grid = document.getElementById("library-cards-grid");
    const searchVal = document.getElementById("lib-search-input").value.toLowerCase();
    const activeFilter = document.querySelector("#lib-category-filters .preset-pill.active").dataset.category;

    grid.innerHTML = "";
    const filtered = EXERCISE_CATALOG.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchVal) ||
                            ex.category.toLowerCase().includes(searchVal) ||
                            ex.area.toLowerCase().includes(searchVal) ||
                            ex.equip.toLowerCase().includes(searchVal);
      const matchesCat = activeFilter === "all" || ex.category === activeFilter;
      return matchesSearch && matchesCat;
    });

    filtered.forEach(ex => {
      const card = document.createElement("div");
      card.className = "lib-card";
      card.innerHTML = `
        <div class="lib-badge-cluster">
          <span class="lib-cat-tag">${ex.category} • ${ex.split}</span>
          <span class="lib-area-tag">${ex.area}</span>
        </div>
        <h4 class="lib-title">${ex.name}</h4>
        <p class="lib-meta">Equipment: <strong>${ex.equip}</strong></p>
        <p class="lib-instructions">💡 <em>${ex.cue}</em></p>
      `;
      grid.appendChild(card);
    });
  }

  document.getElementById("lib-search-input").addEventListener("input", renderLibraryGrid);
  document.querySelectorAll("#lib-category-filters .preset-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("#lib-category-filters .preset-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderLibraryGrid();
    });
  });

  // --- 10. ATHLETE PROFILE & UI SYNC ---
  function syncUserProfileUI() {
    const p = getProfile();
    document.getElementById("sidebar-name-display").textContent = p.name;
    document.getElementById("sidebar-avatar-thumb").textContent = p.name.charAt(0).toUpperCase();
    document.getElementById("sidebar-role-display").textContent = p.division;
    document.getElementById("topbar-greeting").textContent = `Welcome Back, ${p.name}`;
  }

  function loadProfileForm() {
    const p = getProfile();
    document.getElementById("prof-name").value = p.name;
    document.getElementById("prof-division").value = p.division;
    document.getElementById("prof-weight").value = p.weight;
    document.getElementById("prof-target-workouts").value = p.targetWorkouts;
    document.getElementById("prof-focus").value = p.focus;
  }

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById("prof-name").value.trim() || "Harish",
      division: document.getElementById("prof-division").value.trim() || "Gymrat Division",
      weight: parseFloat(document.getElementById("prof-weight").value) || 70,
      targetWorkouts: parseInt(document.getElementById("prof-target-workouts").value) || 5,
      focus: document.getElementById("prof-focus").value
    };
    saveProfile(updated);
    syncUserProfileUI();
    toast("Athlete profile updated.");
  });

  // Initial Boot
  seedInitialDataIfEmpty();
  const d = new Date();
  document.getElementById("topbar-date").textContent = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
});