# TechFights - Grid-Based Auto Battler

A browser-based auto-battler game featuring tech-themed champions with unique time-manipulation mechanics.

## Game Overview

TechFights is a tactical auto-battler where players build teams of tech-themed champions that fight automatically. The game features:

- **Echo Rhythm**: Every 3rd basic attack is special and applies Time Marks
- **Time Marks**: Units with 3 Time Marks detonate with powerful effects
- **Fractured Advance**: All champions use a variation of dash → fight → rewind back ability
- **Traits System**: Origins (Chrono, Throughput, Security, Exploit) and Classes provide synergy bonuses

## How to Play

1. **Prep Phase**:
   - Buy champions from the shop (costs gold)
   - Place champions on your bench
   - Every 3 copies of the same champion combine into a higher star level (★★★)
   - Spend gold to reroll the shop or level up

2. **Combat Phase**:
   - Click "Start Combat" to begin
   - Watch your team fight automatically
   - Units attack, gain mana, and cast abilities
   - Every 3rd attack applies Time Marks
   - When a unit gets 3 Time Marks, they detonate with special effects

3. **Economy**:
   - Earn gold each round
   - Get interest on saved gold (1 gold per 10 gold, max 5)
   - Spend wisely on champions, rerolls, and leveling

## Champions

The game includes champions across 5 cost tiers:

**Tier 1**: Overclock, Glitch, Proxy
**Tier 2**: Node, Packet, Firewall
**Tier 3**: Kernel, Cache, Quantum
**Tier 4**: Rootkit, Sandbox (not yet in initial data)
**Tier 5**: Coming soon!

Each champion has:
- Unique Echo Rhythm (3rd attack effect)
- Custom Time Mark detonation
- Signature Fractured Advance ability

## Traits

### Origins (Protocols)
- **Chrono**: Time manipulation, extra marks on echo attacks
- **Throughput**: High sustain, attack speed on detonation
- **Security**: Tank stats, shields and damage reduction
- **Exploit**: Execute damage, armor shredding

### Classes (Modules)
- **Skirmisher**: Mobile fighters
- **Vanguard**: Frontline tanks
- **Marksman**: Ranged DPS
- **Assassin**: Backline burst
- **Controller**: AoE control
- **Support**: Healing and buffs

## Controls

- **Click** shop champions to buy them
- **Right-click** bench champions to sell them
- **Click** units on the board to see their details
- **Start Combat** to begin the battle phase
- **Reroll Shop** (2 gold) to refresh available champions
- **Level Up** to increase max team size

## File Structure

```
teamfighty/
├── index.html          # Main HTML page
├── style.css           # Game styling
├── game.js             # Main game controller
├── data/
│   ├── champions.js    # Champion data and abilities
│   └── traits.js       # Trait definitions
└── engine/
    ├── constants.js    # Game constants
    ├── utils.js        # Helper functions
    ├── unit.js         # Unit class
    ├── board.js        # Board management
    ├── combat.js       # Combat engine
    ├── timemarks.js    # Time Marks system
    ├── traits-engine.js # Traits calculations
    ├── shop.js         # Shop and economy
    └── renderer.js     # Canvas rendering
```

## Running the Game

Simply open `index.html` in a modern web browser. No build process required!

## Implemented Features

✅ Core game loop (prep → combat → prep)
✅ Champion shop and economy system
✅ Echo Rhythm (every 3rd attack)
✅ Time Marks tracking and detonation
✅ Basic combat (movement, targeting, attacking)
✅ Mana system and ability casting
✅ Fractured Advance abilities
✅ Traits system (Origins)
✅ Star level upgrades (3 copies → ★★)
✅ Canvas rendering with health/mana bars

## Future Enhancements

- More sophisticated pathfinding
- Enhanced visual effects and animations
- Sound effects and music
- More champions (Tier 4-5)
- Class trait bonuses implementation
- PvP matchmaking
- Progression and ranked system
- Mobile responsive controls

## Design Document

See the original design document for complete game mechanics, all champion abilities, and detailed trait effects.

---

**TechFights** - Where code becomes combat!
