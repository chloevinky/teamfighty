// Game constants
const GAME_CONSTANTS = {
  // Board dimensions
  BOARD: {
    COLS: 6,
    ROWS: 4,
    TILE_SIZE: 100,
    TILE_GAP: 10,
    PLAYER_ROWS: [2, 3], // Bottom 2 rows
    ENEMY_ROWS: [0, 1]    // Top 2 rows
  },

  // Combat timing
  COMBAT: {
    MAX_DURATION: 45, // seconds
    UPDATE_RATE: 60,  // FPS
    DELTA_TIME: 1 / 60
  },

  // Star level multipliers
  STAR_MULTIPLIERS: {
    1: { hp: 1.0, ad: 1.0 },
    2: { hp: 1.5, ad: 1.25 },
    3: { hp: 2.0, ad: 1.6 },
    4: { hp: 2.6, ad: 2.0 }
  },

  // Economy
  ECONOMY: {
    STARTING_GOLD: 10,
    STARTING_HP: 100,
    REROLL_COST: 2,
    LEVEL_UP_COSTS: [4, 8, 12, 16, 20, 24, 28, 32, 36],
    INTEREST_RATE: 0.1, // 1 gold per 10 gold
    MAX_INTEREST: 5,
    BENCH_SIZE: 9
  },

  // Shop odds by level (tier 1-5 champions)
  SHOP_ODDS: {
    1: [1.00, 0.00, 0.00, 0.00, 0.00],
    2: [1.00, 0.00, 0.00, 0.00, 0.00],
    3: [0.75, 0.25, 0.00, 0.00, 0.00],
    4: [0.55, 0.30, 0.15, 0.00, 0.00],
    5: [0.45, 0.33, 0.20, 0.02, 0.00],
    6: [0.30, 0.40, 0.25, 0.05, 0.00],
    7: [0.19, 0.35, 0.35, 0.10, 0.01],
    8: [0.15, 0.25, 0.40, 0.18, 0.02],
    9: [0.10, 0.15, 0.40, 0.30, 0.05]
  },

  // Echo Rhythm
  ECHO: {
    ATTACK_COUNT: 3, // Every 3rd attack
    TIME_MARKS_TO_DETONATE: 3
  },

  // Visual
  COLORS: {
    TILE_PLAYER: 'rgba(0, 100, 255, 0.2)',
    TILE_ENEMY: 'rgba(255, 50, 50, 0.2)',
    TILE_GRID: 'rgba(255, 255, 255, 0.1)',
    UNIT_PLAYER: '#00d4ff',
    UNIT_ENEMY: '#ff5050',
    HP_BAR: '#00ff00',
    HP_BAR_BG: '#333',
    MANA_BAR: '#00d4ff',
    MANA_BAR_BG: '#333',
    SHIELD: '#ffff00',
    MARK: '#ff00ff'
  },

  // Unit rendering
  UNIT: {
    RADIUS: 35,
    BAR_WIDTH: 60,
    BAR_HEIGHT: 6,
    BAR_OFFSET: 45
  }
};
