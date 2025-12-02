# TechFights - Wave Survival Auto Battler

A roguelike wave-survival auto-battler where you build a team of tech-themed champions and fight to survive 15 increasingly difficult waves!

## Game Overview

**Goal**: Survive 15 waves and defeat the final BOSS to win!

**Core Loop**:
1. Start with 2 random champions
2. Fight auto-battle waves
3. Win → Choose 1 of 3 rewards
4. Repeat until wave 15
5. Defeat the BOSS or lose!

## How to Play

### Starting Out
- You begin with 2 random champions
- Click **"Start Run"** to begin your attempt
- Positioning is **automatic** based on champion roles

### Combat
- Click **"Start Wave"** to begin the battle
- Units fight automatically
- Each champion has:
  - **Basic attacks** that deal damage and generate mana
  - **One powerful ability** that casts when mana is full

### After Each Wave
Choose **ONE reward**:
- 📦 **New Champion** - Add a random champion to your team
- ⭐ **Upgrade** - Increase a champion's star level (more HP, damage, ability power)
- ❤️ **Heal** - Restore player HP

### Win Condition
- Reach and defeat Wave 15 (the BOSS wave)
- If your HP reaches 0, you lose and must restart

## Champions (9 Total)

### Tanks
- **Kernel** - Gains shield and taunts all enemies
- **Firewall** - Shields entire team

### DPS (Damage Dealers)
- **Cache** - Massive single-target burst damage
- **Packet** - Rapid multi-strike attacks
- **Quantum** - AoE damage with slow

### Supports
- **Proxy** - Heals all allies
- **Overclock** - Buffs team attack speed

### Control
- **Glitch** - AoE stun
- **Node** - Cone damage with silence

## Star Levels

Combine units through upgrades to increase their star level:
- **1★** - Base stats
- **2★** - 1.8x HP, 1.4x Damage
- **3★** - 2.6x HP, 2.0x Damage

## Tips & Strategy

1. **Balance your team** - Mix tanks, damage, and support
2. **Upgrade strategically** - A 3★ unit is often better than multiple 1★ units
3. **Watch your HP** - Losing reduces HP; heal when needed
4. **Boss preparation** - Wave 15 is MUCH harder than other waves

## Controls

- **Start Wave** - Begin combat
- **Click units** - View detailed stats and abilities
- **Choose rewards** - Pick one after each victory

## Running the Game

Simply open `index.html` in any modern web browser. No build process required!

## Technical Details

Built with:
- Vanilla JavaScript
- HTML5 Canvas for rendering
- No external dependencies

## Game Structure

```
teamfighty/
├── index.html          # Main game page
├── style.css           # Modern UI styling
├── game.js             # Wave-based game controller
├── data/
│   └── champions.js    # 9 champions with simplified abilities
└── engine/
    ├── constants.js    # Game configuration
    ├── utils.js        # Helper functions
    ├── unit.js         # Champion logic
    ├── board.js        # Grid management
    ├── combat.js       # Battle engine
    └── renderer.js     # Canvas rendering
```

## Design Philosophy

- **Simple to understand** - One ability per champion, clear effects
- **Quick rounds** - Each wave is fast-paced
- **Meaningful choices** - Reward selection matters
- **Clear progression** - Wave 1/15 → constant feedback
- **Automatic positioning** - No manual micromanagement

---

**Can you survive all 15 waves? Good luck!** 🎮