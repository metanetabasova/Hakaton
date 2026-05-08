const timerDisplay = document.getElementById("timer");
const sessionLabel = document.getElementById("session-label");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const alarm = document.getElementById("alarm");

const focusDuration = 25 * 60;
const breakDuration = 5 * 60;

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
  sessionLabel.textContent = isFocus ? "Focus" : "Break";
};

const switchSession = () => {
  isFocus = !isFocus;
  timer = isFocus ? focusDuration : breakDuration;
  updateDisplay();
  alarm.currentTime = 0;
  alarm.play();
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
      switchSession();
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

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
