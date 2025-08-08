export interface Character {
  id: number;
  name: string;
  location: number;
  unitId: number;
  mapId: number; // ID of the map the character is currently on
  shopPools: string[]; // Array of items to sell if character is a merchant
}

export interface CharacterRegistry {
  characters: Map<number, Character>;
}

export class CharacterRegistryManager {
  private static instance: CharacterRegistryManager;
  private nextId: number = 1;
  private characters: Map<number, Character> = new Map();

  private constructor() {}

  public static getInstance(): CharacterRegistryManager {
    if (!CharacterRegistryManager.instance) {
      CharacterRegistryManager.instance = new CharacterRegistryManager();
    }
    return CharacterRegistryManager.instance;
  }

  /**
   * Get the next available character ID and increment the counter
   */
  public getNextId(): number {
    return this.nextId++;
  }

  /**
   * Add a character to the registry
   */
  public addCharacter(character: Character): void {
    this.characters.set(character.id, character);
  }

  /**
   * Get a character by ID
   */
  public getCharacter(id: number): Character | undefined {
    return this.characters.get(id);
  }

  /**
   * Get all characters
   */
  public getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  /**
   * Get the character registry in the expected format
   */
  public getRegistry(): CharacterRegistry {
    return {
      characters: new Map(this.characters)
    };
  }

  /**
   * Load existing characters into the registry (for save file loading)
   */
  public loadCharacters(characterRegistry: CharacterRegistry): void {
    this.characters.clear();
    this.nextId = 1;
    
    characterRegistry.characters.forEach((character, id) => {
      this.characters.set(id, character);
      // Update nextId to be one more than the highest existing ID
      if (id >= this.nextId) {
        this.nextId = id + 1;
      }
    });
  }

  /**
   * Clear all characters (for testing or reset)
   */
  public clear(): void {
    this.characters.clear();
    this.nextId = 1;
  }
}