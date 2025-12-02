// Canvas renderer - Simplified for wave-based game
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear() {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  render(board, gameState) {
    this.clear();
    this.drawGrid(board);
    this.drawUnits(board.getAllUnits());
  }

  drawGrid(board) {
    const { TILE_SIZE, TILE_GAP, COLS, ROWS } = GAME_CONSTANTS.BOARD;
    const { TILE_PLAYER, TILE_ENEMY, TILE_GRID } = GAME_CONSTANTS.COLORS;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * (TILE_SIZE + TILE_GAP) + TILE_GAP;
        const y = row * (TILE_SIZE + TILE_GAP) + TILE_GAP;

        // Background color based on team zone
        if (board.isPlayerRow(row)) {
          this.ctx.fillStyle = TILE_PLAYER;
        } else if (board.isEnemyRow(row)) {
          this.ctx.fillStyle = TILE_ENEMY;
        } else {
          this.ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
        }

        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Grid border
        this.ctx.strokeStyle = TILE_GRID;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  drawUnits(units) {
    units.forEach(unit => {
      if (unit.isDead) return;
      this.drawUnit(unit);
    });
  }

  drawUnit(unit) {
    const { x, y } = unit.pixelPos;
    const { RADIUS } = GAME_CONSTANTS.UNIT;
    const color = unit.team === 'player'
      ? GAME_CONSTANTS.COLORS.UNIT_PLAYER
      : GAME_CONSTANTS.COLORS.UNIT_ENEMY;

    // Draw unit circle
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw shield if present
    if (unit.shield > 0) {
      this.ctx.strokeStyle = GAME_CONSTANTS.COLORS.SHIELD;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(x, y, RADIUS + 3, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw stun indicator
    if (unit.isStunned) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('⚡', x, y - RADIUS - 15);
    }

    // Draw unit name
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(unit.name, x, y + 5);

    // Draw star level
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillText(unit.getStarString(), x, y - RADIUS - 5);

    // Draw HP bar
    this.drawHealthBar(unit);

    // Draw mana bar
    this.drawManaBar(unit);
  }

  drawHealthBar(unit) {
    const { x, y } = unit.pixelPos;
    const { BAR_WIDTH, BAR_HEIGHT, BAR_OFFSET } = GAME_CONSTANTS.UNIT;

    const barX = x - BAR_WIDTH / 2;
    const barY = y + BAR_OFFSET;

    // Background
    this.ctx.fillStyle = GAME_CONSTANTS.COLORS.HP_BAR_BG;
    this.ctx.fillRect(barX, barY, BAR_WIDTH, BAR_HEIGHT);

    // Health
    const hpPercent = unit.hp / unit.maxHp;
    this.ctx.fillStyle = GAME_CONSTANTS.COLORS.HP_BAR;
    this.ctx.fillRect(barX, barY, BAR_WIDTH * hpPercent, BAR_HEIGHT);

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, BAR_WIDTH, BAR_HEIGHT);
  }

  drawManaBar(unit) {
    const { x, y } = unit.pixelPos;
    const { BAR_WIDTH, BAR_HEIGHT, BAR_OFFSET } = GAME_CONSTANTS.UNIT;

    const barX = x - BAR_WIDTH / 2;
    const barY = y + BAR_OFFSET + BAR_HEIGHT + 2;

    // Background
    this.ctx.fillStyle = GAME_CONSTANTS.COLORS.MANA_BAR_BG;
    this.ctx.fillRect(barX, barY, BAR_WIDTH, BAR_HEIGHT);

    // Mana
    const manaPercent = unit.mana / unit.manaMax;
    this.ctx.fillStyle = GAME_CONSTANTS.COLORS.MANA_BAR;
    this.ctx.fillRect(barX, barY, BAR_WIDTH * manaPercent, BAR_HEIGHT);

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, BAR_WIDTH, BAR_HEIGHT);
  }

  drawCombatInfo(combatState, currentWave, maxWaves) {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'left';

    this.ctx.fillText(`Wave ${currentWave}/${maxWaves}`, 20, 30);
    this.ctx.fillText(`Time: ${Math.floor(combatState.timeElapsed)}s`, 20, 55);

    // Units alive
    this.ctx.fillText(`⚔️ ${combatState.alivePlayerUnits} vs ${combatState.aliveEnemyUnits}`, 20, 80);
  }
}
