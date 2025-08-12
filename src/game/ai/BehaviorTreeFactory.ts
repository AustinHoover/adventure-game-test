import { BehaviorTree, BehaviorContext, BehaviorStatus } from './BehaviorTree';
import { ActionNode, ConditionNode, DecoratorNode, SequenceNode, SelectorNode } from './BehaviorTree';
import { PatrolActionNode } from './nodes/PatrolActionNode';
import { WaitNode } from './nodes/WaitNode';
import { IsShopOpenConditionNode } from './nodes/IsShopOpenConditionNode';
import { OpenShopActionNode } from './nodes/OpenShopActionNode';
import { WaitForCustomersActionNode } from './nodes/WaitForCustomersActionNode';
import { RandomWanderActionNode } from './nodes/RandomWanderActionNode';
import { IdleAnimationActionNode } from './nodes/IdleAnimationActionNode';
import { IsThreatDetectedConditionNode } from './nodes/IsThreatDetectedConditionNode';
import { InvestigateThreatActionNode } from './nodes/InvestigateThreatActionNode';
import { MoveToLocationNode } from './nodes/MoveToLocationNode';

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
    const root = new SequenceNode('Patrol Sequence', [
      new PatrolActionNode(patrolPoints, waitTimeAtPoint),
      new WaitNode(waitTimeAtPoint)
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    return new BehaviorTree(root, context);
  }

  /**
   * Create a merchant behavior tree
   */
  static createMerchantBehavior(): BehaviorTree {
    const root = new SelectorNode('Merchant Behavior', [
      new IsShopOpenConditionNode(),
      new OpenShopActionNode(),
      new WaitForCustomersActionNode()
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    return new BehaviorTree(root, context);
  }

  /**
   * Create an idle behavior tree
   */
  static createIdleBehavior(): BehaviorTree {
    const root = new SelectorNode('Idle Behavior', [
      new RandomWanderActionNode(),
      new IdleAnimationActionNode(),
      new WaitNode(10000) // Wait 10 seconds
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    return new BehaviorTree(root, context);
  }

  /**
   * Create a guard behavior tree
   */
  static createGuardBehavior(patrolRoute: number[]): BehaviorTree {
    const root = new SelectorNode('Guard Behavior', [
      new IsThreatDetectedConditionNode(),
      new InvestigateThreatActionNode(),
      new PatrolActionNode(patrolRoute, 3000),
      new WaitNode(2000)
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    return new BehaviorTree(root, context);
  }

  /**
   * Create a behavior tree that moves a character to a specific location
   */
  static createMoveToLocationBehavior(targetLocationId: number): BehaviorTree {
    const root = new SequenceNode('Move To Location', [
      new MoveToLocationNode(targetLocationId)
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    return new BehaviorTree(root, context);
  }
}



