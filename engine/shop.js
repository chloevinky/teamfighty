// Shop and economy system
class Shop {
  constructor() {
    this.playerLevel = 1;
    this.gold = GAME_CONSTANTS.ECONOMY.STARTING_GOLD;
    this.currentShop = [];
    this.bench = [];
    this.maxBenchSize = GAME_CONSTANTS.ECONOMY.BENCH_SIZE;
    this.shopSize = 5;

    // Champion pool (simplified - would need proper pooling system)
    this.championPool = this.initializeChampionPool();
  }

  initializeChampionPool() {
    const pool = [];
    for (const championId in CHAMPIONS_DATA) {
      const champion = CHAMPIONS_DATA[championId];
      // Add copies based on tier (lower tier = more copies)
      const copies = [39, 26, 21, 13, 10][champion.tier - 1];
      for (let i = 0; i < copies; i++) {
        pool.push(championId);
      }
    }
    return pool;
  }

  rollShop() {
    if (this.gold < GAME_CONSTANTS.ECONOMY.REROLL_COST) {
      return false;
    }

    this.gold -= GAME_CONSTANTS.ECONOMY.REROLL_COST;
    this.generateShop();
    return true;
  }

  generateShop() {
    this.currentShop = [];

    const odds = GAME_CONSTANTS.SHOP_ODDS[this.playerLevel];

    for (let i = 0; i < this.shopSize; i++) {
      const tier = weightedRandom(odds) + 1;
      const champion = this.getRandomChampionOfTier(tier);
      if (champion) {
        this.currentShop.push({
          championId: champion.id,
          cost: champion.tier,
          championData: champion
        });
      }
    }
  }

  getRandomChampionOfTier(tier) {
    const championsOfTier = Object.values(CHAMPIONS_DATA).filter(c => c.tier === tier);
    return getRandomElement(championsOfTier) || null;
  }

  buyChampion(shopIndex) {
    if (shopIndex < 0 || shopIndex >= this.currentShop.length) {
      return false;
    }

    const shopItem = this.currentShop[shopIndex];
    if (!shopItem) return false;

    if (this.gold < shopItem.cost) {
      console.log('Not enough gold');
      return false;
    }

    if (this.bench.length >= this.maxBenchSize) {
      console.log('Bench is full');
      return false;
    }

    // Buy champion
    this.gold -= shopItem.cost;

    // Create unit instance
    const unit = new Unit(shopItem.championData, 1, 'player');
    this.bench.push(unit);

    // Remove from shop
    this.currentShop[shopIndex] = null;

    // Check for upgrades
    this.checkForUpgrades();

    return true;
  }

  sellChampion(unit) {
    // Remove from bench
    const index = this.bench.findIndex(u => u.id === unit.id);
    if (index === -1) return false;

    this.bench.splice(index, 1);

    // Refund gold (based on tier and star level)
    const refund = unit.tier * unit.starLevel;
    this.gold += refund;

    return true;
  }

  checkForUpgrades() {
    // Group champions by ID and star level
    const groups = {};

    this.bench.forEach(unit => {
      const key = `${unit.championId}_${unit.starLevel}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(unit);
    });

    // Check for 3-of-a-kind upgrades
    for (const key in groups) {
      const units = groups[key];
      if (units.length >= 3) {
        // Upgrade!
        const [championId, starLevel] = key.split('_');
        const newStarLevel = parseInt(starLevel) + 1;

        if (newStarLevel <= 3) {
          // Remove 3 units
          const unitsToRemove = units.slice(0, 3);
          unitsToRemove.forEach(unit => {
            const idx = this.bench.findIndex(u => u.id === unit.id);
            if (idx !== -1) this.bench.splice(idx, 1);
          });

          // Add upgraded unit
          const championData = CHAMPIONS_DATA[championId];
          const upgradedUnit = new Unit(championData, newStarLevel, 'player');
          this.bench.push(upgradedUnit);

          console.log(`Upgraded ${championId} to ${newStarLevel}★!`);

          // Check again recursively
          this.checkForUpgrades();
        }
      }
    }
  }

  levelUp() {
    if (this.playerLevel >= 9) return false;

    const cost = GAME_CONSTANTS.ECONOMY.LEVEL_UP_COSTS[this.playerLevel - 1];
    if (this.gold < cost) return false;

    this.gold -= cost;
    this.playerLevel++;

    return true;
  }

  addGold(amount) {
    this.gold += amount;
  }

  calculateInterest() {
    const interest = Math.floor(this.gold * GAME_CONSTANTS.ECONOMY.INTEREST_RATE);
    return Math.min(interest, GAME_CONSTANTS.ECONOMY.MAX_INTEREST);
  }

  startOfRound() {
    // Passive gold income
    this.addGold(5);

    // Interest
    const interest = this.calculateInterest();
    this.addGold(interest);

    console.log(`Round start: +5 gold, +${interest} interest`);
  }
}
