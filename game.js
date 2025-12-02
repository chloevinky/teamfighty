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

    // Animation loop
    this.lastTime = 0;
    this.running = false;

    this.initUI();
    this.initMouseEvents();
    this.initializeGame();
  }

  initializeGame() {
    // Start with 2 random champions at star level 1
    const champ1 = this.getRandomChampion();
    const champ2 = this.getRandomChampion();

    this.playerTeam.push(new Unit(champ1, 1, 'player'));
    this.playerTeam.push(new Unit(champ2, 1, 'player'));

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

    // Position units automatically based on role
    this.positionTeamByRole(this.playerTeam, 'player');

    // Generate enemy team for this wave
    const enemyTeam = this.generateEnemyWave(this.currentWave);
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

    team.forEach((unit, index) => {
      const col = index % COLS;
      const row = rows[Math.floor(index / COLS)];
      unit.setPosition(col, row);
    });
  }

  generateEnemyWave(waveNumber) {
    const enemyTeam = [];

    // Scale difficulty with wave number
    const enemyCount = Math.min(2 + Math.floor(waveNumber / 3), 6);
    const isBoss = waveNumber === this.maxWaves;

    if (isBoss) {
      // Boss wave: one super strong unit
      const bossData = this.getRandomChampion();
      const boss = new Unit(bossData, 3, 'enemy');
      boss.maxHp *= 3;
      boss.hp = boss.maxHp;
      boss.attackDamage *= 2;
      boss.name = `BOSS ${boss.name}`;
      enemyTeam.push(boss);
    } else {
      // Normal wave: multiple units
      for (let i = 0; i < enemyCount; i++) {
        const championData = this.getRandomChampion();
        const starLevel = Math.min(1 + Math.floor(waveNumber / 5), 3);
        const enemy = new Unit(championData, starLevel, 'enemy');

        // Scale stats with wave number
        const waveMultiplier = 1 + (waveNumber - 1) * 0.1;
        enemy.maxHp *= waveMultiplier;
        enemy.hp = enemy.maxHp;
        enemy.attackDamage *= waveMultiplier;

        enemyTeam.push(enemy);
      }
    }

    return enemyTeam;
  }

  endCombat() {
    const winner = this.combatEngine.winner;

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
      const randomUnit = this.playerTeam[Math.floor(Math.random() * this.playerTeam.length)];
      options.push({
        type: 'upgrade',
        data: randomUnit,
        label: `Upgrade ${randomUnit.name}`,
        description: `Increase to ${randomUnit.starLevel + 1}★ (+HP, +Damage, +Ability)`
      });
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
      if (unit.starLevel < 3) {
        unit.starLevel++;
        unit.updateStarLevel();
      }
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
    teamContainer.innerHTML = '<h3>Your Team:</h3>';

    this.playerTeam.forEach(unit => {
      const unitDiv = document.createElement('div');
      unitDiv.className = 'team-unit';
      unitDiv.innerHTML = `
        <strong>${unit.name}</strong> ${'★'.repeat(unit.starLevel)}<br>
        <small>${unit.role} | HP: ${Math.floor(unit.hp)}/${Math.floor(unit.maxHp)}</small>
      `;
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
