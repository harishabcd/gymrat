// ==========================================================
// GYMRAT ARCHITECTURE ENGINE: PERSISTENCE, LOGS & ANALYTICS
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Movement Index & Split Configurations
  const EXERCISE_REGISTRY = [
    { name: "Barbell Bench Press", split: "push", category: "Chest", equip: "Barbell" },
    { name: "Incline Dumbbell Press", split: "push", category: "Chest", equip: "Dumbbells" },
    { name: "Standing Overhead Press", split: "push", category: "Shoulders", equip: "Barbell" },
    { name: "Cable Lateral Raises", split: "push", category: "Shoulders", equip: "Cables" },
    { name: "Triceps Rope Pushdown", split: "push", category: "Arms", equip: "Cables" },
    { name: "Barbell Deadlift", split: "pull", category: "Back", equip: "Barbell" },
    { name: "Lat Pulldown", split: "pull", category: "Back", equip: "Cable Machine" },
    { name: "Chest-Supported Row", split: "pull", category: "Back", equip: "Dumbbells" },
    { name: "Face Pulls", split: "pull", category: "Shoulders", equip: "Cables" },
    { name: "Incline Bicep Curls", split: "pull", category: "Arms", equip: "Dumbbells" },
    { name: "Barbell Back Squat", split: "legs", category: "Legs", equip: "Barbell / Rack" },
    { name: "Romanian Deadlift", split: "legs", category: "Legs", equip: "Barbell" },
    { name: "Bulgarian Split Squats", split: "legs", category: "Legs", equip: "Dumbbells" },
    { name: "Seated Leg Curls", split: "legs", category: "Legs", equip: "Machine" },
    { name: "Standing Calf Raises", split: "legs", category: "Legs", equip: "Machine / Smith" }
  ];

  // Core App State
  let activeWorkout = null;
  let workoutTimerInterval = null;
  let restTimerInterval = null;
  let restTimeRemaining = 90;
  let restTimerRunning = false;

  // Global UI Cache
  const navBrandBtn = document.getElementById("nav-brand-btn");
  const navTabs = document.querySelectorAll(".nav-tab");
  const appViews = document.querySelectorAll(".app-view");
  const navDateDisplay = document.getElementById("nav-date-display");

  // Profile Elements
  const heroUserName = document.getElementById("hero-user-name");
  const heroUserDivision = document.getElementById("hero-user-division");
  const heroTodayVol = document.getElementById("hero-today-volume");
  const heroSetsLogged = document.getElementById("hero-sets-logged");
  const heroWorkoutsDone = document.getElementById("hero-workouts-done");
  const heroStreakCount = document.getElementById("hero-streak-count");
  const progressMetricText = document.getElementById("progress-metric-text");
  const weeklyProgressFill = document.getElementById("weekly-progress-fill");
  const dashboardPrGrid = document.getElementById("dashboard-pr-grid");

  // Avatar Elements
  const avatarContainer = document.getElementById("avatar-container");
  const fileInput = document.getElementById("profile-photo-input");
  const profileImg = document.getElementById("user-profile-img");

  // Auth Elements
  const authActionBtn = document.getElementById("auth-action-btn");
  const authBtnText = document.getElementById("auth-btn-text");
  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const loginUsername = document.getElementById("login-username");
  const loginDivision = document.getElementById("login-division");

  // Chamber Elements
  const activeSessionTitle = document.getElementById("active-session-title");
  const sessionTimerDisplay = document.getElementById("session-timer-display");
  const sessionLiveVolume = document.getElementById("session-live-volume");
  const sessionLiveSets = document.getElementById("session-live-sets");
  const chamberExSelect = document.getElementById("chamber-exercise-select");
  const chamberAddExBtn = document.getElementById("chamber-add-ex-btn");
  const activeSessionExercises = document.getElementById("active-session-exercises");
  const completeSessionBtn = document.getElementById("complete-session-btn");
  const cancelSessionBtn = document.getElementById("cancel-session-btn");
  const abortSessionBottomBtn = document.getElementById("abort-session-bottom-btn");

  // Rest Timer Elements
  const timerClock = document.getElementById("timer-clock");
  const timerToggleBtn = document.getElementById("timer-toggle-btn");
  const timerResetBtn = document.getElementById("timer-reset-btn");
  const presetBtns = document.querySelectorAll(".preset-btn");

  // Summary Elements
  const summaryModal = document.getElementById("summary-modal");
  const summarySplitLabel = document.getElementById("summary-split-label");
  const summaryDurationVal = document.getElementById("summary-duration-val");
  const summaryVolumeVal = document.getElementById("summary-volume-val");
  const summarySetsVal = document.getElementById("summary-sets-val");
  const summaryExercisesVal = document.getElementById("summary-exercises-val");
  const summaryCloseBtn = document.getElementById("summary-close-btn");

  // History & Analytics
  const historyItemsContainer = document.getElementById("history-items-container");
  const historyFilterSplit = document.getElementById("history-filter-split");
  const analyticsExPicker = document.getElementById("analytics-exercise-picker");
  const chartMaxWeightVal = document.getElementById("chart-max-weight-val");
  const progressionBarsChart = document.getElementById("progression-bars-chart");

  // Library
  const librarySearch = document.getElementById("library-search");
  const libraryCategoryPills = document.querySelectorAll(".cat-pill");
  const libraryGridContainer = document.getElementById("library-grid-container");

  // Audio Context Chime
  function playAudioTone(freq, duration) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  }

  // Toast Notification System
  function showToast(msg) {
    const toastCont = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    toastCont.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- 1. Persistent Data Management ---
  function getHistory() {
    return JSON.parse(localStorage.getItem("gymrat_history") || "[]");
  }

  function saveHistory(list) {
    localStorage.setItem("gymrat_history", JSON.stringify(list));
  }

  // --- 2. Navigation Control ---
  function navigateTo(viewId) {
    appViews.forEach(v => v.style.display = "none");
    const target = document.getElementById(viewId);
    if (target) {
      target.style.display = "block";
    }

    navTabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.view === viewId);
    });

    if (viewId === "view-dashboard") renderDashboard();
    if (viewId === "view-history") renderHistory();
    if (viewId === "view-analytics") renderAnalytics();
    if (viewId === "view-library") renderLibrary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navTabs.forEach(t => t.addEventListener("click", () => navigateTo(t.dataset.view)));
  if (navBrandBtn) navBrandBtn.addEventListener("click", () => navigateTo("view-dashboard"));

  // Date Header Display
  if (navDateDisplay) {
    const d = new Date();
    navDateDisplay.textContent = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }

  // --- 3. Dynamic Dashboard Rendering ---
  function renderDashboard() {
    const history = getHistory();
    const todayStr = new Date().toDateString();

    let todayVol = 0;
    let totalSetsAllTime = 0;
    const workoutDates = new Set();

    history.forEach(w => {
      workoutDates.add(new Date(w.timestamp).toDateString());
      totalSetsAllTime += w.totalSets || 0;
      if (new Date(w.timestamp).toDateString() === todayStr) {
        todayVol += w.totalVolume || 0;
      }
    });

    heroTodayVol.innerHTML = `${todayVol.toLocaleString()} <small>kg</small>`;
    heroSetsLogged.textContent = totalSetsAllTime;
    heroWorkoutsDone.textContent = history.length;
    heroStreakCount.innerHTML = `${workoutDates.size} <small>days</small>`;

    // Weekly Target (Default 35,000 kg)
    const goalVol = parseInt(localStorage.getItem("gymrat_target_volume") || 35000);
    const pct = Math.min(100, Math.round((todayVol / goalVol) * 100));
    progressMetricText.textContent = `${todayVol.toLocaleString()} / ${goalVol.toLocaleString()} kg (${pct}%)`;
    weeklyProgressFill.style.width = `${pct}%`;

    // Calculate Personal Records (PRs)
    const prMap = {};
    history.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (!prMap[ex.name] || s.weight > prMap[ex.name].weight) {
            prMap[ex.name] = { weight: s.weight, reps: s.reps, date: new Date(w.timestamp).toLocaleDateString() };
          }
        });
      });
    });

    dashboardPrGrid.innerHTML = "";
    const prEntries = Object.entries(prMap);
    if (prEntries.length === 0) {
      dashboardPrGrid.innerHTML = `<div class="pr-card"><span class="pr-exercise">INITIAL RECS</span><div class="pr-value">No Logs Yet</div><span class="pr-date">Complete your first session</span></div>`;
    } else {
      prEntries.slice(0, 4).forEach(([name, pr]) => {
        const c = document.createElement("div");
        c.className = "pr-card";
        c.innerHTML = `
          <span class="pr-exercise">${name.toUpperCase()}</span>
          <div class="pr-value">${pr.weight} kg <small style="font-size:0.8rem; color:var(--text-dim)">× ${pr.reps}</small></div>
          <span class="pr-date">Recorded on ${pr.date}</span>
        `;
        dashboardPrGrid.appendChild(c);
      });
    }
  }

  // --- 4. Workout Session Lifecycle ---
  document.querySelectorAll(".split-card").forEach(c => {
    c.addEventListener("click", () => startWorkoutSession(c.dataset.split));
  });

  function startWorkoutSession(splitType) {
    activeWorkout = {
      split: splitType,
      startTime: Date.now(),
      exercises: []
    };

    activeSessionTitle.textContent = `${splitType.toUpperCase()} WORKOUT CHAMBER`;
    sessionLiveVolume.textContent = "0 kg";
    sessionLiveSets.textContent = "0";

    // Populate Exercise Selection
    chamberExSelect.innerHTML = "";
    EXERCISE_REGISTRY.filter(e => e.split === splitType).forEach(ex => {
      const opt = document.createElement("option");
      opt.value = ex.name;
      opt.textContent = `${ex.name} (${ex.category})`;
      chamberExSelect.appendChild(opt);
    });

    // Populate Initial Exercises
    activeSessionExercises.innerHTML = "";
    const initialMovements = EXERCISE_REGISTRY.filter(e => e.split === splitType).slice(0, 2);
    initialMovements.forEach(ex => appendExerciseBlock(ex.name));

    // Start Timer
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(updateWorkoutTimer, 1000);

    navigateTo("view-logging");
    showToast(`${splitType.toUpperCase()} session initialized.`);
  }

  function updateWorkoutTimer() {
    if (!activeWorkout) return;
    const elapsed = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    sessionTimerDisplay.textContent = `${m}:${s}`;
  }

  // Add Exercise Block
  chamberAddExBtn.addEventListener("click", () => {
    const exName = chamberExSelect.value;
    if (exName) appendExerciseBlock(exName);
  });

  function appendExerciseBlock(name) {
    const exId = `ex-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const exObj = { id: exId, name, sets: [] };
    activeWorkout.exercises.push(exObj);

    const card = document.createElement("div");
    card.className = "exercise-log-card";
    card.id = exId;
    card.innerHTML = `
      <div class="exercise-log-card-header">
        <h4 class="ex-name-title">${name}</h4>
        <button class="ex-remove-btn" data-exid="${exId}">✕ Remove</button>
      </div>
      <table class="sets-table">
        <thead>
          <tr>
            <th>SET</th>
            <th>LOAD (KG)</th>
            <th>REPS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody class="sets-tbody"></tbody>
      </table>
      <div class="add-set-row-bar">
        <button class="add-set-btn" data-exid="${exId}">+ Add Set</button>
      </div>
    `;

    activeSessionExercises.appendChild(card);
    addSetToExercise(exObj, card.querySelector(".sets-tbody"));
  }

  function addSetToExercise(exObj, tbody) {
    const setNum = exObj.sets.length + 1;
    const defaultWeight = exObj.sets.length > 0 ? exObj.sets[exObj.sets.length - 1].weight : 60;
    const defaultReps = exObj.sets.length > 0 ? exObj.sets[exObj.sets.length - 1].reps : 10;

    const setObj = { setNum, weight: defaultWeight, reps: defaultReps };
    exObj.sets.push(setObj);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>#${setNum}</strong></td>
      <td><input type="number" class="set-input-table set-weight" value="${defaultWeight}" min="1" step="0.5"></td>
      <td><input type="number" class="set-input-table set-reps" value="${defaultReps}" min="1"></td>
      <td><button class="set-action-delete">✕</button></td>
    `;

    const weightInput = tr.querySelector(".set-weight");
    const repsInput = tr.querySelector(".set-reps");
    const delBtn = tr.querySelector(".set-action-delete");

    const updateMetrics = () => {
      setObj.weight = parseFloat(weightInput.value) || 0;
      setObj.reps = parseInt(repsInput.value) || 0;
      recalculateActiveSessionTotals();
    };

    weightInput.addEventListener("input", updateMetrics);
    repsInput.addEventListener("input", updateMetrics);

    delBtn.addEventListener("click", () => {
      const idx = exObj.sets.indexOf(setObj);
      if (idx > -1) {
        exObj.sets.splice(idx, 1);
        tr.remove();
        recalculateActiveSessionTotals();
      }
    });

    tbody.appendChild(tr);
    recalculateActiveSessionTotals();
  }

  // Delegation for Sets and Exercises
  activeSessionExercises.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-set-btn")) {
      const exId = e.target.dataset.exid;
      const exObj = activeWorkout.exercises.find(x => x.id === exId);
      const tbody = document.getElementById(exId).querySelector(".sets-tbody");
      if (exObj && tbody) addSetToExercise(exObj, tbody);
    }
    if (e.target.classList.contains("ex-remove-btn")) {
      const exId = e.target.dataset.exid;
      activeWorkout.exercises = activeWorkout.exercises.filter(x => x.id !== exId);
      document.getElementById(exId).remove();
      recalculateActiveSessionTotals();
    }
  });

  function recalculateActiveSessionTotals() {
    let totVol = 0;
    let totSets = 0;

    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        totVol += (s.weight * s.reps);
        totSets++;
      });
    });

    sessionLiveVolume.textContent = `${totVol.toLocaleString()} kg`;
    sessionLiveSets.textContent = totSets;
  }

  // Cancel & Finish Workout Handlers
  function cancelWorkout() {
    if (confirm("Cancel and discard current workout?")) {
      clearInterval(workoutTimerInterval);
      activeWorkout = null;
      navigateTo("view-dashboard");
      showToast("Workout session discarded.");
    }
  }

  cancelSessionBtn.addEventListener("click", cancelWorkout);
  abortSessionBottomBtn.addEventListener("click", cancelWorkout);

  completeSessionBtn.addEventListener("click", () => {
    let totalVol = 0;
    let totalSets = 0;

    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        totalVol += (s.weight * s.reps);
        totalSets++;
      });
    });

    if (totalSets === 0) {
      showToast("Cannot save empty workout. Add sets first.");
      return;
    }

    clearInterval(workoutTimerInterval);
    const durationMins = Math.max(1, Math.floor((Date.now() - activeWorkout.startTime) / 60000));
    
    const record = {
      id: `w-${Date.now()}`,
      split: activeWorkout.split,
      timestamp: Date.now(),
      duration: durationMins,
      totalVolume: totalVol,
      totalSets: totalSets,
      exercises: activeWorkout.exercises
    };

    const history = getHistory();
    history.unshift(record);
    saveHistory(history);

    // Display Summary
    summarySplitLabel.textContent = `${activeWorkout.split.toUpperCase()} Routine Completed`;
    summaryDurationVal.textContent = `${durationMins} min`;
    summaryVolumeVal.textContent = `${totalVol.toLocaleString()} kg`;
    summarySetsVal.textContent = totalSets;
    summaryExercisesVal.textContent = activeWorkout.exercises.length;
    summaryModal.style.display = "flex";

    activeWorkout = null;
    playAudioTone(587.33, 0.4); // D5 chime
  });

  summaryCloseBtn.addEventListener("click", () => {
    summaryModal.style.display = "none";
    navigateTo("view-dashboard");
  });

  // --- 5. Built-in Rest Timer ---
  function updateRestClock() {
    const m = String(Math.floor(restTimeRemaining / 60)).padStart(2, '0');
    const s = String(restTimeRemaining % 60).padStart(2, '0');
    timerClock.textContent = `${m}:${s}`;
  }

  presetBtns.forEach(b => {
    b.addEventListener("click", () => {
      presetBtns.forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      restTimeRemaining = parseInt(b.dataset.time);
      updateRestClock();
      if (restTimerRunning) {
        clearInterval(restTimerInterval);
        startRestTimer();
      }
    });
  });

  function startRestTimer() {
    restTimerRunning = true;
    timerToggleBtn.textContent = "Pause";
    restTimerInterval = setInterval(() => {
      if (restTimeRemaining > 0) {
        restTimeRemaining--;
        updateRestClock();
      } else {
        clearInterval(restTimerInterval);
        restTimerRunning = false;
        timerToggleBtn.textContent = "Start";
        playAudioTone(880, 0.5); // A5 chime
        showToast("Rest time complete. Start your next set!");
      }
    }, 1000);
  }

  timerToggleBtn.addEventListener("click", () => {
    if (restTimerRunning) {
      clearInterval(restTimerInterval);
      restTimerRunning = false;
      timerToggleBtn.textContent = "Resume";
    } else {
      startRestTimer();
    }
  });

  timerResetBtn.addEventListener("click", () => {
    clearInterval(restTimerInterval);
    restTimerRunning = false;
    timerToggleBtn.textContent = "Start";
    const activePreset = document.querySelector(".preset-btn.active");
    restTimeRemaining = activePreset ? parseInt(activePreset.dataset.time) : 90;
    updateRestClock();
  });

  // --- 6. Workout History Rendering ---
  function renderHistory() {
    const history = getHistory();
    const filter = historyFilterSplit.value;
    historyItemsContainer.innerHTML = "";

    const filtered = filter === "all" ? history : history.filter(w => w.split === filter);

    if (filtered.length === 0) {
      historyItemsContainer.innerHTML = `<div class="history-item-row"><div class="history-item-left"><div class="hist-split">No workouts on record.</div><div class="hist-date">Complete workouts to see them logged here.</div></div></div>`;
      return;
    }

    filtered.forEach(w => {
      const item = document.createElement("div");
      item.className = "history-item-row";
      item.innerHTML = `
        <div class="history-item-left">
          <div class="hist-split">${w.split.toUpperCase()} WORKOUT</div>
          <div class="hist-date">${new Date(w.timestamp).toLocaleDateString()} • ${w.duration} min</div>
        </div>
        <div class="history-item-right">
          <div class="hist-vol">${w.totalVolume.toLocaleString()} kg</div>
          <div class="hist-details">${w.totalSets} sets • ${w.exercises.length} movements</div>
        </div>
      `;
      historyItemsContainer.appendChild(item);
    });
  }

  historyFilterSplit.addEventListener("change", renderHistory);

  // --- 7. Analytics & Progression Chart ---
  function renderAnalytics() {
    const history = getHistory();
    analyticsExPicker.innerHTML = "";

    EXERCISE_REGISTRY.forEach(ex => {
      const opt = document.createElement("option");
      opt.value = ex.name;
      opt.textContent = ex.name;
      analyticsExPicker.appendChild(opt);
    });

    drawProgressionChart(analyticsExPicker.value);
  }

  analyticsExPicker.addEventListener("change", () => drawProgressionChart(analyticsExPicker.value));

  function drawProgressionChart(exerciseName) {
    const history = getHistory().slice().reverse();
    const dataPoints = [];

    history.forEach(w => {
      const match = w.exercises.find(e => e.name === exerciseName);
      if (match && match.sets.length > 0) {
        const topWeight = Math.max(...match.sets.map(s => s.weight));
        dataPoints.push({
          date: new Date(w.timestamp).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
          weight: topWeight
        });
      }
    });

    progressionBarsChart.innerHTML = "";
    if (dataPoints.length === 0) {
      chartMaxWeightVal.textContent = "0 kg";
      progressionBarsChart.innerHTML = `<div style="color:var(--text-muted); padding: 40px; width: 100%; text-align: center;">No data recorded for ${exerciseName} yet.</div>`;
      return;
    }

    const maxWeight = Math.max(...dataPoints.map(d => d.weight));
    chartMaxWeightVal.textContent = `${maxWeight} kg`;

    dataPoints.slice(-7).forEach(dp => {
      const col = document.createElement("div");
      col.className = "bar-column";
      const heightPct = Math.max(10, Math.round((dp.weight / maxWeight) * 100));
      col.innerHTML = `
        <div class="bar-fill" style="height: ${heightPct}%;" title="${dp.weight} kg"></div>
        <span class="bar-date-label">${dp.date}</span>
      `;
      progressionBarsChart.appendChild(col);
    });
  }

  // --- 8. Exercise Library ---
  function renderLibrary() {
    const search = librarySearch.value.toLowerCase();
    const activeCatBtn = document.querySelector(".cat-pill.active");
    const activeCat = activeCatBtn ? activeCatBtn.dataset.cat : "all";

    libraryGridContainer.innerHTML = "";
    const filtered = EXERCISE_REGISTRY.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(search) || ex.category.toLowerCase().includes(search);
      const matchesCat = activeCat === "all" || ex.category === activeCat;
      return matchesSearch && matchesCat;
    });

    filtered.forEach(ex => {
      const c = document.createElement("div");
      c.className = "movement-card";
      c.innerHTML = `
        <span class="m-target">${ex.category} • ${ex.split}</span>
        <h4 class="m-title">${ex.name}</h4>
        <p class="m-equip">Equipment: ${ex.equip}</p>
      `;
      libraryGridContainer.appendChild(c);
    });
  }

  librarySearch.addEventListener("input", renderLibrary);
  libraryCategoryPills.forEach(p => {
    p.addEventListener("click", () => {
      libraryCategoryPills.forEach(pill => pill.classList.remove("active"));
      p.classList.add("active");
      renderLibrary();
    });
  });

  // --- 9. Avatar Upload Persistence ---
  const savedAvatar = localStorage.getItem("gymrat_avatar_url");
  if (savedAvatar) {
    profileImg.src = savedAvatar;
    profileImg.classList.add("has-image");
  }

  if (avatarContainer && fileInput) {
    avatarContainer.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          profileImg.src = event.target.result;
          profileImg.classList.add("has-image");
          localStorage.setItem("gymrat_avatar_url", event.target.result);
          showToast("Profile avatar saved.");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- 10. Authentication Handling ---
  function syncAuthState() {
    const name = localStorage.getItem("gymrat_username") || "HARISH";
    const div = localStorage.getItem("gymrat_division") || "GYMRAT DIVISION";
    heroUserName.textContent = name.toUpperCase();
    heroUserDivision.textContent = `/ ${div}`;
  }

  authActionBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem("gymrat_username", loginUsername.value.trim());
    localStorage.setItem("gymrat_division", loginDivision.value);
    syncAuthState();
    loginModal.style.display = "none";
    showToast("Profile credentials synchronized.");
  });

  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.style.display = "none";
  });

  // Initialize
  syncAuthState();
  renderDashboard();
});