// Puzzle Game
let gridSize = 3;
let puzzlePieces = [];

document.getElementById('image-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        createPuzzle(event.target.result);
    };
    reader.readAsDataURL(file);
});

document.getElementById('shuffle-button').addEventListener('click', shufflePuzzle);

function createPuzzle(imgUrl) {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    puzzlePieces = [];
    
    for(let i = 0; i < gridSize * gridSize; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.style.backgroundImage = `url(${imgUrl})`;
        piece.style.backgroundSize = `${gridSize * 100}%`;
        piece.style.backgroundPosition = 
            `${(i % gridSize) * (100 / (gridSize - 1))}% 
             ${Math.floor(i / gridSize) * (100 / (gridSize - 1))}%`;
        puzzlePieces.push(piece);
    }
    
    shufflePuzzle();
}

function shufflePuzzle() {
    const grid = document.getElementById('puzzle-grid');
    const shuffled = [...puzzlePieces].sort(() => Math.random() - 0.5);
    grid.replaceChildren(...shuffled);
}

// Timer
let timerInterval;
let remainingTime = 0;

document.getElementById('start-timer').addEventListener('click', startTimer);
document.getElementById('pause-timer').addEventListener('click', pauseTimer);
document.getElementById('reset-timer').addEventListener('click', resetTimer);

function startTimer() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    
    remainingTime = hours * 3600 + minutes * 60 + seconds;
    
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if(remainingTime <= 0) {
        clearInterval(timerInterval);
        return;
    }
    
    remainingTime--;
    
    const hrs = Math.floor(remainingTime / 3600);
    const mins = Math.floor((remainingTime % 3600) / 60);
    const secs = remainingTime % 60;
    
    document.getElementById('timer-display').textContent = 
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    remainingTime = 0;
    document.getElementById('timer-display').textContent = '00:00:00';
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
}

// Mouse Tracker
document.addEventListener('mousemove', (e) => {
    document.getElementById('mouse-tracker').textContent = 
        `X: ${e.clientX}, Y: ${e.clientY}`;
});
