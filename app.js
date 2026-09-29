document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const avatarContainer = document.getElementById("avatar-container");
  const fileInput = document.getElementById("profile-photo-input");
  const profileImg = document.getElementById("user-profile-img");
  
  const heroUserName = document.getElementById("hero-user-name");
  const heroUserDivision = document.getElementById("hero-user-division");
  const heroTodayVol = document.getElementById("hero-today-volume");
  const heroSetsLogged = document.getElementById("hero-sets-logged");
  const heroWorkoutsDone = document.getElementById("hero-workouts-done");
  const progressMetricText = document.getElementById("progress-metric-text");
  const weeklyProgressFill = document.getElementById("weekly-progress-fill");

  const viewWorkout = document.getElementById("view-workout");
  const viewLogging = document.getElementById("view-logging");
  const sessionNameHeader = document.getElementById("active-session-name");
  const backBtn = document.getElementById("back-to-hub-btn");
  const finishBtn = document.getElementById("finish-session-btn");
  const exerciseSelect = document.getElementById("exercise-select");
  const saveSetBtn = document.getElementById("save-set-btn");
  const inputWeight = document.getElementById("input-weight");
  const inputReps = document.getElementById("input-reps");
  const sessionLogTbody = document.getElementById("session-log-tbody");

  // Auth elements
  const authActionBtn = document.getElementById("auth-action-btn");
  const authBtnText = document.getElementById("auth-btn-text");
  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const loginUsername = document.getElementById("login-username");
  const loginDivision = document.getElementById("login-division");
  const navDateDisplay = document.getElementById("nav-date-display");

  // Dynamic Date Display
  if (navDateDisplay) {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    navDateDisplay.textContent = today.toLocaleDateString('en-US', options).toUpperCase();
  }

  // Routine Presets
  const splitPresets = {
    push: [
      "Barbell Bench Press (Chest)",
      "Incline Dumbbell Press (Upper Chest)",
      "Standing Overhead Press (Shoulders)",
      "Lateral Cable Raises (Side Delts)",
      "Triceps Rope Pushdown (Triceps)"
    ],
    pull: [
      "Barbell Deadlift / Rack Pull (Posterior)",
      "Lat Pulldowns (Lats)",
      "Chest-Supported Row (Mid Back)",
      "Face Pulls (Rear Delts)",
      "Incline Dumbbell Bicep Curls (Biceps)"
    ],
    legs: [
      "Barbell Back Squats (Quads)",
      "Romanian Deadlifts (Hamstrings)",
      "Bulgarian Split Squats (Glutes/Quads)",
      "Seated Leg Curls (Hamstrings)",
      "Standing Calf Raises (Calves)"
    ]
  };

  let activeSessionData = {
    split: "",
    sets: []
  };

  const WEEKLY_GOAL_VOL = 35000;

  // --- 1. Authentication & Profile Switcher ---
  function checkAuthState() {
    const savedName = localStorage.getItem("gymrat_username");
    const savedDiv = localStorage.getItem("gymrat_division");

    if (savedName) {
      heroUserName.textContent = savedName.toUpperCase();
      heroUserDivision.textContent = `/ ${savedDiv || "GYMRAT DIVISION"}`;
      authBtnText.textContent = "Log Out";
      loginModal.style.display = "none";
    } else {
      heroUserName.textContent = "GUEST ATHLETE";
      heroUserDivision.textContent = "/ TRIAL MODE";
      authBtnText.textContent = "Log In";
    }
  }

  authActionBtn.addEventListener("click", () => {
    const loggedIn = localStorage.getItem("gymrat_username");
    if (loggedIn) {
      // Perform Logout
      localStorage.removeItem("gymrat_username");
      localStorage.removeItem("gymrat_division");
      checkAuthState();
    } else {
      // Open Login Modal
      loginModal.style.display = "flex";
    }
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = loginUsername.value.trim();
    const div = loginDivision.value;

    if (name) {
      localStorage.setItem("gymrat_username", name);
      localStorage.setItem("gymrat_division", div);
      checkAuthState();
    }
  });

  // Close modal when clicking outside card
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      loginModal.style.display = "none";
    }
  });

  // Default User Initialization
  if (!localStorage.getItem("gymrat_username")) {
    localStorage.setItem("gymrat_username", "HARISH");
    localStorage.setItem("gymrat_division", "GYMRAT DIVISION");
  }
  checkAuthState();

  // --- 2. Story Avatar Upload ---
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
          const base64Photo = event.target.result;
          profileImg.src = base64Photo;
          profileImg.classList.add("has-image");
          localStorage.setItem("gymrat_avatar_url", base64Photo);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- 3. Quick Stats & Progress Bar Calculation ---
  function updateStatsDisplay() {
    const vol = parseFloat(localStorage.getItem("gymrat_today_volume") || 0);
    const sets = parseInt(localStorage.getItem("gymrat_sets_logged") || 0);
    const workouts = parseInt(localStorage.getItem("gymrat_workouts_done") || 0);

    if (heroTodayVol) heroTodayVol.innerHTML = `${vol.toLocaleString()} <small>kg</small>`;
    if (heroSetsLogged) heroSetsLogged.textContent = sets;
    if (heroWorkoutsDone) heroWorkoutsDone.textContent = workouts;

    // Progress Bar
    const pct = Math.min(100, Math.round((vol / WEEKLY_GOAL_VOL) * 100));
    if (progressMetricText) {
      progressMetricText.textContent = `${vol.toLocaleString()} / ${WEEKLY_GOAL_VOL.toLocaleString()} kg (${pct}%)`;
    }
    if (weeklyProgressFill) {
      weeklyProgressFill.style.width = `${pct}%`;
    }
  }
  updateStatsDisplay();

  // --- 4. Split Session View Switching ---
  document.querySelectorAll(".split-card").forEach((card) => {
    card.addEventListener("click", () => {
      const splitType = card.dataset.split;
      activeSessionData.split = splitType;
      activeSessionData.sets = [];

      // Update Exercise Presets
      exerciseSelect.innerHTML = "";
      splitPresets[splitType].forEach((ex) => {
        const opt = document.createElement("option");
        opt.value = ex;
        opt.textContent = ex;
        exerciseSelect.appendChild(opt);
      });

      // Update Header
      sessionNameHeader.textContent = `${splitType.toUpperCase()} LOGGING CHAMBER`;

      // Clear Table
      sessionLogTbody.innerHTML = `<tr class="empty-row"><td colspan="5">No sets logged yet in this session.</td></tr>`;

      // Swap views
      viewWorkout.style.display = "none";
      viewLogging.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Back to Hub
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      viewLogging.style.display = "none";
      viewWorkout.style.display = "block";
    });
  }

  // --- 5. Logging Set Execution ---
  if (saveSetBtn) {
    saveSetBtn.addEventListener("click", () => {
      const weight = parseFloat(inputWeight.value);
      const reps = parseInt(inputReps.value);
      const exercise = exerciseSelect.value;

      if (!weight || !reps || weight <= 0 || reps <= 0) {
        alert("Please enter valid weight and reps values.");
        return;
      }

      const totalVol = weight * reps;
      const setNumber = activeSessionData.sets.length + 1;

      activeSessionData.sets.push({ setNumber, exercise, weight, reps, totalVol });

      if (activeSessionData.sets.length === 1) {
        sessionLogTbody.innerHTML = "";
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${setNumber}</strong></td>
        <td>${exercise}</td>
        <td>${weight} kg</td>
        <td>${reps}</td>
        <td style="color: var(--accent-crimson); font-weight:700;">+${totalVol.toLocaleString()} kg</td>
      `;
      sessionLogTbody.appendChild(tr);

      // Save incremental stats
      let currentVol = parseFloat(localStorage.getItem("gymrat_today_volume") || 0) + totalVol;
      let currentSets = parseInt(localStorage.getItem("gymrat_sets_logged") || 0) + 1;
      localStorage.setItem("gymrat_today_volume", currentVol);
      localStorage.setItem("gymrat_sets_logged", currentSets);

      updateStatsDisplay();

      // UI Feedback
      inputReps.value = "";
      saveSetBtn.textContent = "✓ Logged!";
      setTimeout(() => {
        saveSetBtn.textContent = "Log Set";
      }, 700);
    });
  }

  // --- 6. Complete Workout ---
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      if (activeSessionData.sets.length > 0) {
        let workouts = parseInt(localStorage.getItem("gymrat_workouts_done") || 0) + 1;
        localStorage.setItem("gymrat_workouts_done", workouts);
        updateStatsDisplay();
      }

      viewLogging.style.display = "none";
      viewWorkout.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});