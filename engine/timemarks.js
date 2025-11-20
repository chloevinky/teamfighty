// Time Marks System
class TimeMarksSystem {
  constructor() {
    // Format: marks[sourceId][targetId] = count
    this.marks = {};
  }

  reset() {
    this.marks = {};
  }

  applyMark(source, target) {
    if (!this.marks[source.id]) {
      this.marks[source.id] = {};
    }

    if (!this.marks[source.id][target.id]) {
      this.marks[source.id][target.id] = 0;
    }

    this.marks[source.id][target.id]++;

    // Check for detonation (3 marks)
    if (this.marks[source.id][target.id] >= GAME_CONSTANTS.ECHO.TIME_MARKS_TO_DETONATE) {
      this.detonateMarks(source, target);
    }
  }

  detonateMarks(source, target) {
    if (!this.marks[source.id] || !this.marks[source.id][target.id]) {
      return;
    }

    const markCount = this.marks[source.id][target.id];
    if (markCount < GAME_CONSTANTS.ECHO.TIME_MARKS_TO_DETONATE) {
      return;
    }

    // Reset marks
    this.marks[source.id][target.id] = 0;

    // Apply detonation effects
    const detonation = source.championData.timeMarkDetonation;
    this.applyDetonationEffects(source, target, detonation);
  }

  applyDetonationEffects(source, target, detonation) {
    // Base damage
    if (detonation.damage) {
      let damage = detonation.damage.starValues[source.starLevel - 1];

      // Exploit trait: add missing HP damage
      if (source.hasActiveTrait && source.hasActiveTrait('Exploit', 2)) {
        const missingHp = target.maxHp - target.hp;
        damage += missingHp * 0.08;
      }

      const finalDamage = calculateDamage(
        damage,
        target.armor,
        target.magicResist,
        detonation.damage.type
      );
      target.takeDamage(finalDamage, source, detonation.damage.type);
    }

    // Primary damage (for champions with different naming)
    if (detonation.primaryDamage) {
      const damage = detonation.primaryDamage.starValues[source.starLevel - 1];
      const finalDamage = calculateDamage(
        damage,
        target.armor,
        target.magicResist,
        detonation.primaryDamage.type
      );
      target.takeDamage(finalDamage, source, detonation.primaryDamage.type);
    }

    // Shield self
    if (detonation.shieldSelf) {
      const shieldAmount = detonation.shieldSelf.starValues[source.starLevel - 1];
      source.addShield(shieldAmount, detonation.shieldSelf.duration);
    }

    // Damage reduction self
    if (detonation.damageReductionSelf) {
      const drValue = detonation.damageReductionSelf.percentValues[source.starLevel - 1];
      source.addBuff('damageReduction', drValue, detonation.damageReductionSelf.duration);
    }

    // Attack speed buff self
    if (detonation.attackSpeedBuffSelf) {
      const asValue = detonation.attackSpeedBuffSelf.percentValues[source.starLevel - 1];
      source.addBuff('attackSpeed', asValue, detonation.attackSpeedBuffSelf.duration);
    }

    // Taunt
    if (detonation.taunt) {
      target.addDebuff('taunted', source.id, detonation.taunt.duration);
    }

    // Stun
    if (detonation.stun) {
      const stunDuration = detonation.stun.durationValues
        ? detonation.stun.durationValues[source.starLevel - 1]
        : detonation.stun.duration;
      target.stun(stunDuration);
    }

    // Post-stun slow
    if (detonation.postStunSlow) {
      target.addDebuff('slow', detonation.postStunSlow.percent, detonation.postStunSlow.duration);
    }

    // Damage amp
    if (detonation.damageAmp) {
      target.addDebuff('damageAmp', detonation.damageAmp.percent, detonation.damageAmp.duration);
    }

    // Cached damage (for Cache champion)
    if (detonation.consumeCachedDamage && source.cachedDamage[target.id]) {
      const cachedDmg = source.cachedDamage[target.id];
      const finalDamage = calculateDamage(cachedDmg, target.armor, target.magicResist, 'magic');
      target.takeDamage(finalDamage, source, 'magic');
      source.cachedDamage[target.id] = 0;
    }

    // Burn
    if (detonation.burn) {
      const totalDamage = detonation.burn.totalDamageStarValues[source.starLevel - 1];
      const damagePerTick = totalDamage / detonation.burn.duration;
      target.addDebuff('burn', damagePerTick, detonation.burn.duration);
    }

    // Attack speed slow
    if (detonation.attackSpeedSlow) {
      const slowValue = detonation.attackSpeedSlow.percentValues[source.starLevel - 1];
      target.addDebuff('attackSpeedSlow', slowValue, detonation.attackSpeedSlow.duration);
    }

    // Exploit trait: apply armor/MR shred
    if (source.hasActiveTrait && source.hasActiveTrait('Exploit', 3)) {
      target.addDebuff('armorShred', 0.20, 4.0);
      target.addDebuff('mrShred', 0.20, 4.0);
    }

    // Security trait: shield and damage reduction
    if (source.hasActiveTrait && source.hasActiveTrait('Security', 3)) {
      const shieldAmount = source.maxHp * 0.06;
      source.addShield(shieldAmount, 3.0);
      source.addBuff('damageReduction', 0.20, 2.0);
    }

    // Throughput trait: attack speed bonus
    if (source.hasActiveTrait && source.hasActiveTrait('Throughput', 2)) {
      source.addBuff('attackSpeed', 0.20, 3.0);
      // Also buff nearest ally
      // TODO: implement ally buffing
    }
  }

  getMarkCount(sourceId, targetId) {
    if (!this.marks[sourceId] || !this.marks[sourceId][targetId]) {
      return 0;
    }
    return this.marks[sourceId][targetId];
  }

  getAllMarksOnTarget(targetId) {
    const marksBySource = {};
    for (const sourceId in this.marks) {
      if (this.marks[sourceId][targetId]) {
        marksBySource[sourceId] = this.marks[sourceId][targetId];
      }
    }
    return marksBySource;
  }
}
