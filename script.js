let balance = 10000;
let multiplier = 1.00;
let crashPoint = 2.00;

let running = false;
let waiting = true;

let betPlaced = false;
let cashedOut = false;
let betAmount = 0;

let animationTimer = null;
let cancelTimer = null;
let countdownTimer = null;

let soundOn = true;
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
let graphProgress = 0;


/* ELEMENTS */

const balanceEl = document.getElementById("balance");
const multiplierEl = document.getElementById("multiplier");
const statusEl = document.getElementById("status");
const historyEl = document.getElementById("history");

const planeEl = document.getElementById("plane");
const blueLine = document.getElementById("blueLine");
const redLine = document.getElementById("redLine");
const crashEffect = document.getElementById("crashEffect");

const betAmountEl = document.getElementById("betAmount");
const betBtn = document.getElementById("betBtn");
const cashBtn = document.getElementById("cashBtn");
const cancelBtn = document.getElementById("cancelBtn");
const bonusBtn = document.getElementById("bonusBtn");
const soundBtn = document.getElementById("soundBtn");


/* BALANCE */

function updateBalance() {
    balanceEl.textContent = balance.toFixed(2);
}


/* CRASH POINT */

function generateCrashPoint() {

    const r = Math.random();

    if (r < 0.20) {
        return +(1.01 + Math.random() * 1.40).toFixed(2);
    }

    if (r < 0.55) {
        return +(1.50 + Math.random() * 3.50).toFixed(2);
    }

    if (r < 0.82) {
        return +(3 + Math.random() * 8).toFixed(2);
    }

    if (r < 0.96) {
        return +(8 + Math.random() * 35).toFixed(2);
    }

    if (r < 0.995) {
        return +(30 + Math.random() * 70).toFixed(2);
    }

    return +(100 + Math.random() * 200).toFixed(2);
}


/* MULTIPLIER */

function updateMultiplierColor() {

    multiplierEl.classList.remove(
        "red",
        "orange",
        "green"
    );

    if (multiplier < 3) {
        multiplierEl.classList.add("red");
    }
    else if (multiplier < 10) {
        multiplierEl.classList.add("orange");
    }
    else {
        multiplierEl.classList.add("green");
    }
}


function updateMultiplier() {

    multiplierEl.textContent =
        multiplier.toFixed(2) + "x";

    updateMultiplierColor();
}


/* GRAPH */

function resetGraph() {

    graphProgress = 0;

    blueLine.setAttribute(
        "points",
        "20,560 70,545"
    );

    redLine.setAttribute(
        "points",
        "20,560 70,545"
    );

    planeEl.style.left = "7%";
    planeEl.style.bottom = "6%";

    planeEl.classList.remove("flying");
}


function drawFlight() {

    graphProgress += 0.004;

    const limited =
        Math.min(graphProgress, 1);

    const x =
        40 + limited * 570;

    const y =
        555 -
        Math.pow(limited, 1.25) * 330;

    const pointString =
        "20,560 " + x + "," + y;

    blueLine.setAttribute(
        "points",
        pointString
    );

    redLine.setAttribute(
        "points",
        pointString
    );

    const screenX =
        Math.min(
            62,
            7 + limited * 55
        );

    const screenBottom =
        Math.min(
            40,
            6 + limited * 34
        );

    planeEl.style.left =
        screenX + "%";

    planeEl.style.bottom =
        screenBottom + "%";

    if (limited >= 0.20) {
        planeEl.classList.add("flying");
    }
}


/* HISTORY */

function addHistory(value) {

    const item =
        document.createElement("span");

    item.className =
        "history-item";

    if (value < 3) {
        item.classList.add("history-red");
    }
    else if (value < 10) {
        item.classList.add("history-orange");
    }
    else {
        item.classList.add("history-green");
    }

    item.textContent =
        value.toFixed(2) + "x";

    historyEl.prepend(item);

    while (historyEl.children.length > 10) {

        historyEl.removeChild(
            historyEl.lastChild
        );
    }
}


/* SOUND */

function startAudio() {

    if (!soundOn)
        return;

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }

    if (
        audioContext.state ===
        "suspended"
    ) {
        audioContext.resume();
    }
}


function playMusicNote() {

    if (!soundOn)
        return;

    startAudio();

    if (!audioContext)
        return;

    const notes = [
        261.63,
        329.63,
        392.00,
        523.25,
        392.00,
        329.63,
        293.66,
        392.00
    ];

    const frequency =
        notes[musicStep % notes.length];

    musicStep++;

    const osc =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    osc.type = "triangle";

    osc.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );

    gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.035,
        audioContext.currentTime + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.28
    );

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();

    osc.stop(
        audioContext.currentTime + 0.30
    );
}


function startMusic() {

    if (!soundOn)
        return;

    startAudio();

    stopMusic();

    musicStep = 0;

    playMusicNote();

    musicTimer =
        setInterval(() => {

            if (running && soundOn) {
                playMusicNote();
            }

        }, 350);
}


function stopMusic() {

    if (musicTimer) {

        clearInterval(
            musicTimer
        );

        musicTimer = null;
    }
}


/* CRASH SOUND */

function crashSound() {

    if (!soundOn)
        return;

    startAudio();

    if (!audioContext)
        return;

    const boom =
        audioContext.createOscillator();

    const boomGain =
        audioContext.createGain();

    boom.type = "sawtooth";

    boom.frequency.setValueAtTime(
        120,
        audioContext.currentTime
    );

    boom.frequency.exponentialRampToValueAtTime(
        25,
        audioContext.currentTime + 0.8
    );

    boomGain.gain.setValueAtTime(
        0.45,
        audioContext.currentTime
    );

    boomGain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.85
    );

    boom.connect(boomGain);
    boomGain.connect(
        audioContext.destination
    );

    boom.start();

    boom.stop(
        audioContext.currentTime + 0.9
    );
}


/* BET TEXT */

function updateBetText() {

    const amount =
        Number(betAmountEl.value) || 0;

    betBtn.textContent =
        "💚 BET ₹" +
        amount.toFixed(2);
}


/* BET */

function placeBet() {

    if (!waiting)
        return;

    if (betPlaced)
        return;

    const amount =
        Number(betAmountEl.value);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        statusEl.textContent =
            "ENTER BET AMOUNT";

        return;
    }

    if (amount > balance) {

        statusEl.textContent =
            "NOT ENOUGH VIRTUAL COINS";

        return;
    }

    balance -= amount;

    betAmount = amount;
    betPlaced = true;
    cashedOut = false;

    updateBalance();

    betBtn.disabled = true;
    cashBtn.disabled = true;
    cancelBtn.disabled = false;

    let seconds = 5;

    cancelBtn.textContent =
        "CANCEL BET (" +
        seconds +
        ")";

    clearInterval(cancelTimer);

    cancelTimer =
        setInterval(() => {

            seconds--;

            cancelBtn.textContent =
                "CANCEL BET (" +
                seconds +
                ")";

            if (seconds <= 0) {

                clearInterval(
                    cancelTimer
                );

                cancelBtn.disabled = true;

                cancelBtn.textContent =
                    "CANCEL CLOSED";
            }

        }, 1000);

    statusEl.textContent =
        "BET PLACED • WAITING...";

    startAudio();
}


/* CANCEL */

function cancelBet() {

    if (!betPlaced)
        return;

    clearInterval(cancelTimer);

    balance += betAmount;

    betAmount = 0;
    betPlaced = false;
    cashedOut = false;

    updateBalance();

    betBtn.disabled = false;
    cashBtn.disabled = true;
    cancelBtn.disabled = true;

    cancelBtn.textContent =
        "CANCEL BET";

    statusEl.textContent =
        "BET CANCELLED";
}


/* CASH OUT */

function cashOut() {

    if (!running)
        return;

    if (!betPlaced)
        return;

    if (cashedOut)
        return;

    const value =
        betAmount * multiplier;

    balance += value;

    cashedOut = true;
    betPlaced = false;

    updateBalance();

    cashBtn.textContent =
        "YOU WON ₹" +
        value.toFixed(2);

    cashBtn.disabled = true;
    cancelBtn.disabled = true;

    clearInterval(cancelTimer);

    statusEl.textContent =
        "YOU WON ₹" +
        value.toFixed(2) +
        " • " +
        multiplier.toFixed(2) +
        "x";
}


/* COUNTDOWN */

function startCountdown() {

    clearInterval(countdownTimer);
    clearInterval(animationTimer);

    stopMusic();

    running = false;
    waiting = true;

    multiplier = 1.00;

    resetGraph();
    updateMultiplier();

    betBtn.disabled =
        betPlaced;

    betAmountEl.disabled = false;
    cashBtn.disabled = true;

    let seconds = 3;

    statusEl.textContent =
        "NEXT ROUND " +
        seconds;

    countdownTimer =
        setInterval(() => {

            seconds--;

            if (seconds > 0) {

                statusEl.textContent =
                    "NEXT ROUND " +
                    seconds;
            }

            if (seconds <= 0) {

                clearInterval(
                    countdownTimer
                );

                startRound();
            }

        }, 1000);
}


/* ROUND */

function startRound() {

    clearInterval(animationTimer);

    waiting = false;
    running = true;

    multiplier = 1.00;

    crashPoint =
        generateCrashPoint();

    resetGraph();
    updateMultiplier();

    statusEl.textContent =
        "FLYING...";

    crashEffect.classList.remove(
        "show"
    );

    betBtn.disabled = true;
    betAmountEl.disabled = true;

    cashBtn.disabled =
        !betPlaced;

    startMusic();

    animationTimer =
        setInterval(() => {

            multiplier += 0.018;

            if (
                multiplier >=
                crashPoint
            ) {

                multiplier =
                    crashPoint;

                updateMultiplier();

                crashRound();

                return;
            }

            updateMultiplier();
            drawFlight();

            if (
                betPlaced &&
                !cashedOut
            ) {

                const currentValue =
                    betAmount *
                    multiplier;

                cashBtn.textContent =
                    "CASH OUT ₹" +
                    currentValue.toFixed(2);
            }

        }, 50);
}


/* CRASH */

function crashRound() {

    clearInterval(
        animationTimer
    );

    stopMusic();

    running = false;
    waiting = false;

    planeEl.classList.remove(
        "flying"
    );

    statusEl.textContent =
        "CRASH " +
        crashPoint.toFixed(2) +
        "x";

    addHistory(crashPoint);

    crashEffect.classList.add(
        "show"
    );

    crashSound();

    if (
        betPlaced &&
        !cashedOut
    ) {

        betPlaced = false;
        betAmount = 0;

        statusEl.textContent =
            "CRASH • BET LOST";
    }

    betBtn.disabled = true;
    cashBtn.disabled = true;
    cancelBtn.disabled = true;

    betAmountEl.disabled = false;

    clearInterval(cancelTimer);

    setTimeout(() => {
        startCountdown();
    }, 3000);
}


/* BONUS */

bonusBtn.addEventListener(
    "click",
    () => {

        balance += 1000;

        updateBalance();

        statusEl.textContent =
            "BONUS +₹1000 VIRTUAL COINS";

        startAudio();
    }
);


/* EVENTS */

betBtn.addEventListener(
    "click",
    placeBet
);

cashBtn.addEventListener(
    "click",
    cashOut
);

cancelBtn.addEventListener(
    "click",
    cancelBet
);

betAmountEl.addEventListener(
    "input",
    updateBetText
);


/* SOUND */

soundBtn.addEventListener(
    "click",
    () => {

        soundOn = !soundOn;

        if (soundOn) {

            soundBtn.textContent =
                "🔊 SOUND ON";

            startAudio();

            if (running) {
                startMusic();
            }

        } else {

            soundBtn.textContent =
                "🔇 SOUND OFF";

            stopMusic();
        }
    }
);


/* START */

updateBalance();
updateBetText();
resetGraph();

addHistory(1.33);
addHistory(2.89);
addHistory(4.62);

statusEl.textContent =
    "NEXT ROUND 3";

startCountdown();