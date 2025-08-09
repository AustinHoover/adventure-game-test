import { Character } from './character-interfaces';
import { CombatEntityDefinition, CombatEntityRegistry } from './combat-entities';

/**
 * Runtime combat unit created from a character for use in combat
 */
export interface CombatUnit {
  id: number; // Unique combat instance ID
  characterId: number; // Reference to the original character
  name: string; // Display name
  level: number; // Current level
  maxHp: number; // Maximum hit points
  currentHp: number; // Current hit points in combat
  attack: number; // Attack damage
  raceId: string; // Race/entity type ID
  isPlayer: boolean; // Whether this unit belongs to the player's party
  isAlive: boolean; // Whether the unit is still alive in combat
  experienceReward?: number; // Experience gained when defeating this unit (for enemies)
  moneyReward?: number; // Currency gained when defeating this unit (for enemies)
}

/**
 * Service for managing combat unit creation and combat state
 */
export class CombatUnitService {
  private static instance: CombatUnitService;
  private nextCombatId: number = 1;

  private constructor() {}

  public static getInstance(): CombatUnitService {
    if (!CombatUnitService.instance) {
      CombatUnitService.instance = new CombatUnitService();
    }
    return CombatUnitService.instance;
  }

  /**
   * Create a combat unit from a character, applying racial base stats and level scaling
   */
  public createCombatUnitFromCharacter(character: Character, isPlayer: boolean = false): CombatUnit {
    const entityRegistry = CombatEntityRegistry.getInstance();
    const raceDefinition = entityRegistry.getEntity(character.raceId);

    if (!raceDefinition) {
      console.warn(`Race definition not found for raceId: ${character.raceId}, falling back to human`);
      const humanDefinition = entityRegistry.getEntity('human');
      if (!humanDefinition) {
        throw new Error('Human race definition not found in combat entity registry');
      }
      return this.buildCombatUnit(character, humanDefinition, isPlayer);
    }

    return this.buildCombatUnit(character, raceDefinition, isPlayer);
  }

  /**
   * Build the actual combat unit with stat calculations
   */
  private buildCombatUnit(character: Character, raceDefinition: CombatEntityDefinition, isPlayer: boolean): CombatUnit {
    // Calculate level-scaled stats
    const levelMultiplier = this.getLevelMultiplier(character.level);
    
    // Base stats from race definition, scaled by level
    const baseMaxHp = Math.floor(raceDefinition.maxHp * levelMultiplier);
    const baseAttack = Math.floor(raceDefinition.attack * levelMultiplier);

    // Use character's actual stats if they're higher (for customized characters)
    const finalMaxHp = Math.max(baseMaxHp, character.maxHp);
    const finalAttack = Math.max(baseAttack, character.attack);

    // Calculate rewards for defeating this unit (if enemy)
    const experienceReward = isPlayer ? undefined : (raceDefinition.experienceReward || this.calculateExperienceReward(character.level));
    const moneyReward = isPlayer ? undefined : raceDefinition.moneyReward;

    // For enemies, ensure they start with full HP; for players, preserve their current HP
    const currentHp = isPlayer ? Math.min(character.currentHp, finalMaxHp) : finalMaxHp;

    return {
      id: this.nextCombatId++,
      characterId: character.id,
      name: character.name,
      level: character.level,
      maxHp: finalMaxHp,
      currentHp: currentHp,
      attack: finalAttack,
      raceId: character.raceId,
      isPlayer,
      isAlive: currentHp > 0,
      experienceReward,
      moneyReward
    };
  }

  /**
   * Get level multiplier for scaling base racial stats
   */
  private getLevelMultiplier(level: number): number {
    // Base multiplier starts at 1.0 for level 1, increases by 0.15 per level
    return 1.0 + ((level - 1) * 0.15);
  }

  /**
   * Calculate experience reward for defeating an enemy of given level
   */
  private calculateExperienceReward(enemyLevel: number): number {
    // Base experience of 50, multiplied by level
    return 50 * enemyLevel;
  }

  /**
   * Create multiple combat units from an array of characters
   */
  public createCombatUnitsFromCharacters(characters: Character[], isPlayerParty: boolean = false): CombatUnit[] {
    return characters.map(character => this.createCombatUnitFromCharacter(character, isPlayerParty));
  }

  /**
   * Generate enemy encounter based on player level
   */
  public generateRandomEncounter(playerLevel: number, encounterSize: number = 1): CombatUnit[] {
    const entityRegistry = CombatEntityRegistry.getInstance();
    const suitableEnemies = entityRegistry.getSuitableEnemies(playerLevel);
    
    if (suitableEnemies.length === 0) {
      console.warn(`No suitable enemies found for player level ${playerLevel}`);
      return [];
    }

    const enemies: CombatUnit[] = [];
    
    for (let i = 0; i < encounterSize; i++) {
      const randomEnemy = suitableEnemies[Math.floor(Math.random() * suitableEnemies.length)];
      
      // Create a mock character from the enemy definition
      const enemyCharacter: Character = {
        id: -(this.nextCombatId + i), // Negative ID for generated enemies
        name: randomEnemy.name,
        location: 0,
        unitId: 0,
        mapId: 0,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        level: randomEnemy.level,
        experience: 0,
        raceId: randomEnemy.id,
        maxHp: randomEnemy.maxHp,
        currentHp: randomEnemy.maxHp,
        attack: randomEnemy.attack
      };

      enemies.push(this.createCombatUnitFromCharacter(enemyCharacter, false));
    }

    return enemies;
  }

  /**
   * Apply damage to a combat unit
   */
  public applyDamage(unit: CombatUnit, damage: number): CombatUnit {
    const newCurrentHp = Math.max(0, unit.currentHp - damage);
    
    return {
      ...unit,
      currentHp: newCurrentHp,
      isAlive: newCurrentHp > 0
    };
  }

  /**
   * Heal a combat unit
   */
  public healUnit(unit: CombatUnit, healAmount: number): CombatUnit {
    const newCurrentHp = Math.min(unit.maxHp, unit.currentHp + healAmount);
    
    return {
      ...unit,
      currentHp: newCurrentHp,
      isAlive: newCurrentHp > 0
    };
  }

  /**
   * Calculate damage dealt by an attacker to a defender
   */
  public calculateDamage(attacker: CombatUnit, defender: CombatUnit): number {
    // Base damage is attacker's attack stat
    let damage = attacker.attack;
    
    // Add some randomness (±20%)
    const randomModifier = 0.8 + (Math.random() * 0.4);
    damage = Math.floor(damage * randomModifier);
    
    // Level difference modifier
    const levelDiff = attacker.level - defender.level;
    const levelModifier = 1.0 + (levelDiff * 0.1); // 10% per level difference
    damage = Math.floor(damage * levelModifier);
    
    // Ensure minimum damage of 1
    return Math.max(1, damage);
  }

  /**
   * Check if combat is over (all units of one side are defeated)
   */
  public isCombatOver(playerUnits: CombatUnit[], enemyUnits: CombatUnit[]): { isOver: boolean; playerWon: boolean } {
    const playersAlive = playerUnits.some(unit => unit.isAlive);
    const enemiesAlive = enemyUnits.some(unit => unit.isAlive);
    
    if (!playersAlive) {
      return { isOver: true, playerWon: false };
    }
    
    if (!enemiesAlive) {
      return { isOver: true, playerWon: true };
    }
    
    return { isOver: false, playerWon: false };
  }

  /**
   * Calculate total experience gained from defeated enemies
   */
  public calculateExperienceGain(defeatedEnemies: CombatUnit[]): number {
    return defeatedEnemies.reduce((total, enemy) => {
      return total + (enemy.experienceReward || 0);
    }, 0);
  }

  /**
   * Calculate total money gained from defeated enemies
   */
  public calculateMoneyGain(defeatedEnemies: CombatUnit[]): number {
    return defeatedEnemies.reduce((total, enemy) => {
      return total + (enemy.moneyReward || 0);
    }, 0);
  }

  /**
   * Update character stats after combat (apply damage and experience)
   */
  public updateCharacterAfterCombat(character: Character, combatUnit: CombatUnit, experienceGained: number = 0): Character {
    // Calculate new experience and level
    const newExperience = character.experience + experienceGained;
    const newLevel = this.calculateLevelFromExperience(newExperience);
    
    // If level increased, recalculate max HP and attack
    let newMaxHp = character.maxHp;
    let newAttack = character.attack;
    
    if (newLevel > character.level) {
      const entityRegistry = CombatEntityRegistry.getInstance();
      const raceDefinition = entityRegistry.getEntity(character.raceId);
      
      if (raceDefinition) {
        const levelMultiplier = this.getLevelMultiplier(newLevel);
        newMaxHp = Math.floor(raceDefinition.maxHp * levelMultiplier);
        newAttack = Math.floor(raceDefinition.attack * levelMultiplier);
      }
    }

    return {
      ...character,
      level: newLevel,
      experience: newExperience,
      maxHp: newMaxHp,
      currentHp: combatUnit.currentHp, // Preserve combat damage
      attack: newAttack
    };
  }

  /**
   * Calculate level from total experience (simple formula)
   */
  private calculateLevelFromExperience(experience: number): number {
    // Level 1 = 0 exp, Level 2 = 100 exp, Level 3 = 300 exp, Level 4 = 600 exp, etc.
    // Formula: exp = level * (level - 1) * 50
    // Solving for level: level = (1 + sqrt(1 + 8 * exp / 50)) / 2
    
    if (experience <= 0) return 1;
    
    const level = Math.floor((1 + Math.sqrt(1 + (8 * experience / 50))) / 2);
    return Math.max(1, level);
  }

  /**
   * Get experience required for next level
   */
  public getExperienceForNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    return nextLevel * (nextLevel - 1) * 50;
  }

  /**
   * Reset combat IDs (useful for testing)
   */
  public resetCombatIds(): void {
    this.nextCombatId = 1;
  }
}
