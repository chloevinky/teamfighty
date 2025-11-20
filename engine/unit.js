// Unit class representing a champion on the board
class Unit {
  constructor(championData, starLevel = 1, team = 'player') {
    this.id = generateUID();
    this.championId = championData.id;
    this.name = championData.name;
    this.title = championData.title;
    this.tier = championData.tier;
    this.team = team; // 'player' or 'enemy'
    this.starLevel = starLevel;
    this.traits = championData.traits;

    // Position
    this.gridPos = { col: 0, row: 0 };
    this.pixelPos = { x: 0, y: 0 };

    // Combat stats (scaled by star level)
    const multiplier = GAME_CONSTANTS.STAR_MULTIPLIERS[starLevel];
    const base = championData.baseStats;

    this.maxHp = base.hp * multiplier.hp;
    this.hp = this.maxHp;
    this.attackDamage = base.attackDamage * multiplier.ad;
    this.attackSpeed = base.attackSpeed;
    this.armor = base.armor;
    this.magicResist = base.magicResist;
    this.range = championData.range;
    this.moveSpeed = base.moveSpeed;

    // Mana system
    this.mana = 0;
    this.manaMax = base.manaMax;
    this.manaOnAttack = base.manaOnAttack;
    this.manaOnHitTaken = base.manaOnHitTaken;

    // Combat state
    this.target = null;
    this.attackTimer = 0;
    this.attackCount = 0; // For Echo Rhythm
    this.isDead = false;
    this.isStunned = false;
    this.isSilenced = false;

    // Ability data
    this.championData = championData;
    this.abilityState = null; // For Fractured Advance state

    // Buffs/Debuffs
    this.buffs = [];
    this.debuffs = [];
    this.shield = 0;

    // Cached damage (for Cache champion)
    this.cachedDamage = {};

    // Visual effects
    this.animations = [];
  }

  setPosition(col, row) {
    this.gridPos = { col, row };
    this.pixelPos = gridToPixel({ col, row });
  }

  update(deltaTime, allUnits, timeMarksSystem) {
    if (this.isDead) return;

    // Update buffs/debuffs
    this.updateEffects(deltaTime);

    // If stunned, skip actions
    if (this.isStunned) return;

    // Update ability state (for Fractured Advance)
    if (this.abilityState) {
      this.updateAbilityState(deltaTime, allUnits, timeMarksSystem);
      return; // During ability, unit might not attack normally
    }

    // Find target
    const enemies = allUnits.filter(u => u.team !== this.team && !u.isDead);
    if (enemies.length === 0) return;

    if (!this.target || this.target.isDead) {
      this.target = findNearestUnit(this, enemies);
    }

    if (!this.target) return;

    const dist = manhattanDistance(this.gridPos, this.target.gridPos);

    // If in range, attack
    if (dist <= this.range) {
      this.attackTimer += deltaTime * this.getEffectiveAttackSpeed();

      if (this.attackTimer >= 1.0) {
        this.performAttack(this.target, allUnits, timeMarksSystem);
        this.attackTimer = 0;
      }
    } else {
      // Move toward target
      this.moveToward(this.target, allUnits, deltaTime);
    }

    // Check for ability cast
    if (this.mana >= this.manaMax && !this.isSilenced) {
      this.castAbility(allUnits, timeMarksSystem);
    }
  }

  getEffectiveAttackSpeed() {
    let as = this.attackSpeed;

    // Apply buffs/debuffs
    this.buffs.forEach(buff => {
      if (buff.type === 'attackSpeed') {
        as *= (1 + buff.value);
      }
    });

    this.debuffs.forEach(debuff => {
      if (debuff.type === 'attackSpeedSlow') {
        as *= (1 - debuff.value);
      }
    });

    return as;
  }

  performAttack(target, allUnits, timeMarksSystem) {
    this.attackCount++;
    const isEchoAttack = (this.attackCount % GAME_CONSTANTS.ECHO.ATTACK_COUNT === 0);

    let damage = this.attackDamage;

    // Echo Rhythm - 3rd attack
    if (isEchoAttack) {
      const echo = this.championData.echoRhythm;

      if (echo.damageMultiplier) {
        damage *= echo.damageMultiplier;
      }

      // Apply echo effects
      this.applyEchoEffects(target, echo, allUnits, timeMarksSystem);

      // Apply Time Mark
      let marks = 1;

      // Chrono trait: double marks on echo
      if (this.hasActiveTrait('Chrono', 2)) {
        marks = 2;
      }

      for (let i = 0; i < marks; i++) {
        timeMarksSystem.applyMark(this, target);
      }
    }

    // Deal damage
    const finalDamage = calculateDamage(damage, target.armor, target.magicResist, 'physical');
    target.takeDamage(finalDamage, this, 'physical');

    // Gain mana
    this.gainMana(this.manaOnAttack);
  }

  applyEchoEffects(target, echo, allUnits, timeMarksSystem) {
    // Champion-specific echo effects
    if (echo.shieldSelf) {
      const shieldAmount = echo.shieldSelf.starValues[this.starLevel - 1];
      this.addShield(shieldAmount, echo.shieldSelf.duration);
    }

    if (echo.attackSpeedBuffSelf) {
      const asBonus = echo.attackSpeedBuffSelf.percentValues[this.starLevel - 1];
      this.addBuff('attackSpeed', asBonus, echo.attackSpeedBuffSelf.duration);
    }

    if (echo.bonusDamage) {
      const bonus = echo.bonusDamage.starValues[this.starLevel - 1];
      const bonusDmg = calculateDamage(bonus, target.armor, target.magicResist, echo.bonusDamage.type);
      target.takeDamage(bonusDmg, this, echo.bonusDamage.type);
    }

    if (echo.slow) {
      target.addDebuff('slow', echo.slow.percent, echo.slow.duration);
    }

    if (echo.cachedDamagePercent) {
      // Cache champion specific
      if (!this.cachedDamage[target.id]) {
        this.cachedDamage[target.id] = 0;
      }
      this.cachedDamage[target.id] += this.attackDamage * echo.cachedDamagePercent;
    }
  }

  moveToward(target, allUnits, deltaTime) {
    const occupiedPositions = allUnits
      .filter(u => !u.isDead && u.id !== this.id)
      .map(u => u.gridPos);

    const nextStep = getNextStepToward(this.gridPos, target.gridPos, occupiedPositions);

    if (nextStep.col !== this.gridPos.col || nextStep.row !== this.gridPos.row) {
      this.setPosition(nextStep.col, nextStep.row);
    }
  }

  castAbility(allUnits, timeMarksSystem) {
    // Simplified Fractured Advance implementation
    this.mana = 0;

    const ability = this.championData.fracturedAdvance;

    // Store anchor position
    const anchorPos = { ...this.gridPos };

    // Determine target position (simplified)
    const enemies = allUnits.filter(u => u.team !== this.team && !u.isDead);
    if (enemies.length === 0) return;

    const targetEnemy = enemies[0]; // Simplified - just pick first enemy
    const targetPos = { ...targetEnemy.gridPos };

    // Create ability state
    this.abilityState = {
      anchorPos,
      targetPos,
      duration: ability.duration,
      timeElapsed: 0,
      affectedEnemies: new Set(),
      hasLanded: false
    };

    // Immediately move to target position
    this.setPosition(targetPos.col, targetPos.row);
    this.abilityState.hasLanded = true;

    // Apply landing effects
    this.applyAbilityLandingEffects(allUnits, timeMarksSystem);
  }

  applyAbilityLandingEffects(allUnits, timeMarksSystem) {
    const ability = this.championData.fracturedAdvance;
    const enemies = allUnits.filter(u => u.team !== this.team && !u.isDead);

    // Get enemies in radius
    const nearbyEnemies = getUnitsInRadius(this.gridPos, enemies, 1);

    nearbyEnemies.forEach(enemy => {
      // Deal damage
      let damage = 0;
      if (ability.dashDamage) {
        damage = ability.dashDamage.starValues[this.starLevel - 1];
      } else if (ability.slamDamage) {
        damage = ability.slamDamage.starValues[this.starLevel - 1];
      } else if (ability.spinDamage) {
        damage = ability.spinDamage.starValues[this.starLevel - 1];
      }

      if (damage > 0) {
        const finalDmg = calculateDamage(damage, enemy.armor, enemy.magicResist, 'magic');
        enemy.takeDamage(finalDmg, this, 'magic');
      }

      // Apply marks
      const marks = ability.marksAppliedOnDash || ability.marksAppliedOnSlam || ability.marksAppliedPerEnemy || 1;
      for (let i = 0; i < marks; i++) {
        timeMarksSystem.applyMark(this, enemy);
      }

      this.abilityState.affectedEnemies.add(enemy.id);
    });
  }

  updateAbilityState(deltaTime, allUnits, timeMarksSystem) {
    this.abilityState.timeElapsed += deltaTime;

    // Check if duration is complete
    if (this.abilityState.timeElapsed >= this.abilityState.duration) {
      // Rewind to anchor
      this.setPosition(this.abilityState.anchorPos.col, this.abilityState.anchorPos.row);

      // Detonate marks on affected enemies
      this.abilityState.affectedEnemies.forEach(enemyId => {
        const enemy = allUnits.find(u => u.id === enemyId);
        if (enemy && !enemy.isDead) {
          timeMarksSystem.detonateMarks(this, enemy);
        }
      });

      this.abilityState = null;
    }
  }

  takeDamage(amount, source, damageType = 'physical') {
    // Apply to shield first
    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        return;
      } else {
        amount -= this.shield;
        this.shield = 0;
      }
    }

    this.hp -= amount;

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    } else {
      // Gain mana when hit
      this.gainMana(this.manaOnHitTaken);
    }
  }

  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  gainMana(amount) {
    if (this.mana >= this.manaMax) return;
    this.mana = Math.min(this.mana + amount, this.manaMax);
  }

  addShield(amount, duration) {
    this.shield += amount;
    // Shield could decay after duration (simplified here)
  }

  addBuff(type, value, duration) {
    this.buffs.push({ type, value, duration });
  }

  addDebuff(type, value, duration) {
    this.debuffs.push({ type, value, duration });
  }

  updateEffects(deltaTime) {
    // Update buffs
    this.buffs = this.buffs.filter(buff => {
      buff.duration -= deltaTime;
      return buff.duration > 0;
    });

    // Update debuffs
    this.debuffs = this.debuffs.filter(debuff => {
      debuff.duration -= deltaTime;
      return debuff.duration > 0;
    });

    // Update stuns
    if (this.isStunned) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
      }
    }
  }

  stun(duration) {
    this.isStunned = true;
    this.stunTimer = duration;
  }

  die() {
    this.isDead = true;
    this.hp = 0;
  }

  hasActiveTrait(traitId, minCount) {
    // This will be checked by the traits system
    return false; // Placeholder
  }

  getStarString() {
    return '★'.repeat(this.starLevel);
  }
}
