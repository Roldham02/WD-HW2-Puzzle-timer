let gridSize = 3;
let puzzlePieces = [];
let emptyPosition = { row: gridSize - 1, col: gridSize - 1 };

document.getElementById('grid-size-select').addEventListener('change', function (e) {
    gridSize = parseInt(e.target.value);
    if (document.getElementById('image-upload').files.length > 0) {
        const file = document.getElementById('image-upload').files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            createPuzzle(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

function createPuzzle(imgUrl) {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    puzzlePieces = [];
    emptyPosition = { row: gridSize - 1, col: gridSize - 1 };

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url(${imgUrl})`;
            piece.style.backgroundSize = `${gridSize * 100}%`;
            piece.style.backgroundPosition = `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`;
            piece.dataset.row = row;
            piece.dataset.col = col;

            if (row === gridSize - 1 && col === gridSize - 1) {
                piece.classList.add('empty');
            } else {
                piece.draggable = true;
                piece.addEventListener('dragstart', dragStart);
            }

            puzzlePieces.push(piece);
            grid.appendChild(piece);
        }
    }
    grid.addEventListener('dragover', dragOver);
    grid.addEventListener('drop', drop);
}

function shufflePuzzle() {
    const grid = document.getElementById('puzzle-grid');
    const pieces = Array.from(grid.children);
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        grid.appendChild(pieces[j]);
    }
    updatePuzzlePieces();
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.row + ',' + e.target.dataset.col);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const [draggedRow, draggedCol] = e.dataTransfer.getData('text').split(',').map(Number);
    const targetElement = e.target.closest('.puzzle-piece');
    if (!targetElement) return;

    const targetRow = parseInt(targetElement.dataset.row);
    const targetCol = parseInt(targetElement.dataset.col);

    if (isValidMove(draggedRow, draggedCol, targetRow, targetCol)) {
        swapPieces(draggedRow, draggedCol, targetRow, targetCol);
        updatePuzzlePieces();
        checkWinCondition();
    }
}

function isValidMove(draggedRow, draggedCol, targetRow, targetCol) {
    return Math.abs(draggedRow - targetRow) + Math.abs(draggedCol - targetCol) === 1 &&
           (targetRow === emptyPosition.row && targetCol === emptyPosition.col);
}

function swapPieces(row1, col1, row2, col2) {
    const index1 = row1 * gridSize + col1;
    const index2 = row2 * gridSize + col2;
    const temp = puzzlePieces[index1];
    puzzlePieces[index1] = puzzlePieces[index2];
    puzzlePieces[index2] = temp;

    puzzlePieces[index1].dataset.row = row1;
    puzzlePieces[index1].dataset.col = col1;
    puzzlePieces[index2].dataset.row = row2;
    puzzlePieces[index2].dataset.col = col2;

    if (puzzlePieces[index2].classList.contains('empty')) {
        emptyPosition.row = row2;
        emptyPosition.col = col2;
    } else {
        emptyPosition.row = row1;
        emptyPosition.col = col1;
    }
}

function updatePuzzlePieces() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    puzzlePieces.forEach(piece => grid.appendChild(piece));
}

function checkWinCondition() {
    for (let i = 0; i < puzzlePieces.length; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        if (parseInt(puzzlePieces[i].dataset.row) !== row || parseInt(puzzlePieces[i].dataset.col) !== col) {
            return;
        }
    }
    alert("Puzzle solved!");
}

document.getElementById('image-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        createPuzzle(event.target.result);
    };
    reader.readAsDataURL(file);
});

document.getElementById('shuffle-button').addEventListener('click', shufflePuzzle);
