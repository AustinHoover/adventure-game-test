import { BehaviorTree, BehaviorContext, BehaviorStatus } from './BehaviorTree';
import { Character } from '../interface/character';
import { GameState } from '../interface/gamestate';
import { createBackAndForthMovement } from './CharacterBehaviors';

/**
 * AI Controller manages behavior trees for multiple characters
 */
export class AIController {
  private characterBehaviors: Map<number, BehaviorTree> = new Map();
  private isRunning: boolean = false;
  private updateInterval: number = 100; // Update every 100ms
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private gameState: GameState) {}

  /**
   * Add a character with a behavior tree
   */
  addCharacter(characterId: number, behaviorTree: BehaviorTree): void {
    this.characterBehaviors.set(characterId, behaviorTree);
  }

  /**
   * Remove a character's behavior tree
   */
  removeCharacter(characterId: number): void {
    this.characterBehaviors.delete(characterId);
  }

  /**
   * Start the AI controller
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.update();
    }, this.updateInterval);
  }

  /**
   * Stop the AI controller
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Update all character behaviors
   */
  private update(): void {
    const currentTime = Date.now();

    this.characterBehaviors.forEach((behaviorTree, characterId) => {
      try {
        // Update the context with current time
        const context: BehaviorContext = {
          characterId,
          gameState: this.gameState,
          currentTime
        };

        behaviorTree.updateContext(context);
        
        // Execute the behavior tree
        const status = behaviorTree.execute();
        
        // Log behavior execution (optional)
        if (status === BehaviorStatus.FAILURE) {
          console.warn(`AI behavior failed for character ${characterId}`);
        }
      } catch (error) {
        console.error(`Error executing AI behavior for character ${characterId}:`, error);
      }
    });
  }

  /**
   * Get the behavior tree for a specific character
   */
  getCharacterBehavior(characterId: number): BehaviorTree | undefined {
    return this.characterBehaviors.get(characterId);
  }

  /**
   * Check if the AI controller is running
   */
  isControllerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get the number of characters being controlled
   */
  getCharacterCount(): number {
    return this.characterBehaviors.size;
  }

  /**
   * Clear all character behaviors
   */
  clear(): void {
    this.characterBehaviors.clear();
  }

  /**
   * Set the update interval for the AI controller
   */
  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
    
    // Restart the controller if it's running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

/**
 * Factory function to create a simple back-and-forth movement AI for a character
 */
export function createBackAndForthAI(
  characterId: number,
  locationA: number,
  locationB: number,
  directionAtoB: 'north' | 'east' | 'south' | 'west',
  waitTime: number = 1000
): BehaviorTree {
  const behavior = createBackAndForthMovement(locationA, locationB, directionAtoB, waitTime);
  
  const context: BehaviorContext = {
    characterId,
    gameState: null as any, // Will be set by the controller
    currentTime: Date.now()
  };

  return new BehaviorTree(behavior, context);
}

/**
 * Factory function to create an AI controller with some default behaviors
 */
export function createDefaultAIController(gameState: GameState): AIController {
  return new AIController(gameState);
}
