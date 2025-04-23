let gameSeq = [];
let userSeq = [];

let btns = ["red", "green", "yellow", "purple"];

let started = false;
let level = 0;
let bestScore = 0;

// Audio for game sounds
const sounds = {
    red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
    green: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
    yellow: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
    purple: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
    success: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-instant-win-2021.mp3"),
    gameOver: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-game-over-470.mp3")
};

// DOM Elements
const welcomeScreen = document.getElementById("welcome-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const levelTitle = document.getElementById("level-title");
const bestScoreElements = document.querySelectorAll("#best-score, #best-score-final");
const finalScoreElement = document.getElementById("final-score");
const helpButton = document.getElementById("help-button");
const helpModal = document.getElementById("help-modal");
const closeHelpButton = document.getElementById("close-help");

// Initialize best score from localStorage if available
if (localStorage.getItem("simonBestScore")) {
    bestScore = parseInt(localStorage.getItem("simonBestScore"));
    updateBestScoreDisplay();
}

// Event Listeners
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetAndStartGame);
helpButton.addEventListener("click", showHelp);
closeHelpButton.addEventListener("click", hideHelp);

// Setup button event listeners
let allBtns = document.querySelectorAll(".btn");
for (let btn of allBtns) {
    btn.addEventListener("click", btnPress);
}

// Switch between screens
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });
    document.getElementById(screenId).classList.add("active");
}

// Start the game
function startGame() {
    started = true;
    level = 0;
    gameSeq = [];
    userSeq = [];
    showScreen("game-screen");
    setTimeout(levelUp, 500); // Small delay before starting
}

// Reset and start the game (for restart button)
function resetAndStartGame() {
    startGame();
}

// Level up function
function levelUp() {
    userSeq = [];
    level++;
    levelTitle.innerText = `Level ${level}`;

    // Add visual feedback for level up
    if (level > 1) {
        levelTitle.classList.add("flash");
        setTimeout(() => levelTitle.classList.remove("flash"), 300);
        sounds.success.play();
    }

    // Generate and add a random button to the sequence
    let randIdx = Math.floor(Math.random() * 4);
    let randColor = btns[randIdx];
    gameSeq.push(randColor);
    
    // Only flash the new button added to the sequence
    setTimeout(() => {
        flashButton(randColor);
    }, 600);
}

// Play the entire sequence with proper timing (used when player fails and restarts)
function playSequence(sequence) {
    sequence.forEach((color, index) => {
        setTimeout(() => {
            flashButton(color);
        }, (index + 1) * 600);
    });
}

// Flash a button and play its sound
function flashButton(color) {
    let btn = document.querySelector(`#${color}`);
    gameFlash(btn);
    playSound(color);
}

// Game button flash effect
function gameFlash(btn) {
    btn.classList.add("flash");
    setTimeout(() => {
        btn.classList.remove("flash");
    }, 250);
}

// User button flash effect
function userFlash(btn) {
    btn.classList.add("userFlash");
    setTimeout(() => {
        btn.classList.remove("userFlash");
    }, 200);
}

// Play sound for a button
function playSound(color) {
    try {
        sounds[color].currentTime = 0;
        sounds[color].play().catch(err => {
            console.log("Error playing sound:", err);
            // Game continues even if sound fails
        });
    } catch (err) {
        console.log("Sound error:", err);
        // Game continues even if sound system fails
    }
}

// Check the user sequence against the game sequence
function checkSeq(idx) {
    // Check if current user input matches the corresponding position in game sequence
    if (userSeq[idx] === gameSeq[idx]) {
        // If user completed the current sequence length
        if (userSeq.length === gameSeq.length) {
            setTimeout(levelUp, 1000);
        }
    } else {
        gameOver();
    }
}

// Game over handling
function gameOver() {
    sounds.gameOver.play();
    
    // Add shake animation to game container
    document.querySelector(".game-container").classList.add("shake");
    setTimeout(() => {
        document.querySelector(".game-container").classList.remove("shake");
    }, 500);
    
    // Update best score if needed
    if (level > bestScore) {
        bestScore = level;
        localStorage.setItem("simonBestScore", bestScore);
        updateBestScoreDisplay();
    }
    
    // Update final score display
    finalScoreElement.textContent = level;
    
    // Show game over screen
    setTimeout(() => {
        showScreen("game-over-screen");
    }, 1000);
    
    // Reset game state
    reset();
}

// Button press handler
function btnPress() {
    if (!started) return;
    
    let btn = this;
    let userColor = btn.id;
    
    userFlash(btn);
    playSound(userColor);
    userSeq.push(userColor);
    
    checkSeq(userSeq.length - 1);
}

// Update best score display in all locations
function updateBestScoreDisplay() {
    bestScoreElements.forEach(element => {
        element.textContent = bestScore;
    });
}

// Reset game state
function reset() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
}

// Help modal functions
function showHelp() {
    helpModal.classList.add("visible");
    // Pause the game if it's running
    if (started) {
        started = false;
        setTimeout(() => {
            started = true;
        }, 500); // Small delay to prevent accidental clicks
    }
}

function hideHelp() {
    helpModal.classList.remove("visible");
}

// Additional event listener to close modal when clicking outside
helpModal.addEventListener("click", function(event) {
    if (event.target === helpModal) {
        hideHelp();
    }
});

// Initial setup - show welcome screen
showScreen("welcome-screen");