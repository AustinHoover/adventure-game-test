import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';

/**
 * Action node that handles opening a shop
 */
export class OpenShopActionNode extends ActionNode {
  private hasOpened: boolean = false;

  constructor() {
    super('Open Shop');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // Get current character
    const character = context.gameState.characterRegistry.characters.get(context.characterId);
    if (!character) {
      return BehaviorStatus.FAILURE;
    }

    // Check if character has shop pools (is a merchant)
    if (!character.shopPools || character.shopPools.length === 0) {
      return BehaviorStatus.FAILURE;
    }

    // For now, just mark that we've opened the shop
    // In a real implementation, this would trigger shop UI, inventory loading, etc.
    if (!this.hasOpened) {
      this.hasOpened = true;
      return BehaviorStatus.RUNNING;
    }

    // Shop is now open
    return BehaviorStatus.SUCCESS;
  }

  reset(): void {
    super.reset();
    this.hasOpened = false;
  }
}
