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
      stroke: 'black',
      strokeWidth: 2
    });

    const label = new Konva.Text({
      x: 5,
      y: y - 20,
      text: '[ 0 ]',
      fontSize: 16,
      fill: 'blue',
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
    fill: 'blue',
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

  layer.add(line);
  layer.moveToTop();
  layer.draw();
}

function printGatePositionsMatrix() {
  const rows = 6;
  const cols = 14;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill('0'));  // Initialize with '0'

  layer.getChildren().forEach(child => {
    if (child instanceof Konva.Group) {
      const labelNode = child.findOne('Text');
      if (labelNode) {
        const label = labelNode.text();
        const x = child.x();
        const y = child.y();

        const col = Math.floor(x / colWidth);
        const row = Math.round((y + 20) / rowHeight);  // Adjust the row position due to offset

        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          matrix[row][col] = label;  // Mark the position with gate label
        }
      }
    }
  });

  console.log("Gate Placement Matrix:");
  matrix.forEach(row => console.log(row));  // Print the 2D matrix

  fetch("https://5831-103-99-14-202.ngrok-free.app/executeCircuit",
    {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ array: matrix })
  }
  ).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Something went wrong');
  })
  .then((responseJson) => {
    console.log(responseJson);
  })
  .catch((error) => {
      // Show Server Not Responded
  });
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
  chart: { type: 'bar', height: 501 },
  series: [{ data: [0.6, 0.2] }],
  xaxis: { categories: ['|0⟩', '|1⟩'] },
  title: { text: 'Qubit Probability' }
};

const chart = new ApexCharts(document.querySelector("#chart"), chartOptions);
chart.render();
