// Board management system
class Board {
  constructor() {
    const { COLS, ROWS } = GAME_CONSTANTS.BOARD;
    this.cols = COLS;
    this.rows = ROWS;

    // Grid state: null or unit ID
    this.grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

    // Units on board
    this.playerUnits = [];
    this.enemyUnits = [];
  }

  reset() {
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    this.playerUnits = [];
    this.enemyUnits = [];
  }

  placeUnit(unit, col, row) {
    if (!isValidGridPosition(col, row)) {
      console.error('Invalid grid position:', col, row);
      return false;
    }

    if (this.grid[row][col] !== null) {
      console.error('Position occupied:', col, row);
      return false;
    }

    unit.setPosition(col, row);
    this.grid[row][col] = unit.id;

    if (unit.team === 'player') {
      this.playerUnits.push(unit);
    } else {
      this.enemyUnits.push(unit);
    }

    return true;
  }

  removeUnit(unit) {
    if (this.grid[unit.gridPos.row] && this.grid[unit.gridPos.row][unit.gridPos.col] === unit.id) {
      this.grid[unit.gridPos.row][unit.gridPos.col] = null;
    }

    if (unit.team === 'player') {
      this.playerUnits = this.playerUnits.filter(u => u.id !== unit.id);
    } else {
      this.enemyUnits = this.enemyUnits.filter(u => u.id !== unit.id);
    }
  }

  moveUnit(unit, newCol, newRow) {
    if (!isValidGridPosition(newCol, newRow)) {
      return false;
    }

    if (this.grid[newRow][newCol] !== null &&
        this.grid[newRow][newCol] !== unit.id) {
      return false;
    }

    // Clear old position
    this.grid[unit.gridPos.row][unit.gridPos.col] = null;

    // Set new position
    unit.setPosition(newCol, newRow);
    this.grid[newRow][newCol] = unit.id;

    return true;
  }

  getUnitAt(col, row) {
    if (!isValidGridPosition(col, row)) return null;

    const unitId = this.grid[row][col];
    if (!unitId) return null;

    return this.getAllUnits().find(u => u.id === unitId);
  }

  getAllUnits() {
    return [...this.playerUnits, ...this.enemyUnits];
  }

  getAliveUnits() {
    return this.getAllUnits().filter(u => !u.isDead);
  }

  getAlivePlayerUnits() {
    return this.playerUnits.filter(u => !u.isDead);
  }

  getAliveEnemyUnits() {
    return this.enemyUnits.filter(u => !u.isDead);
  }

  isPositionOccupied(col, row) {
    if (!isValidGridPosition(col, row)) return true;
    return this.grid[row][col] !== null;
  }

  isPlayerRow(row) {
    return GAME_CONSTANTS.BOARD.PLAYER_ROWS.includes(row);
  }

  isEnemyRow(row) {
    return GAME_CONSTANTS.BOARD.ENEMY_ROWS.includes(row);
  }

  setupBattle(playerTeam, enemyTeam) {
    this.reset();

    // Place player units (bottom rows)
    playerTeam.forEach((unit, index) => {
      const col = index % this.cols;
      const row = GAME_CONSTANTS.BOARD.PLAYER_ROWS[Math.floor(index / this.cols)];
      this.placeUnit(unit, col, row);
    });

    // Place enemy units (top rows)
    enemyTeam.forEach((unit, index) => {
      const col = index % this.cols;
      const row = GAME_CONSTANTS.BOARD.ENEMY_ROWS[Math.floor(index / this.cols)];
      this.placeUnit(unit, col, row);
    });
  }
}
