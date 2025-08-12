import { ConditionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';

/**
 * Condition node that checks if a shop should be open based on game time
 */
export class IsShopOpenConditionNode extends ConditionNode {
  constructor() {
    super('Is Shop Open');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // Get current game time in minutes since midnight
    const gameTime = context.gameState.worldState.gameTime;
    
    // Convert to hours (0-23)
    const currentHour = Math.floor(gameTime / 60);
    
    // Simple shop hours: 6 AM to 8 PM (6:00 to 20:00)
    if (currentHour >= 6 && currentHour < 20) {
      return BehaviorStatus.SUCCESS;
    }
    
    return BehaviorStatus.FAILURE;
  }
}
