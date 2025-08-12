import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';
import { Character } from '../../interface/character';

/**
 * Action node that makes a merchant wait for customers
 */
export class WaitForCustomersActionNode extends ActionNode {
  private startTime: number = 0;
  private waitDuration: number = 30000; // Wait 30 seconds for customers

  constructor() {
    super('Wait For Customers');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const currentTime = context.currentTime;

    // Start waiting if we haven't started yet
    if (this.startTime === 0) {
      this.startTime = currentTime;
      return BehaviorStatus.RUNNING;
    }

    // Check if we've waited long enough
    if (currentTime - this.startTime >= this.waitDuration) {
      return BehaviorStatus.SUCCESS;
    }

    // Check if any customers have arrived
    const character = context.gameState.characterRegistry.characters.get(context.characterId);
    if (!character) {
      return BehaviorStatus.FAILURE;
    }

    const map = context.gameState.mapRegistry.cachedMaps.get(character.mapId);
    if (!map) {
      return BehaviorStatus.FAILURE;
    }

    // Look for potential customers (other characters) at the same location
    const potentialCustomers: Character[] = context.gameState.characterRegistry.characters.values()
      .filter((otherChar: Character) => {
        return otherChar.id !== character.id && 
        otherChar.mapId === character.mapId && 
        otherChar.location === character.location
      });

    // If customers arrive, we can stop waiting
    if (potentialCustomers.length > 0) {
      return BehaviorStatus.SUCCESS;
    }

    // Still waiting
    return BehaviorStatus.RUNNING;
  }

  reset(): void {
    super.reset();
    this.startTime = 0;
  }
}
