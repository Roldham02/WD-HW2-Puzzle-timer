let gridSize = 3;
let puzzlePieces = [];
let timerInterval;
let remainingTime = 0;

function createPuzzle(imgUrl) {
    const container = document.getElementById('puzzle-grid');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    puzzlePieces = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.style.backgroundImage = `url(${imgUrl})`;
        piece.style.backgroundSize = `${gridSize * 100}%`;
        piece.style.backgroundPosition = `${(i % gridSize) * (100 / (gridSize - 1))}% ${(Math.floor(i / gridSize)) * (100 / (gridSize - 1))}%`;
        piece.dataset.position = i;
        puzzlePieces.push(piece);
    }

    shufflePuzzle();
}

function shufflePuzzle() {
    const container = document.getElementById('puzzle-grid');
    const shuffledPieces = [...puzzlePieces].sort(() => Math.random() - 0.5);
    shuffledPieces.forEach(piece => container.appendChild(piece));
}

function startTimer() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;

    remainingTime = hours * 3600 + minutes * 60 + seconds;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timer-display').textContent = "Time's up!";
        return;
    }

    remainingTime--;
    const hrs = Math.floor(remainingTime / 3600);
    const mins = Math.floor((remainingTime % 3600) / 60);
    const secs = remainingTime % 60;

    document.getElementById('timer-display').textContent =
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function pauseTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('timer-display').textContent = '00:00:00';
}

document.getElementById('image-upload').addEventListener('change', function () {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        createPuzzle(fileReader.result);
    };
    fileReader.readAsDataURL(this.files[0]);
});

document.querySelector('#puzzle-container button').addEventListener('click', shufflePuzzle);
