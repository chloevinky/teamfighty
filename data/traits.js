// Trait data for TechFights
const TRAITS_DATA = {
  // ORIGINS (Protocols)
  "Chrono": {
    "id": "Chrono",
    "type": "origin",
    "name": "Chrono",
    "description": "Time-manipulating units",
    "breakpoints": [
      {
        "minUnits": 2,
        "description": "Chrono units' Echo (3rd) attack applies +1 extra Time Mark (2 total).",
        "effects": ["double_mark_on_echo"]
      },
      {
        "minUnits": 3,
        "description": "When a Chrono unit casts Fractured Advance, it instantly applies 1 Time Mark to all enemies within 2 hexes of its landing point.",
        "effects": ["mark_on_fractured_landing"]
      }
    ]
  },
  "Throughput": {
    "id": "Throughput",
    "type": "origin",
    "name": "Throughput",
    "description": "High-output sustain units",
    "breakpoints": [
      {
        "minUnits": 2,
        "description": "When a Throughput unit detonates Time Marks, it and the nearest ally gain +20% Attack Speed for 3s.",
        "effects": ["as_on_mark_detonate"]
      },
      {
        "minUnits": 3,
        "description": "Each Throughput Mark detonation restores 5 mana to all Throughput allies. The first Throughput Mark detonation each combat heals your team for 5% of their missing HP.",
        "effects": ["mana_and_team_heal"]
      }
    ]
  },
  "Security": {
    "id": "Security",
    "type": "origin",
    "name": "Security",
    "description": "Defensive protocol units",
    "breakpoints": [
      {
        "minUnits": 2,
        "description": "Security units gain +15% Armor and MR. Their CC duration is increased by 15%.",
        "effects": ["tank_and_cc"]
      },
      {
        "minUnits": 3,
        "description": "When a Security unit detonates Time Marks, it gains a shield equal to 6% of its max HP for 3s and 20% damage reduction for 2s.",
        "effects": ["shield_on_detonate"]
      }
    ]
  },
  "Exploit": {
    "id": "Exploit",
    "type": "origin",
    "name": "Exploit",
    "description": "Vulnerability-seeking units",
    "breakpoints": [
      {
        "minUnits": 2,
        "description": "Exploit units' Mark detonations deal extra damage equal to 8% of the target's missing HP (magic).",
        "effects": ["missing_hp_damage"]
      },
      {
        "minUnits": 3,
        "description": "Mark detonations from Exploit units apply 20% Armor and MR shred for 4s.",
        "effects": ["armor_mr_shred"]
      }
    ]
  },

  // CLASSES (Modules)
  "Skirmisher": {
    "id": "Skirmisher",
    "type": "class",
    "name": "Skirmisher",
    "description": "Mobile fighters",
    "breakpoints": []
  },
  "Vanguard": {
    "id": "Vanguard",
    "type": "class",
    "name": "Vanguard",
    "description": "Frontline tanks",
    "breakpoints": []
  },
  "Marksman": {
    "id": "Marksman",
    "type": "class",
    "name": "Marksman",
    "description": "Ranged DPS",
    "breakpoints": []
  },
  "Assassin": {
    "id": "Assassin",
    "type": "class",
    "name": "Assassin",
    "description": "Backline bursters",
    "breakpoints": []
  },
  "Controller": {
    "id": "Controller",
    "type": "class",
    "name": "Controller",
    "description": "AoE control specialists",
    "breakpoints": []
  },
  "Bruiser": {
    "id": "Bruiser",
    "type": "class",
    "name": "Bruiser",
    "description": "Tanky damage dealers",
    "breakpoints": []
  },
  "Support": {
    "id": "Support",
    "type": "class",
    "name": "Support",
    "description": "Healing and buffing units",
    "breakpoints": []
  }
};
