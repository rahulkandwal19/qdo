const stage = new Konva.Stage({
    container: 'konva-canvas',
    width: 400,
    height: 400,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  let gridRows = 4;
  let gridCols = 4;
  let gridCellSize = 100;

  const gateMatrices = {
    'CNOT': [['1', '0', '0', '0'], ['0', '0', '1', '0'], ['0', '1', '0', '0'], ['0', '0', '0', '1']],
    'X': [['0', '1'], ['1', '0']],
    'H': [['1/√2', '1/√2'], ['1/√2', '-1/√2']],
    'SWAP': [['1', '0', '0', '0'], ['0', '0', '1', '0'], ['0', '1', '0', '0'], ['0', '0', '0', '1']],
    'Y': [['0','-i'], ['i','0']],
    'Z': [['1','0'], ['0','-1']],
    'S': [['1','0'], ['0','i']],
    'T': [['1','0'], ['0','e^iπ/4']],
    'ROT-X': [['cos(θ/2)','-isin(θ/2)'], ['-isin(θ/2)','cos(θ/2)']],
    'ROT-Y': [['cos(θ/2)','-sin(θ/2)'], ['sin(θ/2)','cos(θ/2)']],
    'ROT-Z': [['e^-i(θ/2)','0'], ['0','e^-i(θ/2)']],
    'I': [['1','0'], ['0','1']],
  };

  let currentGate = null;
  let currentMatrix = [];
  let tiles = [];
  let emptyCell = { x: 3, y: 3 };

  function startPuzzleFromUI() {
    const gate = document.getElementById('gate-select').value;
    startPuzzle(gate);
    document.getElementById('status').innerText = "";
  }

  function startPuzzle(gate) {
    currentGate = gate;
    const fullMatrix = gateMatrices[gate];

    gridRows = fullMatrix.length;
    gridCols = fullMatrix[0].length;

    stage.width(gridCols * gridCellSize);
    stage.height(gridRows * gridCellSize);

    currentMatrix = createMatrixWithEmpty(fullMatrix);
    setupPuzzle();
  }

  function createMatrixWithEmpty(matrix) {
    const full = JSON.parse(JSON.stringify(matrix));
    return shuffleTiles(full);
  }

  function shuffleTiles(matrix) {
    let flat = [];
  
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        flat.push({ value: matrix[i][j], row: i, col: j });
      }
    }
  
    // Only pick from cells that are '0' to become empty
    let zeroCells = flat.filter(cell => cell.value === '0');
    if (zeroCells.length === 0) {
      console.warn("No '0' tile to hide.");
      return matrix;
    }
  
    let emptyTile = zeroCells[Math.floor(Math.random() * zeroCells.length)];
    let emptyIndex = flat.findIndex(cell => cell.row === emptyTile.row && cell.col === emptyTile.col);
    flat[emptyIndex].value = '';
  
    // Now shuffle the array
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
  
    // Build the shuffled matrix
    const shuffled = [];
    for (let i = 0; i < gridRows; i++) {
      const row = [];
      for (let j = 0; j < gridCols; j++) {
        const cell = flat[i * gridCols + j];
        row.push(cell.value);
        if (cell.value === '') {
          emptyCell = { x: j, y: i };
        }
      }
      shuffled.push(row);
    }
  
    return shuffled;
  }
  

  function setupPuzzle() {
    layer.destroyChildren();
    tiles = [];

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const value = currentMatrix[row][col];
        if (value === '') continue;

        const group = new Konva.Group({
          x: col * gridCellSize,
          y: row * gridCellSize,
          width: gridCellSize,
          height: gridCellSize,
        });

        const rect = new Konva.Rect({
          width: gridCellSize,
          height: gridCellSize,
          fill: 'lightblue',
          stroke: 'black',
          strokeWidth: 2,
        });

        const text = new Konva.Text({
          text: value,
          fontSize: 18,
          fill: 'black',
          width: gridCellSize,
          height: gridCellSize,
          align: 'center',
          verticalAlign: 'middle',
        });

        group.add(rect);
        group.add(text);
        layer.add(group);

        group.row = row;
        group.col = col;
        tiles.push(group);

        group.on('click', () => attemptMove(group));

        group.on('mouseover', () => {
          const dx = group.col - emptyCell.x;
          const dy = group.row - emptyCell.y;
          const isAdjacent = (Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0);
          stage.container().style.cursor = isAdjacent ? 'pointer' : 'default';
        });

        group.on('mouseout', () => {
          stage.container().style.cursor = 'default';
        });
      }
    }
    layer.draw();
  }

  function attemptMove(tile) {
    const dx = tile.col - emptyCell.x;
    const dy = tile.row - emptyCell.y;
    const isAdjacent = (Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0);
    if (!isAdjacent) return;

    tile.to({
      x: emptyCell.x * gridCellSize,
      y: emptyCell.y * gridCellSize,
      duration: 0.15,
    });

    currentMatrix[emptyCell.y][emptyCell.x] = currentMatrix[tile.row][tile.col];
    currentMatrix[tile.row][tile.col] = '';

    const oldRow = tile.row;
    const oldCol = tile.col;

    tile.row = emptyCell.y;
    tile.col = emptyCell.x;

    emptyCell = { x: oldCol, y: oldRow };
  }

  function checkWinCondition() {
    const original = gateMatrices[currentGate];
    let win = true;
  
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        const expected = original[i][j];
        const actual = currentMatrix[i][j] === '' ? '0' : currentMatrix[i][j];
        if (expected !== actual) {
          win = false;
          break;
        }
      }
      if (!win) break;
    }
  
    const statusElement = document.getElementById('status');
    if (win) {
      statusElement.innerText = "You Win! The puzzle is solved.";
      statusElement.style.color = "green";
    } else {
      statusElement.innerText = "Puzzle is not solved yet!";
      statusElement.style.color = "black";
    }
  }
  

  function submitPuzzle() {
    checkWinCondition();
  }

  function resetGame() {
    if (!currentGate) return;
    startPuzzle(currentGate);
    document.getElementById('status').innerText = "";
  }

  function showAnswer() {
    if (!currentGate) return;
    const originalMatrix = gateMatrices[currentGate];
  
    // Set the current matrix directly to the original one
    currentMatrix = JSON.parse(JSON.stringify(originalMatrix));
  
    // Replace the emptyCell with a random '0' if any, otherwise just pick the last cell
    let foundZero = false;
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        if (currentMatrix[i][j] === '0') {
          emptyCell = { x: j, y: i };
          currentMatrix[i][j] = '';
          foundZero = true;
          break;
        }
      }
      if (foundZero) break;
    }
  
    if (!foundZero) {
      emptyCell = { x: gridCols - 1, y: gridRows - 1 };
      currentMatrix[emptyCell.y][emptyCell.x] = '';
    }
  
    setupPuzzle();
    document.getElementById('status').innerText = "Answer shown (solution view).";
    document.getElementById('status').style.color = "blue";
  }
  