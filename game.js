// Main game controller - Wave-based Roguelike
class TechFightsGame {
  constructor() {
    this.canvas = document.getElementById('game-board');
    this.renderer = new Renderer(this.canvas);
    this.board = new Board();
    this.combatEngine = new CombatEngine(this.board);

    // Game state
    this.gameState = 'start'; // 'start', 'combat', 'rewards', 'victory', 'defeat'
    this.currentWave = 1;
    this.maxWaves = 15;
    this.playerHP = 100;

    // Player team
    this.playerTeam = [];

    // Combat log
    this.combatLog = [];
    this.maxLogMessages = 50;

    // Animation loop
    this.lastTime = 0;
    this.running = false;

    // Set global reference for combat logging
    window.game = this;

    this.initUI();
    this.initMouseEvents();
    this.initializeGame();
  }

  addCombatLog(message, type = 'normal') {
    this.combatLog.push({ message, type, time: Date.now() });
    if (this.combatLog.length > this.maxLogMessages) {
      this.combatLog.shift();
    }
    this.updateCombatLog();
  }

  clearCombatLog() {
    this.combatLog = [];
    this.updateCombatLog();
  }

  updateCombatLog() {
    const logContainer = document.getElementById('combat-log-messages');
    if (!logContainer) return;

    // Show last 10 messages
    const recentMessages = this.combatLog.slice(-10);
    logContainer.innerHTML = recentMessages.map(log =>
      `<div class="log-message ${log.type}">${log.message}</div>`
    ).join('');

    // Auto-scroll to bottom
    const parent = document.getElementById('combat-log');
    if (parent) {
      parent.scrollTop = parent.scrollHeight;
    }
  }

  initializeGame() {
    // Start with 3 random champions at star level 1
    const champ1 = this.getRandomChampion();
    const champ2 = this.getRandomChampion();
    const champ3 = this.getRandomChampion();

    this.playerTeam.push(new Unit(champ1, 1, 'player'));
    this.playerTeam.push(new Unit(champ2, 1, 'player'));
    this.playerTeam.push(new Unit(champ3, 1, 'player'));

    this.updateUI();
    this.showStartScreen();
  }

  showStartScreen() {
    this.gameState = 'start';
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-ui').style.display = 'none';
  }

  startRun() {
    this.gameState = 'prep';
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'flex';
    this.updateUI();
  }

  healPlayerTeam() {
    // Heal all player units to full HP and reset their state
    this.playerTeam.forEach(unit => {
      unit.hp = unit.maxHp;
      unit.isDead = false;
      unit.mana = 0;
      unit.shield = 0;
      unit.isStunned = false;
      unit.isSilenced = false;
      unit.isTaunted = false;
      unit.tauntTarget = null;
      unit.buffs = [];
      unit.debuffs = [];
      unit.target = null;
      unit.attackTimer = 0;
    });
  }

  getRandomChampion() {
    const championId = CHAMPION_POOL[Math.floor(Math.random() * CHAMPION_POOL.length)];
    return CHAMPIONS_DATA[championId];
  }

  initUI() {
    document.getElementById('start-btn').addEventListener('click', () => {
      this.startRun();
    });

    document.getElementById('start-wave-btn').addEventListener('click', () => {
      this.startCombat();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      location.reload();
    });

    document.getElementById('play-again-btn').addEventListener('click', () => {
      location.reload();
    });
  }

  initMouseEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const pixelPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      const gridPos = pixelToGrid(pixelPos);
      const unit = this.board.getUnitAt(gridPos.col, gridPos.row);
      if (unit) {
        this.showUnitDetails(unit);
      }
    });
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.gameState === 'combat') {
      this.combatEngine.update(deltaTime);

      if (!this.combatEngine.isRunning) {
        this.endCombat();
      }
    }

    this.renderer.render(this.board, this.gameState);

    if (this.gameState === 'combat') {
      const combatState = this.combatEngine.getCombatState();
      this.renderer.drawCombatInfo(combatState, this.currentWave, this.maxWaves);
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  startCombat() {
    if (this.gameState !== 'prep') return;

    // Clear and initialize combat log
    this.clearCombatLog();
    this.addCombatLog(`⚔️ WAVE ${this.currentWave} START!`, 'log-ability');

    // Heal and reset all player units before combat
    this.healPlayerTeam();

    console.log(`Starting Wave ${this.currentWave}`);
    console.log(`Player team size: ${this.playerTeam.length}`);

    // Position units automatically based on role
    this.positionTeamByRole(this.playerTeam, 'player');

    // Generate enemy team for this wave
    const enemyTeam = this.generateEnemyWave(this.currentWave);
    console.log(`Enemy team size: ${enemyTeam.length}`);
    this.positionTeamByRole(enemyTeam, 'enemy');

    // Setup battle
    this.board.setupBattle(this.playerTeam, enemyTeam);

    // Start combat
    this.combatEngine.start();
    this.gameState = 'combat';

    document.getElementById('start-wave-btn').style.display = 'none';
    this.updateUI();
  }

  positionTeamByRole(team, side) {
    // Sort by role: Tanks front, DPS/Control middle, Support back
    const roleOrder = { 'Tank': 0, 'DPS': 1, 'Control': 2, 'Support': 3 };
    team.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

    // Assign grid positions based on side
    const { COLS, PLAYER_ROWS, ENEMY_ROWS } = GAME_CONSTANTS.BOARD;
    const rows = side === 'player' ? PLAYER_ROWS : ENEMY_ROWS;
    const maxUnits = COLS * rows.length;

    if (team.length > maxUnits) {
      console.warn(`Team has ${team.length} units but only ${maxUnits} slots available. Trimming team.`);
      team = team.slice(0, maxUnits);
    }

    team.forEach((unit, index) => {
      const col = index % COLS;
      const rowIndex = Math.floor(index / COLS);

      if (rowIndex >= rows.length) {
        console.error(`Cannot place unit ${unit.name} - no more rows available`);
        return;
      }

      const row = rows[rowIndex];
      console.log(`Positioning ${unit.name} (${side}) at (${col}, ${row})`);
      unit.setPosition(col, row);
    });
  }

  generateEnemyWave(waveNumber) {
    const enemyTeam = [];

    // More gradual scaling for better balance
    const isBoss = waveNumber === this.maxWaves;

    if (isBoss) {
      // Boss wave: 2 super strong units
      for (let i = 0; i < 2; i++) {
        const bossData = this.getRandomChampion();
        const boss = new Unit(bossData, 3, 'enemy');
        boss.maxHp *= 2.5;
        boss.hp = boss.maxHp;
        boss.attackDamage *= 1.8;
        boss.name = `BOSS ${boss.name}`;
        enemyTeam.push(boss);
      }
    } else {
      // Match player team size for fair fights
      const enemyCount = this.playerTeam.length;

      for (let i = 0; i < enemyCount; i++) {
        const championData = this.getRandomChampion();
        // Star level increases every 8 waves
        const starLevel = Math.min(1 + Math.floor((waveNumber - 1) / 8), 4);
        const enemy = new Unit(championData, starLevel, 'enemy');

        // Base stat advantage (10%) + wave scaling (4% per wave)
        // This compensates for enemies matching player count
        const baseMultiplier = 1.1;
        const waveMultiplier = 1 + (waveNumber - 1) * 0.04;
        const totalMultiplier = baseMultiplier * waveMultiplier;

        enemy.maxHp *= totalMultiplier;
        enemy.hp = enemy.maxHp;
        enemy.attackDamage *= totalMultiplier;

        enemyTeam.push(enemy);
      }
    }

    return enemyTeam;
  }

  endCombat() {
    const winner = this.combatEngine.winner;
    const combatState = this.combatEngine.getCombatState();

    console.log(`Combat ended! Winner: ${winner}`);
    console.log(`Time elapsed: ${combatState.timeElapsed.toFixed(1)}s`);
    console.log(`Player units alive: ${combatState.alivePlayerUnits}`);
    console.log(`Enemy units alive: ${combatState.aliveEnemyUnits}`);

    if (winner === 'player') {
      // Victory
      if (this.currentWave >= this.maxWaves) {
        this.showVictoryScreen();
      } else {
        this.currentWave++;
        this.showRewardsScreen();
      }
    } else {
      // Defeat
      this.playerHP -= 20;
      console.log(`Lost wave! HP reduced to ${this.playerHP}`);

      if (this.playerHP <= 0) {
        this.showDefeatScreen();
      } else {
        // Continue with damaged team
        this.currentWave++;
        this.showRewardsScreen();
      }
    }
  }

  showRewardsScreen() {
    this.gameState = 'rewards';
    const rewardsPanel = document.getElementById('rewards-panel');
    rewardsPanel.style.display = 'flex';

    // Generate 3 reward options
    const options = [];

    // Option 1: New champion
    const newChamp = this.getRandomChampion();
    options.push({
      type: 'champion',
      data: newChamp,
      label: `Add ${newChamp.name}`,
      description: `${newChamp.role} - ${newChamp.ability.description}`
    });

    // Option 2: Upgrade existing champion
    if (this.playerTeam.length > 0) {
      // Find units that can still be upgraded (< 4 stars)
      const upgradableUnits = this.playerTeam.filter(u => u.starLevel < 4);
      if (upgradableUnits.length > 0) {
        const randomUnit = upgradableUnits[Math.floor(Math.random() * upgradableUnits.length)];
        options.push({
          type: 'upgrade',
          data: randomUnit,
          label: `Upgrade ${randomUnit.name}`,
          description: `Increase to ${randomUnit.starLevel + 1}★ (+50% HP/Damage) + Heal 20 HP`
        });
      } else {
        // All units are max level, offer heal instead
        options.push({
          type: 'heal',
          data: 50,
          label: 'Heal 50 HP',
          description: 'All champions maxed! Restore health instead'
        });
      }
    } else {
      options.push({
        type: 'heal',
        data: 30,
        label: 'Heal 30 HP',
        description: 'Restore health'
      });
    }

    // Option 3: Remove a unit and heal
    options.push({
      type: 'heal',
      data: 50,
      label: 'Heal 50 HP',
      description: 'Restore a large amount of health'
    });

    // Display options
    const optionsContainer = document.getElementById('reward-options');
    optionsContainer.innerHTML = '';

    options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'reward-option';
      btn.innerHTML = `
        <h3>${option.label}</h3>
        <p>${option.description}</p>
      `;
      btn.addEventListener('click', () => this.selectReward(option));
      optionsContainer.appendChild(btn);
    });
  }

  selectReward(reward) {
    if (reward.type === 'champion') {
      const newUnit = new Unit(reward.data, 1, 'player');
      this.playerTeam.push(newUnit);
    } else if (reward.type === 'upgrade') {
      const unit = reward.data;
      if (unit.starLevel < 4) {
        unit.starLevel++;
        unit.updateStarLevel();
      }
      // Bonus: Also heal 20 HP when upgrading
      this.playerHP = Math.min(this.playerHP + 20, 100);
    } else if (reward.type === 'heal') {
      this.playerHP = Math.min(this.playerHP + reward.data, 100);
    }

    document.getElementById('rewards-panel').style.display = 'none';
    this.gameState = 'prep';
    this.board.reset();
    document.getElementById('start-wave-btn').style.display = 'block';
    this.updateUI();
  }

  showVictoryScreen() {
    this.gameState = 'victory';
    document.getElementById('victory-screen').style.display = 'flex';
  }

  showDefeatScreen() {
    this.gameState = 'defeat';
    document.getElementById('defeat-screen').style.display = 'flex';
  }

  updateUI() {
    document.getElementById('wave-display').textContent = `Wave: ${this.currentWave}/${this.maxWaves}`;
    document.getElementById('hp-display').textContent = `HP: ${this.playerHP}`;

    // Update team display
    const teamContainer = document.getElementById('team-display');
    teamContainer.innerHTML = `<h3>Your Team (${this.playerTeam.length}):</h3>`;

    this.playerTeam.forEach(unit => {
      const unitDiv = document.createElement('div');
      unitDiv.className = 'team-unit';
      const hpPercent = (unit.hp / unit.maxHp * 100).toFixed(0);
      const hpColor = hpPercent > 66 ? '#00ff88' : hpPercent > 33 ? '#ffaa00' : '#ff4444';

      unitDiv.innerHTML = `
        <strong>${unit.name}</strong> ${'★'.repeat(unit.starLevel)}<br>
        <small>${unit.role}</small><br>
        <small style="color: ${hpColor}">HP: ${Math.floor(unit.hp)}/${Math.floor(unit.maxHp)} (${hpPercent}%)</small>
      `;
      unitDiv.addEventListener('click', () => this.showUnitDetails(unit));
      teamContainer.appendChild(unitDiv);
    });

    // Update progress bar
    const progress = (this.currentWave - 1) / this.maxWaves * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
  }

  showUnitDetails(unit) {
    const detailsPanel = document.getElementById('unit-details');
    detailsPanel.style.display = 'block';

    const championData = unit.championData;
    document.getElementById('unit-name').textContent = unit.name;
    document.getElementById('unit-role').textContent = unit.role;

    const statsDiv = document.getElementById('unit-stats');
    statsDiv.innerHTML = `
      <div><strong>HP:</strong> ${Math.floor(unit.hp)} / ${Math.floor(unit.maxHp)}</div>
      <div><strong>Attack:</strong> ${Math.floor(unit.attackDamage)}</div>
      <div><strong>Armor:</strong> ${Math.floor(unit.armor)}</div>
      <div><strong>Stars:</strong> ${'★'.repeat(unit.starLevel)}</div>
    `;

    const abilityDiv = document.getElementById('unit-ability');
    abilityDiv.innerHTML = `
      <strong>${championData.ability.name}</strong><br>
      ${championData.ability.description}
    `;

    setTimeout(() => {
      const closeHandler = (e) => {
        if (!detailsPanel.contains(e.target)) {
          detailsPanel.style.display = 'none';
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 100);
  }
}

// Start game when page loads
window.addEventListener('load', () => {
  const game = new TechFightsGame();
  game.start();
});
