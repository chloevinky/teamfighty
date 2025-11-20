// Utility functions

function manhattanDistance(pos1, pos2) {
  return Math.abs(pos1.col - pos2.col) + Math.abs(pos1.row - pos2.row);
}

function euclideanDistance(pos1, pos2) {
  const dx = pos1.col - pos2.col;
  const dy = pos1.row - pos2.row;
  return Math.sqrt(dx * dx + dy * dy);
}

function gridToPixel(gridPos) {
  const { TILE_SIZE, TILE_GAP } = GAME_CONSTANTS.BOARD;
  return {
    x: gridPos.col * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 + TILE_GAP,
    y: gridPos.row * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 + TILE_GAP
  };
}

function pixelToGrid(pixelPos) {
  const { TILE_SIZE, TILE_GAP } = GAME_CONSTANTS.BOARD;
  return {
    col: Math.floor((pixelPos.x - TILE_GAP) / (TILE_SIZE + TILE_GAP)),
    row: Math.floor((pixelPos.y - TILE_GAP) / (TILE_SIZE + TILE_GAP))
  };
}

function isValidGridPosition(col, row) {
  const { COLS, ROWS } = GAME_CONSTANTS.BOARD;
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedRandom(weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }
  return weights.length - 1;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function calculateDamage(damage, armor, magicResist, damageType = 'physical') {
  if (damageType === 'true') return damage;

  const resistance = damageType === 'magic' ? magicResist : armor;
  const reduction = resistance / (100 + resistance);
  return damage * (1 - reduction);
}

function generateUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Find the nearest target in a list
function findNearestUnit(fromUnit, targets) {
  if (targets.length === 0) return null;

  let nearest = targets[0];
  let minDist = manhattanDistance(fromUnit.gridPos, targets[0].gridPos);

  for (let i = 1; i < targets.length; i++) {
    const dist = manhattanDistance(fromUnit.gridPos, targets[i].gridPos);
    if (dist < minDist) {
      minDist = dist;
      nearest = targets[i];
    }
  }

  return nearest;
}

// Get all units within a certain radius
function getUnitsInRadius(centerPos, units, radius) {
  return units.filter(unit =>
    manhattanDistance(centerPos, unit.gridPos) <= radius
  );
}

// Pathfinding - simple greedy approach toward target
function getNextStepToward(fromPos, toPos, occupiedPositions = []) {
  const directions = [
    { col: 0, row: -1 },  // up
    { col: 0, row: 1 },   // down
    { col: -1, row: 0 },  // left
    { col: 1, row: 0 }    // right
  ];

  let bestMove = fromPos;
  let bestDist = manhattanDistance(fromPos, toPos);

  for (const dir of directions) {
    const newPos = {
      col: fromPos.col + dir.col,
      row: fromPos.row + dir.row
    };

    if (!isValidGridPosition(newPos.col, newPos.row)) continue;

    // Check if position is occupied
    const isOccupied = occupiedPositions.some(
      pos => pos.col === newPos.col && pos.row === newPos.row
    );
    if (isOccupied) continue;

    const dist = manhattanDistance(newPos, toPos);
    if (dist < bestDist) {
      bestDist = dist;
      bestMove = newPos;
    }
  }

  return bestMove;
}
