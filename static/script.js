const timerDisplay = document.getElementById("timer");
const sessionLabel = document.getElementById("session-label");
const sessionCount = document.getElementById("session-count");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const muteBtn = document.getElementById("mute-btn");
const shortBreakBtn = document.getElementById("short-break-btn");
const longBreakBtn = document.getElementById("long-break-btn");
const alarm = document.getElementById("alarm");

const baseTitle = "Minimalist Pomodoro Timer";
const focusDuration = 25 * 60;
const shortBreakDuration = 5 * 60;
const longBreakDuration = 15 * 60;
const cyclesUntilLongBreak = 4;

let timer = focusDuration;
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

const getSessionNumber = () => {
  const completedInCycle = completedFocusSessions % cyclesUntilLongBreak;
  if (isFocus) {
    return completedInCycle + 1;
  }
  return completedInCycle === 0 ? cyclesUntilLongBreak : completedInCycle;
};

const getSessionLabel = () =>
  isFocus ? "Work Time" : currentBreakType === "long" ? "Long Break" : "Short Break";

const updateDisplay = () => {
  const sessionText = getSessionLabel();
  timerDisplay.textContent = formatTime(timer);
  sessionLabel.textContent = sessionText;
  sessionCount.textContent = `Session ${getSessionNumber()} of ${cyclesUntilLongBreak}`;
  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  document.title = `${formatTime(timer)} · ${sessionText}`;
  document.body.classList.toggle("work", isFocus);
  document.body.classList.toggle("break", !isFocus);
};

const playAlarm = () => {
  if (isMuted) {
    return;
  }
  alarm.currentTime = 0;
  alarm.play();
};

const handleSessionEnd = () => {
  if (isFocus) {
    completedFocusSessions += 1;
    const isLongBreak = completedFocusSessions % cyclesUntilLongBreak === 0;
    currentBreakType = isLongBreak ? "long" : "short";
    timer = isLongBreak ? longBreakDuration : shortBreakDuration;
    isFocus = false;
  } else {
    timer = focusDuration;
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
  timer = focusDuration;
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
  timer = duration;
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

document.title = baseTitle;
updateDisplay();
