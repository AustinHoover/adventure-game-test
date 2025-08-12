import { BehaviorTree } from './BehaviorTree';
import { PatrolBehaviorTree } from './trees/PatrolBehaviorTree';
import { MerchantBehaviorTree } from './trees/MerchantBehaviorTree';
import { IdleBehaviorTree } from './trees/IdleBehaviorTree';
import { GuardBehaviorTree } from './trees/GuardBehaviorTree';
import { MoveToLocationBehaviorTree } from './trees/MoveToLocationBehaviorTree';

/**
 * Factory for creating common behavior tree patterns
 */
export class BehaviorTreeFactory {
  
  /**
   * Create a simple patrolling behavior tree
   * @param patrolPoints - Array of location IDs to patrol between
   * @param waitTimeAtPoint - Time to wait at each point in milliseconds
   */
  static createPatrolBehavior(patrolPoints: number[], waitTimeAtPoint: number = 5000): BehaviorTree {
    return new PatrolBehaviorTree(patrolPoints, waitTimeAtPoint);
  }

  /**
   * Create a merchant behavior tree
   */
  static createMerchantBehavior(): BehaviorTree {
    return new MerchantBehaviorTree();
  }

  /**
   * Create an idle behavior tree
   */
  static createIdleBehavior(): BehaviorTree {
    return new IdleBehaviorTree();
  }

  /**
   * Create a guard behavior tree
   */
  static createGuardBehavior(patrolRoute: number[]): BehaviorTree {
    return new GuardBehaviorTree();
  }

  /**
   * Create a behavior tree that moves a character to a specific location
   */
  static createMoveToLocationBehavior(targetLocationId: number): BehaviorTree {
    return new MoveToLocationBehaviorTree(targetLocationId);
  }
}



