import { BehaviorTree, BehaviorContext, BehaviorStatus } from './BehaviorTree';
import { ActionNode, ConditionNode, DecoratorNode, SequenceNode, SelectorNode } from './BehaviorTree';

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
}

// Concrete behavior node implementations

class PatrolActionNode extends ActionNode {
  constructor(
    private patrolPoints: number[],
    private waitTime: number
  ) {
    super('Patrol Action');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would contain actual patrol logic
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

class WaitNode extends ActionNode {
  constructor(private waitTime: number) {
    super('Wait Action');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would implement actual waiting logic
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

class IsShopOpenConditionNode extends ConditionNode {
  constructor() {
    super('Is Shop Open');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would check if the shop should be open based on time
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

class OpenShopActionNode extends ActionNode {
  constructor() {
    super('Open Shop');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would implement shop opening logic
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

class WaitForCustomersActionNode extends ActionNode {
  constructor() {
    super('Wait For Customers');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would implement customer waiting logic
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

class RandomWanderActionNode extends ActionNode {
  constructor() {
    super('Random Wander');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would implement random movement logic
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

class IdleAnimationActionNode extends ActionNode {
  constructor() {
    super('Idle Animation');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would implement idle animation logic
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

class IsThreatDetectedConditionNode extends ConditionNode {
  constructor() {
    super('Is Threat Detected');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would check for threats in the area
    // For now, just return failure (no threat)
    return BehaviorStatus.FAILURE;
  }
}

class InvestigateThreatActionNode extends ActionNode {
  constructor() {
    super('Investigate Threat');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    // This would implement threat investigation logic
    // For now, just return success
    return BehaviorStatus.SUCCESS;
  }
}

