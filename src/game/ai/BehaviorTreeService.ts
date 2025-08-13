import { Character } from '../interface/character';
import { GameState } from '../interface/gamestate';
import { BehaviorTree, BehaviorContext, BehaviorStatus } from './BehaviorTree';
import { AIController } from './AIController';
import { BehaviorTreeFactory } from './BehaviorTreeFactory';

/**
 * Service for managing behavior trees and AI simulation for characters
 */
export class BehaviorTreeService {
  private static instance: BehaviorTreeService;
  private behaviorTrees: Map<string, BehaviorTree> = new Map();
  private aiControllers: Map<number, AIController> = new Map();

  private constructor() {}

  public static getInstance(): BehaviorTreeService {
    if (!BehaviorTreeService.instance) {
      BehaviorTreeService.instance = new BehaviorTreeService();
    }
    return BehaviorTreeService.instance;
  }

  /**
   * Register a behavior tree with a given ID
   */
  public registerBehaviorTree(id: string, behaviorTree: BehaviorTree): void {
    this.behaviorTrees.set(id, behaviorTree);
  }

  /**
   * Get a behavior tree by ID
   */
  public getBehaviorTree(id: string): BehaviorTree | undefined {
    return this.behaviorTrees.get(id);
  }

  /**
   * Get or create an AI controller for a character
   */
  private getOrCreateAIController(character: Character, gameState: GameState): AIController {
    let controller = this.aiControllers.get(character.id);
    
    if (!controller) {
      controller = new AIController(gameState);
      this.aiControllers.set(character.id, controller);
    }
    
    return controller;
  }

  /**
   * Simulate all characters on a given map that have behavior trees
   * @param mapId - The ID of the map to simulate characters on
   * @param gameState - The current game state
   * @param currentTime - The current game time
   */
  public simulateCharactersOnMap(mapId: number, gameState: GameState, currentTime: number): void {
    // Get all characters on the specified map
    const charactersOnMap = Array.from(gameState.characterRegistry.characters.values())
      .filter(character => character.mapId === mapId && character.behaviorTreeId);

    // Simulate each character with a behavior tree
    for (const character of charactersOnMap) {
      if (!character.behaviorTreeId) continue;

      //skip if character is the player
      if (character.id === gameState.playerCharacterId) continue;

      const behaviorTree = this.behaviorTrees.get(character.behaviorTreeId);
      if (!behaviorTree) {
        console.warn(`Character ${character.name} (ID: ${character.id}) has behavior tree ID ${character.behaviorTreeId} but no such tree exists`);
        continue;
      }

      // Create behavior context
      // Convert game time (minutes since midnight) to milliseconds for behavior tree timing
      const currentTimeMs = currentTime * 60 * 1000; // Convert minutes to milliseconds
      const context: BehaviorContext = {
        characterId: character.id,
        gameState: gameState,
        currentTime: currentTimeMs
      };

      // Update the behavior tree context
      behaviorTree.updateContext(context);

      // Execute the behavior tree
      const status = behaviorTree.execute();
      
      // Log behavior execution for debugging
      if (status === BehaviorStatus.RUNNING) {
        console.debug(`Character ${character.name} behavior tree is still running`);
      } else if (status === BehaviorStatus.SUCCESS) {
        console.debug(`Character ${character.name} behavior tree completed successfully`);
      } else {
        console.debug(`Character ${character.name} behavior tree failed`);
      }
    }
  }

  /**
   * Get all registered behavior tree IDs
   */
  public getRegisteredBehaviorTreeIds(): string[] {
    return Array.from(this.behaviorTrees.keys());
  }

  /**
   * Clear all behavior trees and AI controllers (useful for testing or reset)
   */
  public clear(): void {
    this.behaviorTrees.clear();
    this.aiControllers.clear();
  }

  /**
   * Remove a specific behavior tree
   */
  public removeBehaviorTree(id: string): boolean {
    return this.behaviorTrees.delete(id);
  }

  /**
   * Get the number of registered behavior trees
   */
  public getBehaviorTreeCount(): number {
    return this.behaviorTrees.size;
  }
  
  /**
   * Set up default behavior trees for the game
   * This should be called when the game starts or when loading a save
   */
  public setupDefaultBehaviorTrees(): void {
    // Create and register a patrol behavior for guards
    const guardPatrol = BehaviorTreeFactory.createGuardBehavior([1, 2, 3, 4]);
    this.registerBehaviorTree('guard_patrol', guardPatrol);
    
    // Create and register a merchant behavior
    const merchantBehavior = BehaviorTreeFactory.createMerchantBehavior();
    this.registerBehaviorTree('merchant_behavior', merchantBehavior);
    
    // Create and register an idle behavior for NPCs
    const idleBehavior = BehaviorTreeFactory.createIdleBehavior();
    this.registerBehaviorTree('idle_behavior', idleBehavior);
    
    // Create and register a simple patrol behavior
    const simplePatrol = BehaviorTreeFactory.createPatrolBehavior([1, 2, 3], 3000);
    this.registerBehaviorTree('simple_patrol', simplePatrol);
  }


  /**
    * Assign behavior trees to characters based on their role
    * @param characters - Array of characters to assign behaviors to
    */
   public assignBehaviorTreesToCharacters(characters: Character[], playerCharacterId: number): void {
     for (const character of characters) {
       // Skip if character already has a behavior tree
       if (character.behaviorTreeId) continue;

       //skip if character is the player
       if (character.id === playerCharacterId) continue;
       
       // Assign behavior trees based on character name or other properties
       if (character.name.toLowerCase().includes('guard')) {
         character.behaviorTreeId = 'guard_patrol';
       } else if (character.name.toLowerCase().includes('merchant') || 
                  character.name.toLowerCase().includes('shop')) {
         character.behaviorTreeId = 'merchant_behavior';
       } else if (character.name.toLowerCase().includes('patrol')) {
         character.behaviorTreeId = 'simple_patrol';
       } else {
         // Default to idle behavior for other NPCs
         character.behaviorTreeId = 'idle_behavior';
       }
     }
   }
}
