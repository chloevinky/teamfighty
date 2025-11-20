// Traits system - calculates active traits and applies bonuses
class TraitsEngine {
  constructor() {
    this.activeTraits = {};
  }

  calculateActiveTraits(units) {
    this.activeTraits = {};

    // Count trait occurrences
    const traitCounts = {};

    units.filter(u => !u.isDead).forEach(unit => {
      unit.traits.forEach(traitId => {
        if (!traitCounts[traitId]) {
          traitCounts[traitId] = 0;
        }
        traitCounts[traitId]++;
      });
    });

    // Determine active breakpoints
    for (const traitId in traitCounts) {
      const count = traitCounts[traitId];
      const traitData = TRAITS_DATA[traitId];

      if (!traitData || !traitData.breakpoints) continue;

      // Find highest active breakpoint
      let activeBreakpoint = null;
      for (const bp of traitData.breakpoints) {
        if (count >= bp.minUnits) {
          activeBreakpoint = bp;
        }
      }

      if (activeBreakpoint) {
        this.activeTraits[traitId] = {
          count,
          breakpoint: activeBreakpoint,
          effects: activeBreakpoint.effects
        };
      }
    }

    return this.activeTraits;
  }

  isTraitActive(traitId, minUnits = null) {
    if (!this.activeTraits[traitId]) return false;
    if (minUnits === null) return true;
    return this.activeTraits[traitId].count >= minUnits;
  }

  applyTraitBonuses(units) {
    units.forEach(unit => {
      // Add method to check traits on units
      unit.hasActiveTrait = (traitId, minUnits) => {
        return this.isTraitActive(traitId, minUnits);
      };
    });

    // Apply stat bonuses
    units.forEach(unit => {
      if (unit.isDead) return;

      // Security trait: +15% Armor and MR
      if (unit.traits.includes('Security') && this.isTraitActive('Security', 2)) {
        unit.armor *= 1.15;
        unit.magicResist *= 1.15;
      }

      // (Other trait stat bonuses would go here)
    });
  }

  getActiveTraitsDisplay() {
    const display = [];
    for (const traitId in this.activeTraits) {
      const trait = this.activeTraits[traitId];
      const traitData = TRAITS_DATA[traitId];
      display.push({
        id: traitId,
        name: traitData.name,
        count: trait.count,
        description: trait.breakpoint.description
      });
    }
    return display;
  }
}
