let gridSize = 3;
let puzzlePieces = [];
let emptyPosition = { row: 0, col: 0 };

document.getElementById('grid-size-select').addEventListener('change', function(e) {
    gridSize = parseInt(e.target.value);
    if (document.getElementById('image-upload').files.length > 0) {
        const file = document.getElementById('image-upload').files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
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
            const pieceIndex = row * gridSize + col;
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url(${imgUrl})`;
            piece.style.backgroundSize = `${gridSize * 100}%`;
            piece.style.backgroundPosition = `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`;

            if (pieceIndex === gridSize * gridSize - 1) {
                piece.classList.add('empty');
            } else {
                piece.draggable = true;
                piece.dataset.row = row;
                piece.dataset.col = col;

                piece.addEventListener('dragstart', dragStart);
                piece.addEventListener('dragover', dragOver);
                piece.addEventListener('drop', dropPiece);
            }

            puzzlePieces.push(piece);
            grid.appendChild(piece);
        }
    }
    shufflePuzzle();
}

function shufflePuzzle() {
    const grid = document.getElementById('puzzle-grid');
    const shuffledPieces = [...puzzlePieces]
        .sort(() => Math.random() - 0.5)
        .filter(piece => !piece.classList.contains('empty'));

    let index = 0;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellIndex = row * gridSize + col;
            const cell = puzzlePieces[cellIndex];
            if (!cell.classList.contains('empty')) {
                const shuffledPiece = shuffledPieces[index++];
                shuffledPiece.dataset.row = row;
                shuffledPiece.dataset.col = col;
                cell.replaceWith(shuffledPiece);
                puzzlePieces[cellIndex] = shuffledPiece;
            } else {
                emptyPosition.row = row;
                emptyPosition.col = col;
            }
        }
    }
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
        row: parseInt(event.target.dataset.row),
        col: parseInt(event.target.dataset.col)
    }));
}

function dragOver(event) {
    event.preventDefault();
}

function dropPiece(event) {
    event.preventDefault();
    const draggedData = JSON.parse(event.dataTransfer.getData('text/plain'));
    const targetRow = parseInt(event.target.dataset.row);
    const targetCol = parseInt(event.target.dataset.col);

    if (isValidMove(draggedData.row, draggedData.col, targetRow, targetCol)) {
        swapPieces(draggedData.row, draggedData.col, targetRow, targetCol);
        checkWinCondition();
    }
}

function isValidMove(draggedRow, draggedCol, targetRow, targetCol) {
    return (
        Math.abs(draggedRow - targetRow) + Math.abs(draggedCol - targetCol) === 1 &&
        targetRow === emptyPosition.row &&
        targetCol === emptyPosition.col
    );
}

function swapPieces(draggedRow, draggedCol, targetRow, targetCol) {
    const draggedPieceIndex = draggedRow * gridSize + draggedCol;
    const emptyPieceIndex = targetRow * gridSize + targetCol;

    const draggedPiece = puzzlePieces[draggedPieceIndex];
    const emptyPiecePlaceholder = puzzlePieces[emptyPieceIndex];

    emptyPiecePlaceholder.replaceWith(draggedPiece);
    document.getElementById('puzzle-grid').appendChild(emptyPiecePlaceholder);

    [draggedPiece.dataset.row, draggedPiece.dataset.col] = [targetRow.toString(), targetCol.toString()];
    
    [emptyPosition.row, emptyPosition.col] = [draggedRow, draggedCol];

    puzzlePieces[draggedPieceIndex] = emptyPiecePlaceholder;
    puzzlePieces[emptyPieceIndex] = draggedPiece;
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
    reader.onload = function(event) {
        createPuzzle(event.target.result);
    };
    reader.readAsDataURL(file);
});

document.getElementById('shuffle-button').addEventListener('click', shufflePuzzle);
