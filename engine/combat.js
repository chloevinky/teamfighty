// Simplified Combat engine
class CombatEngine {
  constructor(board) {
    this.board = board;
    this.isRunning = false;
    this.timeElapsed = 0;
    this.maxDuration = GAME_CONSTANTS.COMBAT.MAX_DURATION;
    this.winner = null;
  }

  start() {
    this.isRunning = true;
    this.timeElapsed = 0;
    this.winner = null;
  }

  stop() {
    this.isRunning = false;
  }

  update(deltaTime) {
    if (!this.isRunning) return;

    this.timeElapsed += deltaTime;

    // Check time limit
    if (this.timeElapsed >= this.maxDuration) {
      this.endCombat('draw');
      return;
    }

    // Update all units
    const allUnits = this.board.getAllUnits();
    allUnits.forEach(unit => {
      unit.update(deltaTime, allUnits);
    });

    // Check for victory conditions
    const alivePlayerUnits = this.board.getAlivePlayerUnits();
    const aliveEnemyUnits = this.board.getAliveEnemyUnits();

    if (alivePlayerUnits.length === 0 && aliveEnemyUnits.length > 0) {
      this.endCombat('enemy');
    } else if (aliveEnemyUnits.length === 0 && alivePlayerUnits.length > 0) {
      this.endCombat('player');
    } else if (alivePlayerUnits.length === 0 && aliveEnemyUnits.length === 0) {
      this.endCombat('draw');
    }
  }

  endCombat(winner) {
    this.isRunning = false;
    this.winner = winner;
    console.log('Combat ended. Winner:', winner);
  }

  getCombatState() {
    return {
      isRunning: this.isRunning,
      timeElapsed: this.timeElapsed,
      timeRemaining: this.maxDuration - this.timeElapsed,
      winner: this.winner,
      alivePlayerUnits: this.board.getAlivePlayerUnits().length,
      aliveEnemyUnits: this.board.getAliveEnemyUnits().length
    };
  }
}
