// Champion data for TechFights
const CHAMPIONS_DATA = {
  "node": {
    "id": "node",
    "name": "Node",
    "title": "The Fractured Process",
    "tier": 2,
    "range": 1,
    "manaCost": 100,
    "baseStats": {
      "hp": 650,
      "attackDamage": 55,
      "attackSpeed": 0.7,
      "armor": 35,
      "magicResist": 35,
      "moveSpeed": 1.5,
      "manaMax": 100,
      "manaOnAttack": 10,
      "manaOnHitTaken": 7
    },
    "traits": ["Chrono", "Skirmisher"],
    "echoRhythm": {
      "name": "Echo Hit",
      "description": "Every 3rd basic attack deals 150% of Node's Attack Damage and applies 1 Time Mark.",
      "damageMultiplier": 1.5
    },
    "timeMarkDetonation": {
      "name": "Stability Overflow",
      "description": "At 3 Time Marks, deal magic damage and grant Node a shield for 2s.",
      "damage": { "type": "magic", "starValues": [75, 120, 180] },
      "shieldSelf": { "starValues": [75, 120, 180], "duration": 2.0 }
    },
    "fracturedAdvance": {
      "name": "Jump Thread",
      "description": "Anchor → dash through units to the highest-HP enemy in medium range, damaging and marking enemies passed through. After ~2s, rewind to Anchor and detonate all Node-applied Marks on enemies damaged by this cast.",
      "duration": 2.0,
      "dashDamage": { "type": "magic", "starValues": [150, 240, 360] },
      "marksAppliedOnDash": 1,
      "detonationScope": "enemiesDamagedByAbility"
    }
  },
  "kernel": {
    "id": "kernel",
    "name": "Kernel",
    "title": "The Core Defender",
    "tier": 3,
    "range": 1,
    "manaCost": 100,
    "baseStats": {
      "hp": 850,
      "attackDamage": 50,
      "attackSpeed": 0.65,
      "armor": 50,
      "magicResist": 50,
      "moveSpeed": 1.2,
      "manaMax": 100,
      "manaOnAttack": 8,
      "manaOnHitTaken": 10
    },
    "traits": ["Security", "Vanguard"],
    "echoRhythm": {
      "name": "Parity Slam",
      "description": "Every 3rd attack deals 125% AD and grants a small shield for 1.5s.",
      "damageMultiplier": 1.25,
      "shieldSelf": { "starValues": [60, 90, 135], "duration": 1.5 }
    },
    "timeMarkDetonation": {
      "name": "Panic Interrupt",
      "description": "At 3 Marks, deal magic damage, Taunt the target, and grant Kernel damage reduction.",
      "damage": { "type": "magic", "starValues": [50, 80, 120] },
      "taunt": { "duration": 0.75 },
      "damageReductionSelf": { "percentValues": [0.10, 0.15, 0.20], "duration": 3.0 }
    },
    "fracturedAdvance": {
      "name": "Core Crash",
      "description": "Anchor → charge to the enemy with the most nearby allies, slam in a small AoE (damage, mark, mini-stun). After ~3s frontline, rewind and detonate all Marks applied with this cast.",
      "duration": 3.0,
      "slamDamage": { "type": "magic", "starValues": [125, 200, 300] },
      "miniStun": { "duration": 0.25 },
      "marksAppliedOnSlam": 1,
      "detonationScope": "enemiesHitBySlam"
    }
  },
  "cache": {
    "id": "cache",
    "name": "Cache",
    "title": "The Stored Burst",
    "tier": 3,
    "range": 3,
    "manaCost": 100,
    "baseStats": {
      "hp": 550,
      "attackDamage": 70,
      "attackSpeed": 0.8,
      "armor": 25,
      "magicResist": 25,
      "moveSpeed": 1.3,
      "manaMax": 100,
      "manaOnAttack": 12,
      "manaOnHitTaken": 5
    },
    "traits": ["Throughput", "Marksman"],
    "echoRhythm": {
      "name": "Cache Write",
      "description": "Every 3rd attack stores 40% of its damage as Cached Damage on the target and applies 1 Time Mark.",
      "cachedDamagePercent": 0.40
    },
    "timeMarkDetonation": {
      "name": "Read Burst",
      "description": "At 3 Marks, release all Cached Damage as bonus magic damage (plus base) and grant Cache bonus attack speed.",
      "baseDamage": { "type": "magic", "starValues": [100, 160, 240] },
      "consumeCachedDamage": true,
      "attackSpeedBuffSelf": { "percentValues": [0.30, 0.45, 0.60], "duration": 3.0 }
    },
    "fracturedAdvance": {
      "name": "Burst Fetch",
      "description": "Anchor → blink to a flank position at max range from the farthest enemy, fire multi-shot at up to 3 enemies (damage, cache, mark), then rewind and detonate Marks applied by this cast.",
      "shotsPerTarget": 1,
      "maxTargets": 3,
      "shotDamage": { "type": "magic", "starValues": [60, 95, 145] },
      "marksAppliedPerHit": 1,
      "addCachedDamageOnHit": true,
      "detonationScope": "enemiesHitByAbility"
    }
  },
  "packet": {
    "id": "packet",
    "name": "Packet",
    "title": "The Rogue Signal",
    "tier": 2,
    "range": 1,
    "manaCost": 100,
    "baseStats": {
      "hp": 600,
      "attackDamage": 65,
      "attackSpeed": 0.85,
      "armor": 30,
      "magicResist": 30,
      "moveSpeed": 1.6,
      "manaMax": 100,
      "manaOnAttack": 11,
      "manaOnHitTaken": 6
    },
    "traits": ["Exploit", "Assassin"],
    "echoRhythm": {
      "name": "Packet Spike",
      "description": "Every 3rd attack deals 140% AD. If the target dies within 1s, one of its remaining Time Marks jumps to a nearby enemy.",
      "damageMultiplier": 1.4,
      "markJumpOnKill": { "window": 1.0, "marksJumped": 1, "radius": 2 }
    },
    "timeMarkDetonation": {
      "name": "Chain Routing",
      "description": "At 3 Marks, deal magic damage, then chain splash damage and Marks to up to 2 nearby enemies.",
      "primaryDamage": { "type": "magic", "starValues": [100, 160, 240] },
      "chain": {
        "maxTargets": 2,
        "damage": { "type": "magic", "starValues": [40, 65, 100] },
        "marksAppliedPerTarget": 1,
        "radius": 2
      }
    },
    "fracturedAdvance": {
      "name": "Backdoor Jump",
      "description": "Anchor → teleport behind the farthest enemy and rapidly slash them 3 times (each hit applies 1 Mark), then dash to up to 2 nearby low-HP enemies (1 hit + 1 Mark each). Rewind and detonate all Marks applied by this cast.",
      "primaryHits": 3,
      "secondaryTargets": 2,
      "secondaryHitsPerTarget": 1,
      "hitDamage": { "type": "magic", "starValues": [75, 120, 180] },
      "marksAppliedPerHit": 1,
      "detonationScope": "enemiesHitByAbility"
    }
  },
  "firewall": {
    "id": "firewall",
    "name": "Firewall",
    "title": "The Security Protocol",
    "tier": 2,
    "range": 2,
    "manaCost": 100,
    "baseStats": {
      "hp": 600,
      "attackDamage": 45,
      "attackSpeed": 0.75,
      "armor": 30,
      "magicResist": 40,
      "moveSpeed": 1.3,
      "manaMax": 100,
      "manaOnAttack": 10,
      "manaOnHitTaken": 8
    },
    "traits": ["Security", "Controller"],
    "echoRhythm": {
      "name": "Port Scan",
      "description": "Every 3rd attack deals bonus magic damage in a small radius around the target and applies 1 Time Mark to all enemies hit.",
      "aoeRadius": 1,
      "bonusDamage": { "type": "magic", "starValues": [40, 60, 90] }
    },
    "timeMarkDetonation": {
      "name": "Burn Segment",
      "description": "At 3 Marks, ignite the target (and nearby enemies) for 3s, dealing burn damage and reducing attack speed.",
      "burn": {
        "type": "magic",
        "duration": 3.0,
        "totalDamageStarValues": [75, 120, 180]
      },
      "attackSpeedSlow": { "percentValues": [0.20, 0.30, 0.40], "duration": 3.0 },
      "spreadRadius": 1
    },
    "fracturedAdvance": {
      "name": "Line of Defense",
      "description": "Anchor → place a Firewall line for 4s. Enemies that touch it take damage, are heavily slowed, and gain 1 Mark. When the line expires, rewind and detonate all Marks applied via the line.",
      "lineDuration": 4.0,
      "touchDamage": { "type": "magic", "starValues": [50, 80, 120] },
      "slow": { "percent": 0.5, "duration": 0.5 },
      "marksAppliedOnTouch": 1,
      "detonationScope": "enemiesThatTouchedLine"
    }
  },
  "quantum": {
    "id": "quantum",
    "name": "Quantum",
    "title": "The Time Debugger",
    "tier": 3,
    "range": 1,
    "manaCost": 100,
    "baseStats": {
      "hp": 700,
      "attackDamage": 60,
      "attackSpeed": 0.75,
      "armor": 40,
      "magicResist": 40,
      "moveSpeed": 1.4,
      "manaMax": 100,
      "manaOnAttack": 9,
      "manaOnHitTaken": 8
    },
    "traits": ["Chrono", "Controller"],
    "echoRhythm": {
      "name": "Phase Hit",
      "description": "Every 3rd attack deals bonus magic damage. If the target already has at least 1 Time Mark from Quantum, it is slowed.",
      "bonusDamage": { "type": "magic", "starValues": [30, 45, 70] },
      "conditionalSlow": { "percent": 0.30, "duration": 1.0 }
    },
    "timeMarkDetonation": {
      "name": "Phase Break",
      "description": "At 3 Marks, deal magic damage and apply Phase-Broken, increasing damage taken.",
      "damage": { "type": "magic", "starValues": [100, 160, 240] },
      "damageAmp": { "percent": 0.25, "duration": 3.0 }
    },
    "fracturedAdvance": {
      "name": "Time Bubble",
      "description": "Anchor → blink to the center of the largest enemy cluster, creating a 3s Time Bubble that slows enemies and causes Quantum to apply an extra Mark on hit. On expiry, rewind and detonate all Marks on enemies that were inside.",
      "bubbleDuration": 3.0,
      "bubbleRadius": 2,
      "bubbleSlow": { "percent": 0.40 },
      "extraMarksPerHitInsideBubble": 1,
      "entryDamage": { "type": "magic", "starValues": [60, 95, 145] },
      "detonationScope": "enemiesEverInsideBubble"
    }
  },
  "overclock": {
    "id": "overclock",
    "name": "Overclock",
    "title": "The Speed Surge",
    "tier": 1,
    "range": 1,
    "manaCost": 100,
    "baseStats": {
      "hp": 550,
      "attackDamage": 50,
      "attackSpeed": 0.8,
      "armor": 25,
      "magicResist": 25,
      "moveSpeed": 1.5,
      "manaMax": 100,
      "manaOnAttack": 12,
      "manaOnHitTaken": 6
    },
    "traits": ["Throughput", "Skirmisher"],
    "echoRhythm": {
      "name": "Clock Pulse",
      "description": "Every 3rd attack deals slightly increased damage and grants Overclock bonus attack speed for 2s.",
      "damageMultiplier": 1.2,
      "attackSpeedBuffSelf": { "percentValues": [0.20, 0.25, 0.30], "duration": 2.0 }
    },
    "timeMarkDetonation": {
      "name": "Hyperthread",
      "description": "At 3 Marks, deal magic damage and grant nearby allies attack and move speed.",
      "damage": { "type": "magic", "starValues": [50, 80, 120] },
      "buffRadius": 2,
      "attackSpeedBuffAllies": { "percentValues": [0.20, 0.30, 0.40], "duration": 3.0 },
      "moveSpeedBuffAllies": { "percentValues": [0.10, 0.15, 0.20], "duration": 3.0 }
    },
    "fracturedAdvance": {
      "name": "Turbo Step",
      "description": "Anchor → dash to nearest ally, spinning on arrival to damage and mark nearby enemies. After ~2s, rewind and detonate Marks applied with this cast.",
      "duration": 2.0,
      "spinRadius": 1,
      "spinDamage": { "type": "magic", "starValues": [100, 160, 240] },
      "marksAppliedPerEnemy": 1,
      "detonationScope": "enemiesHitBySpin"
    }
  },
  "glitch": {
    "id": "glitch",
    "name": "Glitch",
    "title": "The Fault Injection",
    "tier": 1,
    "range": 2,
    "manaCost": 100,
    "baseStats": {
      "hp": 500,
      "attackDamage": 45,
      "attackSpeed": 0.7,
      "armor": 20,
      "magicResist": 30,
      "moveSpeed": 1.4,
      "manaMax": 100,
      "manaOnAttack": 11,
      "manaOnHitTaken": 7
    },
    "traits": ["Exploit", "Controller"],
    "echoRhythm": {
      "name": "Fault Ping",
      "description": "Every 3rd attack deals bonus magic damage and briefly slows the target.",
      "bonusDamage": { "type": "magic", "starValues": [30, 45, 70] },
      "slow": { "percent": 0.30, "duration": 1.0 }
    },
    "timeMarkDetonation": {
      "name": "System Crash",
      "description": "At 3 Marks, deal magic damage and stun the target, then leave a lingering slow.",
      "damage": { "type": "magic", "starValues": [50, 80, 120] },
      "stun": { "durationValues": [1.0, 1.25, 1.5] },
      "postStunSlow": { "percent": 0.30, "duration": 2.0 }
    },
    "fracturedAdvance": {
      "name": "Bug Spread",
      "description": "Anchor → blink to the edge of the largest enemy cluster, emit 3 shockwaves that damage and mark enemies. Rewind and detonate Marks applied via these waves.",
      "waves": 3,
      "waveInterval": 0.5,
      "waveRadius": 2,
      "waveDamage": { "type": "magic", "starValues": [75, 120, 180] },
      "marksAppliedPerWaveHit": 1,
      "detonationScope": "enemiesHitByWaves"
    }
  },
  "proxy": {
    "id": "proxy",
    "name": "Proxy",
    "title": "The Remote Support",
    "tier": 1,
    "range": 3,
    "manaCost": 100,
    "baseStats": {
      "hp": 500,
      "attackDamage": 40,
      "attackSpeed": 0.7,
      "armor": 20,
      "magicResist": 25,
      "moveSpeed": 1.3,
      "manaMax": 100,
      "manaOnAttack": 10,
      "manaOnHitTaken": 8
    },
    "traits": ["Throughput", "Support"],
    "echoRhythm": {
      "name": "Relay Shot",
      "description": "Every 3rd attack deals bonus magic damage and heals the lowest-HP nearby ally for a portion of the damage dealt.",
      "bonusDamage": { "type": "magic", "starValues": [30, 45, 70] },
      "healPercentOfDamage": 0.60,
      "healRadius": 2
    },
    "timeMarkDetonation": {
      "name": "Signal Return",
      "description": "At 3 Marks, deal magic damage to the enemy and heal nearby allies for a portion of that damage.",
      "damage": { "type": "magic", "starValues": [50, 80, 120] },
      "allyHealPercentOfDamage": 0.60,
      "allyHealRadius": 1
    },
    "fracturedAdvance": {
      "name": "Forward Node",
      "description": "Anchor → blink near the lowest-HP ally, emit healing pulses that also damage and Mark nearby enemies. Rewind and detonate Marks applied with this cast.",
      "pulses": 3,
      "pulseInterval": 1.0,
      "pulseRadius": 2,
      "pulseHeal": { "starValues": [60, 95, 145] },
      "pulseDamage": { "type": "magic", "starValues": [40, 65, 100] },
      "marksAppliedPerEnemy": 1,
      "detonationScope": "enemiesHitByPulses"
    }
  }
};
