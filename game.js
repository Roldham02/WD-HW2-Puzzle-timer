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
                piece.addEventListener('click', movePiece);
            }

            puzzlePieces.push(piece);
            grid.appendChild(piece);
        }
    }
}

function movePiece(e) {
    const clickedPiece = e.target;
    const clickedRow = parseInt(clickedPiece.dataset.row);
    const clickedCol = parseInt(clickedPiece.dataset.col);

    if (isValidMove(clickedRow, clickedCol)) {
        swapPieces(clickedRow, clickedCol, emptyPosition.row, emptyPosition.col);
        updatePuzzleDisplay();
        checkWinCondition();
    }
}

function isValidMove(row, col) {
    return (Math.abs(row - emptyPosition.row) + Math.abs(col - emptyPosition.col) === 1);
}

function swapPieces(row1, col1, row2, col2) {
    const index1 = row1 * gridSize + col1;
    const index2 = row2 * gridSize + col2;
    [puzzlePieces[index1], puzzlePieces[index2]] = [puzzlePieces[index2], puzzlePieces[index1]];
    
    [puzzlePieces[index1].dataset.row, puzzlePieces[index1].dataset.col] = [row1, col1];
    [puzzlePieces[index2].dataset.row, puzzlePieces[index2].dataset.col] = [row2, col2];

    emptyPosition = { row: row1, col: col1 };
}

function updatePuzzleDisplay() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    puzzlePieces.forEach(piece => grid.appendChild(piece));
}

function shufflePuzzle() {
    for (let i = 0; i < 1000; i++) {
        const validMoves = [];
        [-1, 1].forEach(diff => {
            if (emptyPosition.row + diff >= 0 && emptyPosition.row + diff < gridSize) {
                validMoves.push({row: emptyPosition.row + diff, col: emptyPosition.col});
            }
            if (emptyPosition.col + diff >= 0 && emptyPosition.col + diff < gridSize) {
                validMoves.push({row: emptyPosition.row, col: emptyPosition.col + diff});
            }
        });
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        swapPieces(randomMove.row, randomMove.col, emptyPosition.row, emptyPosition.col);
    }
    updatePuzzleDisplay();
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
