// Main game controller
class TechFightsGame {
  constructor() {
    this.canvas = document.getElementById('game-board');
    this.renderer = new Renderer(this.canvas);

    this.board = new Board();
    this.timeMarksSystem = new TimeMarksSystem();
    this.combatEngine = new CombatEngine(this.board, this.timeMarksSystem);
    this.traitsEngine = new TraitsEngine();
    this.shop = new Shop();

    this.gameState = 'prep'; // 'prep' or 'combat'
    this.round = 1;
    this.playerHP = GAME_CONSTANTS.ECONOMY.STARTING_HP;

    // Player team (units on board)
    this.playerTeam = [];

    // Animation loop
    this.lastTime = 0;
    this.running = false;

    // UI elements
    this.initUI();

    // Mouse interaction
    this.selectedUnit = null;
    this.draggedUnit = null;
    this.initMouseEvents();
  }

  initUI() {
    // Buttons
    document.getElementById('start-combat-btn').addEventListener('click', () => {
      this.startCombat();
    });

    document.getElementById('reroll-shop-btn').addEventListener('click', () => {
      this.shop.rollShop();
      this.updateShopDisplay();
    });

    document.getElementById('level-up-btn').addEventListener('click', () => {
      this.shop.levelUp();
      this.updateUI();
    });

    // Initialize shop
    this.shop.generateShop();
    this.updateShopDisplay();
    this.updateBenchDisplay();
    this.updateUI();
  }

  initMouseEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const pixelPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      const gridPos = pixelToGrid(pixelPos);
      console.log('Clicked grid position:', gridPos);

      // Check if clicking a unit
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

    // Update game state
    if (this.gameState === 'combat') {
      this.combatEngine.update(deltaTime);

      // Check if combat ended
      if (!this.combatEngine.isRunning) {
        this.endCombat();
      }
    }

    // Render
    this.renderer.render(this.board, this.timeMarksSystem);

    if (this.gameState === 'combat') {
      const combatState = this.combatEngine.getCombatState();
      this.renderer.drawCombatInfo(combatState);
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  startCombat() {
    if (this.gameState === 'combat') return;

    // Get player units from bench/board
    this.playerTeam = this.shop.bench.slice(0, this.shop.playerLevel);

    if (this.playerTeam.length === 0) {
      alert('Place some units on your team first!');
      return;
    }

    // Generate enemy team (simplified - mirror player team)
    const enemyTeam = this.generateEnemyTeam();

    // Setup battle
    this.board.setupBattle(this.playerTeam, enemyTeam);

    // Calculate and apply traits
    this.traitsEngine.calculateActiveTraits(this.board.playerUnits);
    this.traitsEngine.applyTraitBonuses(this.board.playerUnits);

    // Start combat
    this.combatEngine.start();
    this.gameState = 'combat';

    this.updateUI();
  }

  generateEnemyTeam() {
    // Simple AI: random champions of similar strength
    const enemyTeam = [];
    const teamSize = Math.min(this.shop.playerLevel, this.playerTeam.length);

    for (let i = 0; i < teamSize; i++) {
      const randomChampion = getRandomElement(Object.values(CHAMPIONS_DATA));
      const unit = new Unit(randomChampion, 1, 'enemy');
      enemyTeam.push(unit);
    }

    return enemyTeam;
  }

  endCombat() {
    const winner = this.combatEngine.winner;

    if (winner === 'player') {
      console.log('Victory!');
    } else if (winner === 'enemy') {
      console.log('Defeat!');
      this.playerHP -= 10;
    } else {
      console.log('Draw!');
    }

    // Return to prep phase
    this.gameState = 'prep';
    this.round++;

    // Give gold and interest
    this.shop.startOfRound();

    // Re-roll shop
    this.shop.generateShop();

    // Reset board
    this.board.reset();

    this.updateUI();
    this.updateShopDisplay();
  }

  updateUI() {
    document.getElementById('round-display').textContent = `Round: ${this.round}`;
    document.getElementById('gold-display').textContent = `Gold: ${this.shop.gold}`;
    document.getElementById('hp-display').textContent = `HP: ${this.playerHP}`;
    document.getElementById('phase-display').textContent = `Phase: ${this.gameState}`;

    // Update traits display
    const activeTraits = this.traitsEngine.getActiveTraitsDisplay();
    const traitsContainer = document.getElementById('active-traits');
    traitsContainer.innerHTML = '';

    activeTraits.forEach(trait => {
      const div = document.createElement('div');
      div.className = 'trait-item active';
      div.innerHTML = `<strong>${trait.name} (${trait.count})</strong><br>${trait.description}`;
      traitsContainer.appendChild(div);
    });

    // Update button states
    const startBtn = document.getElementById('start-combat-btn');
    const rerollBtn = document.getElementById('reroll-shop-btn');
    const levelBtn = document.getElementById('level-up-btn');

    if (this.gameState === 'combat') {
      startBtn.disabled = true;
      rerollBtn.disabled = true;
      levelBtn.disabled = true;
    } else {
      startBtn.disabled = false;
      rerollBtn.disabled = this.shop.gold < GAME_CONSTANTS.ECONOMY.REROLL_COST;

      const levelCost = GAME_CONSTANTS.ECONOMY.LEVEL_UP_COSTS[this.shop.playerLevel - 1];
      levelBtn.disabled = this.shop.playerLevel >= 9 || this.shop.gold < (levelCost || 999);
      levelBtn.textContent = `Level Up (${levelCost || '-'}g)`;
    }
  }

  updateShopDisplay() {
    const shopContainer = document.getElementById('shop-slots');
    shopContainer.innerHTML = '';

    this.shop.currentShop.forEach((item, index) => {
      if (!item) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-slot';
        emptyDiv.textContent = 'Sold';
        shopContainer.appendChild(emptyDiv);
        return;
      }

      const card = this.createChampionCard(item.championData, () => {
        if (this.shop.buyChampion(index)) {
          this.updateShopDisplay();
          this.updateBenchDisplay();
          this.updateUI();
        }
      });

      shopContainer.appendChild(card);
    });
  }

  updateBenchDisplay() {
    const benchContainer = document.getElementById('bench-slots');
    benchContainer.innerHTML = '';

    this.shop.bench.forEach((unit) => {
      const card = this.createChampionCard(unit.championData, null, unit);

      // Right-click to sell
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (this.shop.sellChampion(unit)) {
          this.updateBenchDisplay();
          this.updateUI();
        }
      });

      benchContainer.appendChild(card);
    });

    // Fill empty slots
    for (let i = this.shop.bench.length; i < this.shop.maxBenchSize; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-slot';
      benchContainer.appendChild(emptyDiv);
    }
  }

  createChampionCard(championData, onClick = null, unit = null) {
    const card = document.createElement('div');
    card.className = 'champion-card';

    const costDiv = document.createElement('div');
    costDiv.className = 'cost';
    costDiv.textContent = championData.tier;
    card.appendChild(costDiv);

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = championData.name;
    card.appendChild(nameDiv);

    if (unit) {
      const starsDiv = document.createElement('div');
      starsDiv.className = 'stars';
      starsDiv.textContent = unit.getStarString();
      card.appendChild(starsDiv);
    }

    const traitsDiv = document.createElement('div');
    traitsDiv.className = 'traits';
    championData.traits.forEach(traitId => {
      const traitTag = document.createElement('div');
      traitTag.className = 'trait-tag';
      traitTag.textContent = traitId;
      traitsDiv.appendChild(traitTag);
    });
    card.appendChild(traitsDiv);

    if (onClick) {
      card.addEventListener('click', onClick);
    }

    return card;
  }

  showUnitDetails(unit) {
    const detailsPanel = document.getElementById('unit-details');
    detailsPanel.style.display = 'block';

    document.getElementById('unit-name').textContent = unit.name;
    document.getElementById('unit-title').textContent = unit.title;

    const statsDiv = document.getElementById('unit-stats');
    statsDiv.innerHTML = `
      <div><strong>HP:</strong> ${Math.floor(unit.hp)} / ${Math.floor(unit.maxHp)}</div>
      <div><strong>Attack Damage:</strong> ${Math.floor(unit.attackDamage)}</div>
      <div><strong>Attack Speed:</strong> ${unit.attackSpeed.toFixed(2)}</div>
      <div><strong>Armor:</strong> ${Math.floor(unit.armor)}</div>
      <div><strong>Magic Resist:</strong> ${Math.floor(unit.magicResist)}</div>
      <div><strong>Range:</strong> ${unit.range}</div>
      <div><strong>Star Level:</strong> ${unit.getStarString()}</div>
    `;

    const abilitiesDiv = document.getElementById('unit-abilities');
    abilitiesDiv.innerHTML = `
      <div><strong>Echo Rhythm:</strong> ${unit.championData.echoRhythm.description}</div>
      <div><strong>Mark Detonation:</strong> ${unit.championData.timeMarkDetonation.description}</div>
      <div><strong>Fractured Advance:</strong> ${unit.championData.fracturedAdvance.description}</div>
    `;

    // Close on click outside
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
