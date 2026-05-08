const timerDisplay = document.getElementById("timer");
const sessionLabel = document.getElementById("session-label");
const sessionCount = document.getElementById("session-count");
const progressBar = document.getElementById("progress-bar");
const hint = document.getElementById("hint");
const workInput = document.getElementById("work-duration");
const shortBreakInput = document.getElementById("short-break-duration");
const longBreakInput = document.getElementById("long-break-duration");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const muteBtn = document.getElementById("mute-btn");
const shortBreakBtn = document.getElementById("short-break-btn");
const longBreakBtn = document.getElementById("long-break-btn");
const alarm = document.getElementById("alarm");

const baseTitle = "Minimalist Pomodoro Timer";
const cyclesUntilLongBreak = 4;
const storageKey = "pomodoroDurations";

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

const minutesToSeconds = (minutes) => Math.max(1, minutes) * 60;

const getSessionNumber = () => {
  const completedInCycle = completedFocusSessions % cyclesUntilLongBreak;
  if (isFocus) {
    return completedInCycle + 1;
  }
  return completedInCycle === 0 ? cyclesUntilLongBreak : completedInCycle;
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

const updateDisplay = () => {
  const sessionText = getSessionLabel();
  timerDisplay.textContent = formatTime(timer);
  sessionLabel.textContent = sessionText;
  sessionCount.textContent = `Session ${getSessionNumber()} of ${cyclesUntilLongBreak}`;
  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  document.title = `${formatTime(timer)} · ${sessionText}`;
  document.body.classList.toggle("work", isFocus);
  document.body.classList.toggle("break", !isFocus);
  updateProgress();
  updateHint();
};

const playAlarm = () => {
  if (isMuted) {
    return;
  }
  alarm.currentTime = 0;
  alarm.play();
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

const handleSessionEnd = () => {
  if (isFocus) {
    completedFocusSessions += 1;
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

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);
muteBtn.addEventListener("click", toggleMute);
shortBreakBtn.addEventListener("click", () => setBreak(shortBreakDuration, "short"));
longBreakBtn.addEventListener("click", () => setBreak(longBreakDuration, "long"));
workInput.addEventListener("input", () => applyDurations());
shortBreakInput.addEventListener("input", () => applyDurations());
longBreakInput.addEventListener("input", () => applyDurations());

loadDurations();
applyDurations({ resetTimer: false });
document.title = baseTitle;
updateDisplay();
