const timerDisplay = document.getElementById("timer");
const sessionLabel = document.getElementById("session-label");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const shortBreakBtn = document.getElementById("short-break-btn");
const longBreakBtn = document.getElementById("long-break-btn");
const alarm = document.getElementById("alarm");

const focusDuration = 25 * 60;
const shortBreakDuration = 5 * 60;
const longBreakDuration = 15 * 60;

let timer = focusDuration;
let isRunning = false;
let isFocus = true;
let intervalId = null;

const formatTime = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const updateDisplay = () => {
  timerDisplay.textContent = formatTime(timer);
  sessionLabel.textContent = isFocus ? "Work" : "Break";
  document.body.classList.toggle("work", isFocus);
  document.body.classList.toggle("break", !isFocus);
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
      isFocus = !isFocus;
      timer = isFocus ? focusDuration : shortBreakDuration;
      alarm.currentTime = 0;
      alarm.play();
      updateDisplay();
    }
  }, 1000);
};

const resetTimer = () => {
  clearInterval(intervalId);
  isRunning = false;
  isFocus = true;
  timer = focusDuration;
  startBtn.textContent = "Start";
  updateDisplay();
};

const setBreak = (duration) => {
  clearInterval(intervalId);
  isRunning = false;
  isFocus = false;
  timer = duration;
  startBtn.textContent = "Start";
  updateDisplay();
};

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);
shortBreakBtn.addEventListener("click", () => setBreak(shortBreakDuration));
longBreakBtn.addEventListener("click", () => setBreak(longBreakDuration));

updateDisplay();
