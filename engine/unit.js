// Simplified Unit class for wave-based TechFights
class Unit {
  constructor(championData, starLevel = 1, team = 'player') {
    this.id = generateUID();
    this.championId = championData.id;
    this.name = championData.name;
    this.role = championData.role;
    this.team = team;
    this.starLevel = starLevel;
    this.championData = championData;

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
    this.range = base.range;
    this.moveSpeed = base.moveSpeed;

    // Mana system
    this.mana = 0;
    this.manaMax = base.manaMax;
    this.manaPerAttack = base.manaPerAttack;

    // Combat state
    this.target = null;
    this.attackTimer = 0;
    this.isDead = false;
    this.isStunned = false;
    this.isSilenced = false;
    this.isTaunted = false;
    this.tauntTarget = null;

    // Buffs/Debuffs
    this.buffs = [];
    this.debuffs = [];
    this.shield = 0;
    this.stunTimer = 0;
    this.silenceTimer = 0;
  }

  setPosition(col, row) {
    this.gridPos = { col, row };
    this.pixelPos = gridToPixel({ col, row });
  }

  updateStarLevel() {
    const multiplier = GAME_CONSTANTS.STAR_MULTIPLIERS[this.starLevel];
    const base = this.championData.baseStats;

    const hpPercent = this.hp / this.maxHp;
    this.maxHp = base.hp * multiplier.hp;
    this.hp = this.maxHp * hpPercent; // Maintain HP percentage
    this.attackDamage = base.attackDamage * multiplier.ad;
  }

  update(deltaTime, allUnits) {
    if (this.isDead) return;

    // Update effects
    this.updateEffects(deltaTime);

    // If stunned, skip actions
    if (this.isStunned) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
      }
      return;
    }

    if (this.isSilenced) {
      this.silenceTimer -= deltaTime;
      if (this.silenceTimer <= 0) {
        this.isSilenced = false;
      }
    }

    // Find target
    const enemies = allUnits.filter(u => u.team !== this.team && !u.isDead);
    if (enemies.length === 0) return;

    // Taunt override
    if (this.isTaunted && this.tauntTarget && !this.tauntTarget.isDead) {
      this.target = this.tauntTarget;
    } else if (!this.target || this.target.isDead) {
      this.target = findNearestUnit(this, enemies);
    }

    if (!this.target) return;

    const dist = manhattanDistance(this.gridPos, this.target.gridPos);

    // If in range, attack
    if (dist <= this.range) {
      this.attackTimer += deltaTime * this.getEffectiveAttackSpeed();

      if (this.attackTimer >= 1.0) {
        this.performAttack(this.target, allUnits);
        this.attackTimer = 0;
      }
    } else {
      // Move toward target
      this.moveToward(this.target, allUnits, deltaTime);
    }

    // Check for ability cast
    if (this.mana >= this.manaMax && !this.isSilenced) {
      this.castAbility(allUnits);
    }
  }

  getEffectiveAttackSpeed() {
    let as = this.attackSpeed;

    this.buffs.forEach(buff => {
      if (buff.type === 'attackSpeed') {
        as *= (1 + buff.value);
      }
    });

    this.debuffs.forEach(debuff => {
      if (debuff.type === 'slow' || debuff.type === 'attackSpeedSlow') {
        as *= (1 - debuff.value);
      }
    });

    return as;
  }

  performAttack(target, allUnits) {
    const damage = this.attackDamage;
    const finalDamage = calculateDamage(damage, target.armor, 0, 'physical');
    target.takeDamage(finalDamage, this);

    // Log attack
    if (window.game) {
      const attackerClass = this.team === 'player' ? 'log-player' : 'log-enemy';
      const targetClass = target.team === 'player' ? 'log-player' : 'log-enemy';
      window.game.addCombatLog(
        `<span class="${attackerClass}">${this.name}</span> attacks <span class="${targetClass}">${target.name}</span> for <span class="log-damage">${Math.floor(finalDamage)}</span> damage`
      );
    }

    // Gain mana
    this.gainMana(this.manaPerAttack);
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

  castAbility(allUnits) {
    this.mana = 0;

    const ability = this.championData.ability;
    const enemies = allUnits.filter(u => u.team !== this.team && !u.isDead);
    const allies = allUnits.filter(u => u.team === this.team && !u.isDead);

    if (enemies.length === 0 && allies.length === 0) return;

    // Log ability cast
    if (window.game) {
      const teamClass = this.team === 'player' ? 'log-player' : 'log-enemy';
      window.game.addCombatLog(
        `<span class="${teamClass}">${this.name}</span> uses <span class="log-ability">${ability.name}</span>!`,
        'log-ability'
      );
    }

    // Execute ability based on effect type
    switch (ability.effect) {
      case 'shield_and_taunt':
        this.abilityShieldAndTaunt(enemies);
        break;
      case 'team_shield':
        this.abilityTeamShield(allies);
        break;
      case 'single_target_burst':
        this.abilitySingleTargetBurst(enemies);
        break;
      case 'multi_strike':
        this.abilityMultiStrike(enemies);
        break;
      case 'aoe_damage_slow':
        this.abilityAoeDamageSlow(enemies);
        break;
      case 'team_heal':
        this.abilityTeamHeal(allies);
        break;
      case 'team_attack_speed':
        this.abilityTeamAttackSpeed(allies);
        break;
      case 'aoe_stun':
        this.abilityAoeStun(enemies);
        break;
      case 'cone_damage_silence':
        this.abilityConeDamageSilence(enemies);
        break;
    }
  }

  // Ability implementations
  abilityShieldAndTaunt(enemies) {
    const ability = this.championData.ability;
    const shieldAmount = ability.shieldAmount[this.starLevel - 1];
    this.addShield(shieldAmount);

    // Taunt all enemies
    enemies.forEach(enemy => {
      enemy.isTaunted = true;
      enemy.tauntTarget = this;
      setTimeout(() => {
        enemy.isTaunted = false;
        enemy.tauntTarget = null;
      }, ability.tauntDuration * 1000);
    });
  }

  abilityTeamShield(allies) {
    const ability = this.championData.ability;
    const shieldAmount = ability.shieldAmount[this.starLevel - 1];
    allies.forEach(ally => ally.addShield(shieldAmount));
  }

  abilitySingleTargetBurst(enemies) {
    const ability = this.championData.ability;
    const damage = ability.damage[this.starLevel - 1];

    // Find highest HP enemy
    let target = enemies[0];
    enemies.forEach(enemy => {
      if (enemy.hp > target.hp) target = enemy;
    });

    if (target) {
      const finalDamage = calculateDamage(damage, target.armor, 0, 'magic');
      target.takeDamage(finalDamage, this);
    }
  }

  abilityMultiStrike(enemies) {
    const ability = this.championData.ability;
    const damagePerStrike = ability.damagePerStrike[this.starLevel - 1];
    const target = findNearestUnit(this, enemies);

    if (target) {
      for (let i = 0; i < ability.strikes; i++) {
        const finalDamage = calculateDamage(damagePerStrike, target.armor, 0, 'physical');
        target.takeDamage(finalDamage, this);
      }
    }
  }

  abilityAoeDamageSlow(enemies) {
    const ability = this.championData.ability;
    const damage = ability.damage[this.starLevel - 1];

    enemies.forEach(enemy => {
      const finalDamage = calculateDamage(damage, enemy.armor, 0, 'magic');
      enemy.takeDamage(finalDamage, this);
      enemy.addDebuff('slow', ability.slowPercent, ability.slowDuration);
    });
  }

  abilityTeamHeal(allies) {
    const ability = this.championData.ability;
    const healAmount = ability.healAmount[this.starLevel - 1];
    allies.forEach(ally => ally.heal(healAmount));
  }

  abilityTeamAttackSpeed(allies) {
    const ability = this.championData.ability;
    allies.forEach(ally => {
      ally.addBuff('attackSpeed', ability.bonusPercent, ability.duration);
    });
  }

  abilityAoeStun(enemies) {
    const ability = this.championData.ability;
    const damage = ability.damage[this.starLevel - 1];

    enemies.forEach(enemy => {
      const finalDamage = calculateDamage(damage, enemy.armor, 0, 'magic');
      enemy.takeDamage(finalDamage, this);
      enemy.stun(ability.stunDuration);
    });
  }

  abilityConeDamageSilence(enemies) {
    const ability = this.championData.ability;
    const damage = ability.damage[this.starLevel - 1];

    // Get nearest enemies (up to targetsHit)
    const nearest = enemies
      .sort((a, b) => manhattanDistance(this.gridPos, a.gridPos) - manhattanDistance(this.gridPos, b.gridPos))
      .slice(0, ability.targetsHit);

    nearest.forEach(enemy => {
      const finalDamage = calculateDamage(damage, enemy.armor, 0, 'magic');
      enemy.takeDamage(finalDamage, this);
      enemy.silence(ability.silenceDuration);
    });
  }

  takeDamage(amount, source) {
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
    }
  }

  heal(amount) {
    if (this.isDead) return;
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  gainMana(amount) {
    if (this.mana >= this.manaMax) return;
    this.mana = Math.min(this.mana + amount, this.manaMax);
  }

  addShield(amount) {
    this.shield += amount;
  }

  addBuff(type, value, duration) {
    this.buffs.push({ type, value, duration });
  }

  addDebuff(type, value, duration) {
    this.debuffs.push({ type, value, duration });
  }

  updateEffects(deltaTime) {
    this.buffs = this.buffs.filter(buff => {
      buff.duration -= deltaTime;
      return buff.duration > 0;
    });

    this.debuffs = this.debuffs.filter(debuff => {
      debuff.duration -= deltaTime;
      return debuff.duration > 0;
    });
  }

  stun(duration) {
    this.isStunned = true;
    this.stunTimer = duration;
  }

  silence(duration) {
    this.isSilenced = true;
    this.silenceTimer = duration;
  }

  die() {
    this.isDead = true;
    this.hp = 0;

    // Log death
    if (window.game) {
      const teamClass = this.team === 'player' ? 'log-player' : 'log-enemy';
      window.game.addCombatLog(
        `<span class="${teamClass}">${this.name}</span> has been defeated!`,
        'log-damage'
      );
    }
  }

  getStarString() {
    return '★'.repeat(this.starLevel);
  }
}
