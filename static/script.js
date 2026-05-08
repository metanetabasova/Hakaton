const timerDisplay = document.getElementById("timer");
const sessionLabel = document.getElementById("session-label");
const sessionCount = document.getElementById("session-count");
const progressBar = document.getElementById("progress-bar");
const celebration = document.getElementById("celebration");
const completion = document.getElementById("completion");
const confetti = document.getElementById("confetti");
const hint = document.getElementById("hint");
const taskInput = document.getElementById("task-input");
const taskDisplay = document.getElementById("task-display");
const workInput = document.getElementById("work-duration");
const shortBreakInput = document.getElementById("short-break-duration");
const longBreakInput = document.getElementById("long-break-duration");
const subjectNameInput = document.getElementById("subject-name");
const subjectSessionsInput = document.getElementById("subject-sessions");
const subjectWorkInput = document.getElementById("subject-work");
const subjectShortInput = document.getElementById("subject-short");
const subjectLongInput = document.getElementById("subject-long");
const addSubjectBtn = document.getElementById("add-subject");
const subjectList = document.getElementById("subject-list");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const muteBtn = document.getElementById("mute-btn");
const themeToggle = document.getElementById("theme-toggle");
const shortBreakBtn = document.getElementById("short-break-btn");
const longBreakBtn = document.getElementById("long-break-btn");
const alarm = document.getElementById("alarm");

const baseTitle = "Minimalist Pomodoro Timer";
const cyclesUntilLongBreak = 4;
const storageKey = "pomodoroDurations";
const taskStorageKey = "pomodoroTask";
const themeStorageKey = "pomodoroTheme";
const plannerStorageKey = "pomodoroPlanner";

let focusDuration = 25 * 60;
let shortBreakDuration = 5 * 60;
let longBreakDuration = 15 * 60;
let timer = focusDuration;
let totalDuration = focusDuration;
let isRunning = false;
let isFocus = true;
let intervalId = null;
let completedFocusSessions = 0;
let currentBreakType = "short";
let isMuted = false;
let isDarkMode = false;
let targetSessions = cyclesUntilLongBreak;
let subjects = [];
let activeSubjectId = null;

const formatTime = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const clampMinutes = (value, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return min;
  }
  return Math.min(Math.max(parsed, min), max);
};

const clampSessions = (value) => clampMinutes(value, 1, 12);

const minutesToSeconds = (minutes) => Math.max(1, minutes) * 60;

const getSessionNumber = () => {
  const nextSession = isFocus ? completedFocusSessions + 1 : completedFocusSessions;
  return Math.min(nextSession, targetSessions);
};

const getSessionLabel = () =>
  isFocus ? "Work Time" : currentBreakType === "long" ? "Long Break" : "Short Break";

const updateProgress = () => {
  const percent = Math.max(0, Math.min(100, (timer / totalDuration) * 100));
  progressBar.style.width = `${percent}%`;
};

const updateHint = () => {
  hint.textContent = `${workInput.value} minutes work · ${shortBreakInput.value} minutes short break · ${longBreakInput.value} minutes long break`;
};

const updateTaskDisplay = () => {
  const task = taskInput.value.trim();
  taskDisplay.textContent = task ? `Current Task: ${task}` : "Current Task: —";
};

const updateDisplay = () => {
  const sessionText = getSessionLabel();
  timerDisplay.textContent = formatTime(timer);
  sessionLabel.textContent = sessionText;
  sessionCount.textContent = `Session ${getSessionNumber()} of ${targetSessions}`;
  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  document.title = `${formatTime(timer)} · ${sessionText}`;
  document.body.classList.toggle("work", isFocus);
  document.body.classList.toggle("break", !isFocus);
  updateProgress();
  updateHint();
  updateTaskDisplay();
};

const playAlarm = () => {
  if (isMuted) {
    return;
  }
  alarm.currentTime = 0;
  alarm.play();
};

const createConfetti = () => {
  confetti.innerHTML = "";
  const colors = ["#f5a623", "#50e3c2", "#9013fe", "#f8e71c", "#4a90e2"];

  for (let i = 0; i < 26; i += 1) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    piece.style.animationDuration = `${1.6 + Math.random()}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.appendChild(piece);
  }

  setTimeout(() => {
    confetti.innerHTML = "";
  }, 2300);
};

const triggerCelebration = () => {
  celebration.classList.add("show");
  createConfetti();
  setTimeout(() => {
    celebration.classList.remove("show");
  }, 2000);
};

const triggerCompletion = () => {
  completion.classList.add("show");
  setTimeout(() => {
    completion.classList.remove("show");
  }, 2800);
};

const saveDurations = (workMinutes, shortMinutes, longMinutes) => {
  localStorage.setItem(
    storageKey,
    JSON.stringify({ workMinutes, shortMinutes, longMinutes })
  );
};

const loadDurations = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (!stored) {
      return;
    }
    if (stored.workMinutes) {
      workInput.value = stored.workMinutes;
    }
    if (stored.shortMinutes) {
      shortBreakInput.value = stored.shortMinutes;
    }
    if (stored.longMinutes) {
      longBreakInput.value = stored.longMinutes;
    }
  } catch {
    // Ignore malformed stored data.
  }
};

const savePlanner = () => {
  localStorage.setItem(plannerStorageKey, JSON.stringify(subjects));
};

const loadPlanner = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(plannerStorageKey));
    if (Array.isArray(stored)) {
      subjects = stored;
    }
  } catch {
    // Ignore malformed stored data.
  }
};

const saveTask = (task) => {
  localStorage.setItem(taskStorageKey, task);
};

const loadTask = () => {
  const storedTask = localStorage.getItem(taskStorageKey);
  if (storedTask) {
    taskInput.value = storedTask;
  }
};

const applyTheme = () => {
  document.body.classList.toggle("dark", isDarkMode);
  themeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
  localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light");
};

const loadTheme = () => {
  const storedTheme = localStorage.getItem(themeStorageKey);
  if (storedTheme === "dark") {
    isDarkMode = true;
  }
};

const applyDurations = ({ resetTimer = true } = {}) => {
  const workMinutes = clampMinutes(workInput.value, 1, 120);
  const shortMinutes = clampMinutes(shortBreakInput.value, 1, 60);
  const longMinutes = clampMinutes(longBreakInput.value, 1, 90);

  workInput.value = workMinutes;
  shortBreakInput.value = shortMinutes;
  longBreakInput.value = longMinutes;

  focusDuration = minutesToSeconds(workMinutes);
  shortBreakDuration = minutesToSeconds(shortMinutes);
  longBreakDuration = minutesToSeconds(longMinutes);

  if (resetTimer) {
    if (isFocus) {
      totalDuration = focusDuration;
    } else {
      totalDuration = currentBreakType === "long" ? longBreakDuration : shortBreakDuration;
    }
    timer = totalDuration;
  }

  saveDurations(workMinutes, shortMinutes, longMinutes);
  updateDisplay();
};

const setActiveSubject = (subjectId) => {
  activeSubjectId = subjectId;
  subjectList.querySelectorAll(".subject-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.id === subjectId);
  });
};

const applySubject = (subject) => {
  workInput.value = subject.workMinutes;
  shortBreakInput.value = subject.shortMinutes;
  longBreakInput.value = subject.longMinutes;
  targetSessions = subject.sessions;
  completedFocusSessions = 0;
  isFocus = true;
  currentBreakType = "short";
  applyDurations();
};

const renderSubjects = () => {
  subjectList.innerHTML = "";
  subjects.forEach((subject) => {
    const item = document.createElement("li");
    item.classList.add("subject-item");
    item.dataset.id = subject.id;
    item.innerHTML = `
      <strong>${subject.name}</strong>
      <span class="subject-meta">${subject.sessions} sessions · ${subject.workMinutes} / ${subject.shortMinutes} / ${subject.longMinutes} min</span>
    `;
    item.addEventListener("click", () => {
      setActiveSubject(subject.id);
      applySubject(subject);
    });
    subjectList.appendChild(item);
  });
  if (activeSubjectId) {
    setActiveSubject(activeSubjectId);
  }
};

const addSubject = () => {
  const name = subjectNameInput.value.trim();
  if (!name) {
    subjectNameInput.focus();
    return;
  }

  const sessions = clampSessions(subjectSessionsInput.value);
  const workMinutes = clampMinutes(subjectWorkInput.value, 1, 120);
  const shortMinutes = clampMinutes(subjectShortInput.value, 1, 60);
  const longMinutes = clampMinutes(subjectLongInput.value, 1, 90);

  subjectSessionsInput.value = sessions;
  subjectWorkInput.value = workMinutes;
  subjectShortInput.value = shortMinutes;
  subjectLongInput.value = longMinutes;

  const subject = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    sessions,
    workMinutes,
    shortMinutes,
    longMinutes,
  };

  subjects.unshift(subject);
  savePlanner();
  renderSubjects();
  setActiveSubject(subject.id);
  applySubject(subject);
  subjectNameInput.value = "";
};

const handleSessionEnd = () => {
  if (isFocus) {
    completedFocusSessions += 1;
    triggerCelebration();

    if (completedFocusSessions >= targetSessions) {
      clearInterval(intervalId);
      isRunning = false;
      startBtn.textContent = "Start";
      triggerCompletion();
      updateDisplay();
      return;
    }

    const isLongBreak = completedFocusSessions % cyclesUntilLongBreak === 0;
    currentBreakType = isLongBreak ? "long" : "short";
    totalDuration = isLongBreak ? longBreakDuration : shortBreakDuration;
    timer = totalDuration;
    isFocus = false;
  } else {
    totalDuration = focusDuration;
    timer = totalDuration;
    isFocus = true;
  }

  playAlarm();
  updateDisplay();
};

const startTimer = () => {
  if (isRunning) {
    clearInterval(intervalId);
    isRunning = false;
    startBtn.textContent = "Start";
    return;
  }

  isRunning = true;
  startBtn.textContent = "Pause";

  intervalId = setInterval(() => {
    if (timer > 0) {
      timer -= 1;
      updateDisplay();
    } else {
      handleSessionEnd();
    }
  }, 1000);
};

const resetTimer = () => {
  clearInterval(intervalId);
  isRunning = false;
  isFocus = true;
  totalDuration = focusDuration;
  timer = totalDuration;
  completedFocusSessions = 0;
  currentBreakType = "short";
  startBtn.textContent = "Start";
  updateDisplay();
};

const setBreak = (duration, breakType) => {
  clearInterval(intervalId);
  isRunning = false;
  isFocus = false;
  currentBreakType = breakType;
  totalDuration = duration;
  timer = totalDuration;
  startBtn.textContent = "Start";
  updateDisplay();
};

const toggleMute = () => {
  isMuted = !isMuted;
  updateDisplay();
};

const toggleTheme = () => {
  isDarkMode = !isDarkMode;
  applyTheme();
};

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);
muteBtn.addEventListener("click", toggleMute);
themeToggle.addEventListener("click", toggleTheme);
shortBreakBtn.addEventListener("click", () => setBreak(shortBreakDuration, "short"));
longBreakBtn.addEventListener("click", () => setBreak(longBreakDuration, "long"));
workInput.addEventListener("input", () => applyDurations());
shortBreakInput.addEventListener("input", () => applyDurations());
longBreakInput.addEventListener("input", () => applyDurations());
addSubjectBtn.addEventListener("click", addSubject);

taskInput.addEventListener("input", () => {
  saveTask(taskInput.value.trim());
  updateDisplay();
});

loadPlanner();
renderSubjects();
loadDurations();
loadTask();
loadTheme();
applyDurations({ resetTimer: false });
applyTheme();
document.title = baseTitle;
updateDisplay();
