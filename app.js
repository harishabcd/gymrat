// ==========================================================
// GYMRAT COMPLETE ENGINE: ANALYTICS, CRUD & INSIGHTS
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Built-in Movement Master Registry
  const EXERCISE_CATALOG = [
    { id: "bp", name: "Barbell Bench Press", split: "push", category: "Chest", equip: "Barbell" },
    { id: "idb", name: "Incline DB Press", split: "push", category: "Chest", equip: "Dumbbells" },
    { id: "ohp", name: "Standing Overhead Press", split: "push", category: "Shoulders", equip: "Barbell" },
    { id: "lr", name: "Cable Lateral Raises", split: "push", category: "Shoulders", equip: "Cable Machine" },
    { id: "tr", name: "Triceps Rope Pushdown", split: "push", category: "Arms", equip: "Cable Machine" },
    { id: "dl", name: "Barbell Deadlift", split: "pull", category: "Back", equip: "Barbell" },
    { id: "lp", name: "Lat Pulldown", split: "pull", category: "Back", equip: "Cable Machine" },
    { id: "cr", name: "Chest Supported Row", split: "pull", category: "Back", equip: "Dumbbells" },
    { id: "fp", name: "Face Pulls", split: "pull", category: "Shoulders", equip: "Cable Machine" },
    { id: "bc", name: "Incline DB Bicep Curls", split: "pull", category: "Arms", equip: "Dumbbells" },
    { id: "sq", name: "Barbell Back Squat", split: "legs", category: "Legs", equip: "Barbell / Rack" },
    { id: "rdl", name: "Romanian Deadlift", split: "legs", category: "Legs", equip: "Barbell" },
    { id: "bss", name: "Bulgarian Split Squats", split: "legs", category: "Legs", equip: "Dumbbells" },
    { id: "lc", name: "Seated Leg Curls", split: "legs", category: "Legs", equip: "Machine" },
    { id: "crz", name: "Standing Calf Raises", split: "legs", category: "Legs", equip: "Machine" }
  ];

  // Global State
  let activeSession = null;
  let sessionTimer = null;
  let restTimerInterval = null;
  let restTimeLeft = 90;
  let restTimerActive = false;

  // Primary Containers
  const landingPage = document.getElementById("landing-page");
  const appWorkspace = document.getElementById("app-workspace");
  const subviews = document.querySelectorAll(".subview");
  const sideLinks = document.querySelectorAll(".side-link");
  const toastCont = document.getElementById("toast-container");

  // Notifications
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

  // --- 1. PERSISTENCE & REALISTIC SEED GENERATOR ---
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

  // Seed sample data on first run
  function seedInitialDataIfEmpty() {
    const current = getWorkouts();
    if (current.length === 0) {
      const now = Date.now();
      const oneDay = 86400000;
      const initialLogs = [
        {
          id: "w-seed-1",
          name: "Push Hypertrophy Day",
          split: "push",
          timestamp: now - (oneDay * 8),
          duration: 55,
          totalVolume: 4200,
          totalSets: 12,
          exercises: [
            {
              name: "Barbell Bench Press",
              sets: [
                { setNum: 1, weight: 60, reps: 10 },
                { setNum: 2, weight: 65, reps: 8 },
                { setNum: 3, weight: 70, reps: 6 }
              ]
            },
            {
              name: "Incline DB Press",
              sets: [
                { setNum: 1, weight: 22, reps: 10 },
                { setNum: 2, weight: 24, reps: 8 }
              ]
            }
          ]
        },
        {
          id: "w-seed-2",
          name: "Pull Hypertrophy Day",
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
              name: "Lat Pulldown",
              sets: [
                { setNum: 1, weight: 55, reps: 10 },
                { setNum: 2, weight: 60, reps: 8 }
              ]
            }
          ]
        },
        {
          id: "w-seed-3",
          name: "Push Overload Day",
          split: "push",
          timestamp: now - (oneDay * 2),
          duration: 58,
          totalVolume: 4800,
          totalSets: 12,
          exercises: [
            {
              name: "Barbell Bench Press",
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

  // Event Listeners for Nav
  document.getElementById("landing-start-btn").addEventListener("click", enterAppWorkspace);
  document.getElementById("landing-login-btn").addEventListener("click", enterAppWorkspace);
  document.getElementById("hero-get-started-btn").addEventListener("click", enterAppWorkspace);
  document.getElementById("hero-demo-btn").addEventListener("click", enterAppWorkspace);
  document.getElementById("brand-home-link").addEventListener("click", () => switchSubView("view-dashboard"));
  document.getElementById("sidebar-logout-btn").addEventListener("click", enterLandingPage);
  document.getElementById("topbar-quick-workout-btn").addEventListener("click", () => {
    switchSubView("view-logger");
    startActiveWorkoutSession("push");
  });

  sideLinks.forEach(link => {
    link.addEventListener("click", () => switchSubView(link.dataset.target));
  });

  // --- 3. PROGRESSION INSIGHTS CALCULATION ENGINE ---
  function computeProgressionInsights(workouts) {
    const insights = [];
    if (workouts.length < 2) {
      insights.push("Log at least two completed workouts to initiate multi-week progression trends.");
      return insights;
    }

    // Benchmark Bench Press
    const benchPressSessions = workouts
      .filter(w => w.exercises.some(e => e.name === "Barbell Bench Press"))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (benchPressSessions.length >= 2) {
      const first = benchPressSessions[0];
      const latest = benchPressSessions[benchPressSessions.length - 1];
      const firstMax = Math.max(...first.exercises.find(e => e.name === "Barbell Bench Press").sets.map(s => s.weight));
      const latestMax = Math.max(...latest.exercises.find(e => e.name === "Barbell Bench Press").sets.map(s => s.weight));

      if (latestMax > firstMax) {
        const gain = Math.round(((latestMax - firstMax) / firstMax) * 100);
        insights.push(`Your Barbell Bench Press working load increased by ${gain}% (${firstMax}kg → ${latestMax}kg).`);
      } else if (latestMax === firstMax) {
        insights.push(`Barbell Bench Press load remained steady at ${latestMax}kg across your latest sessions.`);
      }
    }

    // Muscle Group Compliance
    const oneWeekAgo = Date.now() - (7 * 86400000);
    const recentWorkouts = workouts.filter(w => w.timestamp >= oneWeekAgo);
    const hasLegs = recentWorkouts.some(w => w.split === "legs");

    if (!hasLegs && workouts.length >= 3) {
      insights.push("Observation: No Leg split logged in the past 7 days. Ensure posterior chain recovery balance.");
    } else if (hasLegs) {
      insights.push("Equilibrium maintained: Upper and lower splits logged evenly this week.");
    }

    // Frequency Compliance
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

    // Weekly Volume
    const weeklyWorkouts = workouts.filter(w => w.timestamp >= oneWeekAgo);
    const weeklyVol = weeklyWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    document.getElementById("dash-weekly-vol").innerHTML = `${weeklyVol.toLocaleString()} <small>kg</small>`;

    // Total Workouts & Month Workouts
    document.getElementById("dash-total-workouts").textContent = workouts.length;
    const thisMonth = workouts.filter(w => new Date(w.timestamp).getMonth() === new Date().getMonth()).length;
    document.getElementById("dash-workouts-month").textContent = `${thisMonth} completed this month`;

    // Unique Workout Days Streak
    const datesTrained = new Set(workouts.map(w => new Date(w.timestamp).toDateString()));
    document.getElementById("dash-streak").innerHTML = `${datesTrained.size} <small>days</small>`;

    // Calculated PRs
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

    // Compliance Goal
    const goalTarget = profile.targetWorkouts || 5;
    const workoutsDoneThisWeek = weeklyWorkouts.length;
    document.getElementById("dash-goal-compliance").textContent = `${workoutsDoneThisWeek}/${goalTarget}`;
    const goalPct = Math.min(100, Math.round((workoutsDoneThisWeek / goalTarget) * 100));
    document.getElementById("dash-goal-bar").style.width = `${goalPct}%`;

    // Insights Stack
    const insightsContainer = document.getElementById("insights-container");
    insightsContainer.innerHTML = "";
    const activeInsights = computeProgressionInsights(workouts);
    activeInsights.forEach(txt => {
      const d = document.createElement("div");
      d.className = "insight-item";
      d.textContent = txt;
      insightsContainer.appendChild(d);
    });

    // 7-Day Heatmap Bars
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

  // --- 5. WORKOUT LOGGER & REAL-TIME STATE ---
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
      opt.textContent = `${ex.name} (${ex.category})`;
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

    // Initial Exercises
    document.getElementById("logger-exercises-list").innerHTML = "";
    const defaults = EXERCISE_CATALOG.filter(e => e.split === split).slice(0, 2);
    defaults.forEach(ex => addExerciseToLogger(ex.name));

    // Reset Stopwatch
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

  // Delegated dynamic button events
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

  // Discard & Finish Handlers
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
      presetPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      restTimeLeft = parseInt(pill.dataset.seconds);
      updateRestTimerDisplay();
      if (restTimerActive) {
        clearInterval(restTimerInterval);
        startRestCountdown();
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
        toast("Rest complete! Begin next set.");
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
    const activePill = document.querySelector(".preset-pill.active");
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

  // History table delegation (View Modal & Delete)
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
      opt.textContent = ex.name;
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

    // Populate Analytics Header Strip
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

    // Native Canvas Line Chart Renderer
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

    // Draw Subtle Horizontal Guides
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + ((h - padding * 2) * (i / 4));
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // Compute Node Points
    const points = dataPoints.map((dp, i) => {
      const x = padding + ((w - padding * 2) * (i / Math.max(dataPoints.length - 1, 1)));
      const y = h - padding - (((dp.weight - minVal) / (maxVal - minVal || 1)) * (h - padding * 2));
      return { x, y, dp };
    });

    // Draw Line
    ctx.strokeStyle = "#ff2b43";
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw Nodes and Labels
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

  // --- 9. EXERCISE LIBRARY ---
  function renderLibraryGrid() {
    const grid = document.getElementById("library-cards-grid");
    const searchVal = document.getElementById("lib-search-input").value.toLowerCase();
    const activeFilter = document.querySelector("#lib-category-filters .preset-pill.active").dataset.category;

    grid.innerHTML = "";
    const filtered = EXERCISE_CATALOG.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchVal) || ex.category.toLowerCase().includes(searchVal);
      const matchesCat = activeFilter === "all" || ex.category === activeFilter;
      return matchesSearch && matchesCat;
    });

    filtered.forEach(ex => {
      const card = document.createElement("div");
      card.className = "lib-card";
      card.innerHTML = `
        <span class="lib-cat-tag">${ex.category} • ${ex.split}</span>
        <h4 class="lib-title">${ex.name}</h4>
        <p class="lib-meta">Equipment: <strong>${ex.equip}</strong></p>
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