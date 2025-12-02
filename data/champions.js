// Simplified champion data for wave-based TechFights
const CHAMPIONS_DATA = {
  // TANKS
  "kernel": {
    "id": "kernel",
    "name": "Kernel",
    "role": "Tank",
    "baseStats": {
      "hp": 800,
      "attackDamage": 40,
      "attackSpeed": 0.6,
      "armor": 50,
      "range": 1,
      "moveSpeed": 1.2,
      "manaMax": 100,
      "manaPerAttack": 15
    },
    "ability": {
      "name": "Core Shield",
      "description": "Gain a large shield and taunt all enemies for 2s",
      "effect": "shield_and_taunt",
      "shieldAmount": [200, 350, 500],
      "tauntDuration": 2.0
    }
  },
  "firewall": {
    "id": "firewall",
    "name": "Firewall",
    "role": "Tank",
    "baseStats": {
      "hp": 700,
      "attackDamage": 35,
      "attackSpeed": 0.65,
      "armor": 45,
      "range": 1,
      "moveSpeed": 1.3,
      "manaMax": 100,
      "manaPerAttack": 12
    },
    "ability": {
      "name": "Barrier Wall",
      "description": "All allies gain shields",
      "effect": "team_shield",
      "shieldAmount": [100, 175, 250]
    }
  },

  // DAMAGE DEALERS
  "cache": {
    "id": "cache",
    "name": "Cache",
    "role": "DPS",
    "baseStats": {
      "hp": 500,
      "attackDamage": 80,
      "attackSpeed": 0.85,
      "armor": 20,
      "range": 3,
      "moveSpeed": 1.4,
      "manaMax": 100,
      "manaPerAttack": 20
    },
    "ability": {
      "name": "Burst Shot",
      "description": "Deal massive damage to highest HP enemy",
      "effect": "single_target_burst",
      "damage": [300, 500, 750]
    }
  },
  "packet": {
    "id": "packet",
    "name": "Packet",
    "role": "DPS",
    "baseStats": {
      "hp": 550,
      "attackDamage": 70,
      "attackSpeed": 0.9,
      "armor": 25,
      "range": 1,
      "moveSpeed": 1.6,
      "manaMax": 100,
      "manaPerAttack": 18
    },
    "ability": {
      "name": "Chain Attack",
      "description": "Strike an enemy 3 times rapidly",
      "effect": "multi_strike",
      "strikes": 3,
      "damagePerStrike": [100, 175, 275]
    }
  },
  "quantum": {
    "id": "quantum",
    "name": "Quantum",
    "role": "DPS",
    "baseStats": {
      "hp": 600,
      "attackDamage": 65,
      "attackSpeed": 0.75,
      "armor": 30,
      "range": 2,
      "moveSpeed": 1.4,
      "manaMax": 100,
      "manaPerAttack": 16
    },
    "ability": {
      "name": "Time Blast",
      "description": "Damage all enemies and slow them",
      "effect": "aoe_damage_slow",
      "damage": [150, 250, 400],
      "slowPercent": 0.5,
      "slowDuration": 3.0
    }
  },

  // SUPPORTS
  "proxy": {
    "id": "proxy",
    "name": "Proxy",
    "role": "Support",
    "baseStats": {
      "hp": 450,
      "attackDamage": 35,
      "attackSpeed": 0.7,
      "armor": 20,
      "range": 3,
      "moveSpeed": 1.3,
      "manaMax": 100,
      "manaPerAttack": 14
    },
    "ability": {
      "name": "Healing Pulse",
      "description": "Heal all allies",
      "effect": "team_heal",
      "healAmount": [150, 250, 400]
    }
  },
  "overclock": {
    "id": "overclock",
    "name": "Overclock",
    "role": "Support",
    "baseStats": {
      "hp": 500,
      "attackDamage": 50,
      "attackSpeed": 0.8,
      "armor": 25,
      "range": 1,
      "moveSpeed": 1.5,
      "manaMax": 100,
      "manaPerAttack": 15
    },
    "ability": {
      "name": "Speed Boost",
      "description": "All allies gain 50% attack speed for 4s",
      "effect": "team_attack_speed",
      "bonusPercent": 0.5,
      "duration": 4.0
    }
  },

  // CONTROL
  "glitch": {
    "id": "glitch",
    "name": "Glitch",
    "role": "Control",
    "baseStats": {
      "hp": 450,
      "attackDamage": 40,
      "attackSpeed": 0.7,
      "armor": 20,
      "range": 2,
      "moveSpeed": 1.4,
      "manaMax": 100,
      "manaPerAttack": 13
    },
    "ability": {
      "name": "System Stun",
      "description": "Stun all enemies for 1.5s and deal damage",
      "effect": "aoe_stun",
      "damage": [100, 175, 275],
      "stunDuration": 1.5
    }
  },
  "node": {
    "id": "node",
    "name": "Node",
    "role": "Control",
    "baseStats": {
      "hp": 600,
      "attackDamage": 55,
      "attackSpeed": 0.7,
      "armor": 35,
      "range": 1,
      "moveSpeed": 1.5,
      "manaMax": 100,
      "manaPerAttack": 14
    },
    "ability": {
      "name": "Disruption",
      "description": "Damage and silence nearest enemies",
      "effect": "cone_damage_silence",
      "damage": [200, 325, 500],
      "silenceDuration": 3.0,
      "targetsHit": 3
    }
  }
};

// Simplified champion pool for drafting
const CHAMPION_POOL = Object.keys(CHAMPIONS_DATA);
