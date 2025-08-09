export interface CombatEntityDefinition {
  id: string; // Unique identifier for this entity type
  name: string; // Display name
  level: number; // Entity level
  maxHp: number; // Maximum hit points
  attack: number; // Base attack damage
  type: 'race' | 'monster'; // Entity type
  description?: string; // Optional description
  tags?: string[]; // Optional tags for categorization (e.g., ['undead', 'boss', 'magical'])
}

export class CombatEntityRegistry {
  private static instance: CombatEntityRegistry;
  private entities: Map<string, CombatEntityDefinition> = new Map();

  private constructor() {
    this.initializeDefaultEntities();
  }

  public static getInstance(): CombatEntityRegistry {
    if (!CombatEntityRegistry.instance) {
      CombatEntityRegistry.instance = new CombatEntityRegistry();
    }
    return CombatEntityRegistry.instance;
  }

  /**
   * Initialize default entity definitions
   */
  private initializeDefaultEntities(): void {
    // Main races
    this.addEntity({
      id: 'human',
      name: 'Human',
      level: 1,
      maxHp: 100,
      attack: 15,
      type: 'race',
      description: 'A hmuan',
      tags: ['human']
    });

    // Basic monsters
    this.addEntity({
      id: 'goblin',
      name: 'Goblin',
      level: 1,
      maxHp: 30,
      attack: 8,
      type: 'monster',
      description: 'A small, cunning creature with sharp claws',
      tags: ['humanoid', 'weak']
    });

    this.addEntity({
      id: 'orc',
      name: 'Orc Warrior',
      level: 3,
      maxHp: 80,
      attack: 18,
      type: 'monster',
      description: 'A brutish warrior with immense strength',
      tags: ['humanoid', 'strong']
    });

    this.addEntity({
      id: 'skeleton',
      name: 'Skeleton',
      level: 2,
      maxHp: 50,
      attack: 12,
      type: 'monster',
      description: 'An animated skeleton warrior',
      tags: ['undead', 'bone']
    });

    this.addEntity({
      id: 'wolf',
      name: 'Dire Wolf',
      level: 2,
      maxHp: 60,
      attack: 15,
      type: 'monster',
      description: 'A large, aggressive wolf with glowing eyes',
      tags: ['beast', 'pack']
    });

    this.addEntity({
      id: 'troll',
      name: 'Cave Troll',
      level: 6,
      maxHp: 250,
      attack: 35,
      type: 'monster',
      description: 'A massive troll with regenerative abilities',
      tags: ['giant', 'strong', 'regeneration']
    });

    this.addEntity({
      id: 'dragon',
      name: 'Ancient Dragon',
      level: 15,
      maxHp: 800,
      attack: 100,
      type: 'monster',
      description: 'A legendary ancient dragon with devastating power',
      tags: ['dragon', 'boss', 'fire', 'legendary']
    });

    // Magical creatures
    this.addEntity({
      id: 'mage',
      name: 'Dark Mage',
      level: 4,
      maxHp: 70,
      attack: 25,
      type: 'monster',
      description: 'A corrupted mage wielding dark magic',
      tags: ['humanoid', 'magical', 'dark']
    });

    this.addEntity({
      id: 'elemental',
      name: 'Fire Elemental',
      level: 5,
      maxHp: 120,
      attack: 28,
      type: 'monster',
      description: 'A being of pure flame and rage',
      tags: ['elemental', 'fire', 'magical']
    });
  }

  /**
   * Add a new entity definition to the registry
   */
  public addEntity(entity: CombatEntityDefinition): void {
    this.entities.set(entity.id, entity);
  }

  /**
   * Get an entity definition by ID
   */
  public getEntity(id: string): CombatEntityDefinition | undefined {
    return this.entities.get(id);
  }

  /**
   * Get all entity definitions
   */
  public getAllEntities(): CombatEntityDefinition[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get entities by type (player or monster)
   */
  public getEntitiesByType(type: 'player' | 'monster'): CombatEntityDefinition[] {
    return this.getAllEntities().filter(entity => entity.type === type);
  }

  /**
   * Get entities by level range
   */
  public getEntitiesByLevelRange(minLevel: number, maxLevel: number): CombatEntityDefinition[] {
    return this.getAllEntities().filter(entity => 
      entity.level >= minLevel && entity.level <= maxLevel
    );
  }

  /**
   * Get entities by tag
   */
  public getEntitiesByTag(tag: string): CombatEntityDefinition[] {
    return this.getAllEntities().filter(entity => 
      entity.tags && entity.tags.includes(tag)
    );
  }

  /**
   * Get random monster by level range (useful for encounter generation)
   */
  public getRandomMonsterByLevel(minLevel: number, maxLevel: number): CombatEntityDefinition | undefined {
    const monsters = this.getEntitiesByType('monster').filter(monster => 
      monster.level >= minLevel && monster.level <= maxLevel
    );
    
    if (monsters.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * monsters.length);
    return monsters[randomIndex];
  }

  /**
   * Get monsters suitable for a specific player level (within reasonable challenge range)
   */
  public getSuitableEnemies(playerLevel: number): CombatEntityDefinition[] {
    const minLevel = Math.max(1, playerLevel - 2);
    const maxLevel = playerLevel + 3;
    return this.getEntitiesByLevelRange(minLevel, maxLevel).filter(entity => entity.type === 'monster');
  }

  /**
   * Update an existing entity definition
   */
  public updateEntity(entity: CombatEntityDefinition): boolean {
    if (this.entities.has(entity.id)) {
      this.entities.set(entity.id, entity);
      return true;
    }
    return false;
  }

  /**
   * Remove an entity definition
   */
  public removeEntity(id: string): boolean {
    return this.entities.delete(id);
  }

  /**
   * Check if an entity exists
   */
  public hasEntity(id: string): boolean {
    return this.entities.has(id);
  }

  /**
   * Get entity count
   */
  public getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Clear all entities (useful for testing)
   */
  public clear(): void {
    this.entities.clear();
  }
}

/**
 * Utility functions for working with combat entities
 */
export class CombatEntityUtils {
  /**
   * Calculate combat power rating for balancing
   */
  static getCombatPower(entity: CombatEntityDefinition): number {
    return entity.maxHp + (entity.attack * 2) + (entity.level * 10);
  }

  /**
   * Get difficulty rating relative to player level
   */
  static getDifficultyRating(entity: CombatEntityDefinition, playerLevel: number): string {
    const levelDiff = entity.level - playerLevel;
    
    if (levelDiff <= -3) return 'Very Easy';
    if (levelDiff <= -1) return 'Easy';
    if (levelDiff <= 1) return 'Normal';
    if (levelDiff <= 3) return 'Hard';
    if (levelDiff <= 5) return 'Very Hard';
    return 'Impossible';
  }

  /**
   * Create a runtime combat unit from an entity definition
   */
  static createCombatUnit(definition: CombatEntityDefinition, unitId: number): any {
    return {
      id: unitId,
      definitionId: definition.id,
      name: definition.name,
      level: definition.level,
      maxHp: definition.maxHp,
      currentHp: definition.maxHp,
      attack: definition.attack,
      type: definition.type,
      tags: definition.tags || []
    };
  }

  /**
   * Scale entity stats by level multiplier (for dynamic difficulty)
   */
  static scaleEntity(definition: CombatEntityDefinition, levelMultiplier: number): CombatEntityDefinition {
    return {
      ...definition,
      level: Math.floor(definition.level * levelMultiplier),
      maxHp: Math.floor(definition.maxHp * levelMultiplier),
      attack: Math.floor(definition.attack * levelMultiplier)
    };
  }
}
