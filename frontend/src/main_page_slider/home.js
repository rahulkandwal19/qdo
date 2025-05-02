let selectedGate = null;
const gateCoordinates = [];
const connectedGates = new Set();

const stage = new Konva.Stage({
  container: 'konva-canvas',
  width: 1450,
  height: 500,
});

const layer = new Konva.Layer();
stage.add(layer);

const rowHeight = 71;
const colWidth = 80;
const totalRows = Math.floor(stage.height() / rowHeight);
const totalCols = Math.floor(stage.width() / colWidth);
const persistentItems = [];

function drawGridAndLabels() {
  const options = ['[ 0 ]', '[ 1 ]', '[ + ]', '[ - ]', '[ -i ]', '[ +i ]'];

  for (let i = 0; i < totalRows; i++) {
    const y = i * rowHeight;

    const line = new Konva.Line({
      points: [0, y, stage.width(), y],
      stroke: '#ccc',
      strokeWidth: 2
    });

    const label = new Konva.Text({
      x: 5,
      y: y - 20,
      text: '[ 0 ]',
      fontSize: 16,
      fill: '#140d79',
    });

    label.on('click', () => {
      let currentIndex = options.indexOf(label.text());
      let nextIndex = (currentIndex + 1) % options.length;
      label.text(options[nextIndex]);
      layer.draw();
    });

    const outputBox = new Konva.Rect({
      x: stage.width() - 25,
      y: y + rowHeight / 2 - 7.5,
      width: 15,
      height: 15,
      fill: 'lightgray',
      stroke: 'black',
      strokeWidth: 1,
      cornerRadius: 3,
      name: `output-box-row-${i}`
    });

    layer.add(line, label, outputBox);
    persistentItems.push(line, label, outputBox);
  }

  for (let i = 0; i < totalCols; i++) {
    const x = i * colWidth;
    const vLine = new Konva.Line({
      points: [x, 0, x, stage.height()],
      stroke: '#ccc',
      strokeWidth: 1
    });
    layer.add(vLine);
    persistentItems.push(vLine);
  }

  layer.draw();
}

drawGridAndLabels();

function snapToRow(y) {
  return Math.round(y / rowHeight) * rowHeight - 20;
}

function addGate(label) {
  const group = new Konva.Group({
    draggable: true,
    x: 50,
    y: snapToRow(100)
  });

  const rect = new Konva.Rect({
    width: 60,
    height: 40,
    fill: '#ddd',
    stroke: 'black',
    strokeWidth: 1,
    cornerRadius: 6
  });

  const text = new Konva.Text({
    text: label,
    fontSize: 16,
    fill: 'black',
    width: 60,
    height: 40,
    align: 'center',
    verticalAlign: 'middle',
  });

  const fixButton = new Konva.Text({
    text: 'Lock Position',
    fontSize: 12,
    fill: '#140d79',
    x: 65,
    y: 0
  });

  group.add(rect, text, fixButton);
  layer.add(group);

  let isFixed = false;

  group.on('dragmove', () => {
    if (!isFixed) {
      let newX = Math.round(group.x() / colWidth) * colWidth;
      let newY = snapToRow(group.y());

      newX = Math.max(0, Math.min(stage.width() - 60, newX));
      newY = Math.max(0, Math.min(stage.height() - 40, newY));

      group.position({ x: newX, y: newY });
      layer.batchDraw();
    }
  });

  fixButton.on('click', () => {
    isFixed = !isFixed;
    fixButton.text(isFixed ? 'Unlock Position' : 'Lock Position');
    group.draggable(!isFixed);
    if (isFixed) {
      sendPositionToBackend(group.x(), group.y(), label);
    }
    layer.batchDraw();
  });

  group.on('click', () => {
    if (selectedGate && selectedGate !== group) {
      const fromTextNode = selectedGate.findOne('Text');
      const toTextNode = group.findOne('Text');

      if (fromTextNode && toTextNode) {
        const fromLabel = fromTextNode.text();
        const toLabel = toTextNode.text();

        const fromX = selectedGate.x();
        const toX = group.x();

        if (
          fromLabel === 'SWAP' &&
          toLabel === 'SWAP' &&
          !connectedGates.has(selectedGate) &&
          !connectedGates.has(group) &&
          Math.abs(fromX - toX) < 10
        ) {
          drawLink(selectedGate, group);
          connectedGates.add(selectedGate);
          connectedGates.add(group);
          selectedGate = null;
          return;
        }
      }
      selectedGate = null;
    } else {
      selectedGate = group;
    }
  });

  layer.draw();
}
let swapConnections = [];  // Store SWAP gate polyline connections


let linkData = [];  // Initialize linkData array for connection data





function drawLink(fromGate, toGate) {
  if (Math.abs(fromGate.x() - toGate.x()) < 10) {
    toGate.x(fromGate.x());
  } else return;

  const start = { x: fromGate.x() + 30, y: fromGate.y() + 20 };
  const end = { x: toGate.x() + 30, y: toGate.y() + 20 };

  const line = new Konva.Line({
    points: [start.x, start.y, start.x, end.y, end.x, end.y],
    stroke: 'blue',
    strokeWidth: 2,
    lineCap: 'round',
    lineJoin: 'round'
  });

  // Add the connection to linkData for both SWAP and CNOT gates
  const fromRow = Math.round((fromGate.y() + 20) / rowHeight);
  const toRow = Math.round((toGate.y() + 20) / rowHeight);

  // Check gate types
  const fromLabel = fromGate.findOne('Text')?.text() || "Unknown";
  const toLabel = toGate.findOne('Text')?.text() || "Unknown";

  // Assuming your 'SWAP' and 'CNOT' types are already correctly assigned
  linkData.push({
    from: fromGate._id,
    to: toGate._id,
    fromLabel: fromLabel,
    toLabel: toLabel,
    type: fromLabel === 'SWAP' ? 'SWAP' : (fromLabel === 'CNOT' ? 'CNOT' : 'Unknown')
  });

  layer.add(line);
  layer.moveToTop();
  layer.draw();
}



function printGatePositionsMatrix() {
  const rows = 6;
  const cols = 14;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  const gateMap = new Map();
  const gateRowMap = new Map();
  const gateColMap = new Map();  // ✅ NEW

  layer.getChildren().forEach(child => {
    if (child instanceof Konva.Group) {
      const labelNode = child.findOne('Text');
      if (labelNode) {
        const label = labelNode.text().trim();
        const x = child.x();
        const y = child.y();

        const col = Math.floor(x / colWidth);
        const row = Math.round((y + 20) / rowHeight);

        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          matrix[row][col] = label;

          gateMap.set(child._id, label);
          gateRowMap.set(child._id, row);
          gateColMap.set(child._id, col);  // ✅ Add column info
        }
      }
    }
  });

  console.log("Gate Placement Matrix:");
  matrix.forEach(row => console.log(row));

  if (Array.isArray(linkData) && linkData.length > 0) {
    console.log("\nConnected Lines (Start Row -> End Row with Gate Labels):");
    linkData.forEach((link, i) => {
      const fromLabel = gateMap.get(link.from) || "Unknown";
      const toLabel = gateMap.get(link.to) || "Unknown";
      const fromRow = gateRowMap.get(link.from);
      const toRow = gateRowMap.get(link.to);

      console.log(
        `Gate: ${link.type}, From: ${fromLabel}, To: ${toLabel}`
      );

      if (link.type === 'SWAP' || link.type === 'CNOT') {
        console.log(`    Row Pair (${link.type}): (${fromRow}, ${toRow})`);
      }
    });

    // ✅ Call vertical matrix calculator
    getVerticalGateConnectionMatrices(linkData, gateRowMap, gateColMap);
  }
}




//return vertical rows
function getVerticalGateConnectionMatrices(links, gateRowMap, gateColMap) {
  const rows = 6;
  const cols = 14;

  const swapMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  const cnotMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  links.forEach(link => {
    const type = link.type?.toLowerCase(); // Ensure type is in lowercase
    const fromRow = gateRowMap.get(link.from);
    const toRow = gateRowMap.get(link.to);
    const fromCol = gateColMap.get(link.from);
    const toCol = gateColMap.get(link.to);

    // Must be vertically adjacent and same column
    if (fromCol === toCol && Math.abs(fromRow - toRow) === 1) {
      const topRow = Math.min(fromRow, toRow);

      if (type === 'swap') {
        swapMatrix[topRow][fromCol] = 1;
      } else if (type === 'cnot') {
        cnotMatrix[topRow][fromCol] = 1;
      }
    }
  });

  console.log("SWAP Matrix:");
  console.table(swapMatrix);

  console.log("CNOT Matrix:");
  console.table(cnotMatrix);
}




document.getElementById('saveAllBtn').addEventListener('click', printGatePositionsMatrix);


function clearCanvas() {
  layer.getChildren().forEach(child => {
    if (!persistentItems.includes(child)) {
      child.destroy();
    }
  });
  selectedGate = null;
  connectedGates.clear();
  layer.draw();
}

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('statusText').innerHTML = '';
  clearCanvas();
});

// Dummy function for backend (placeholder)
function sendPositionToBackend(x, y, label) {
  console.log(`Sent to backend: ${label} at (${x}, ${y})`);
}

// ApexCharts Qubit Probabilities
const chartOptions = {
  chart: { type: 'bar', height: 500 },
  series: [{ data: [0.6, 0.2] }],
  xaxis: { categories: ['|0⟩', '|1⟩'] },
  title: { text: 'Qubit Probability' }
};

const chart = new ApexCharts(document.querySelector("#chart"), chartOptions);
chart.render();
