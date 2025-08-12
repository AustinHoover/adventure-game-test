import { BehaviorTree, BehaviorContext, SelectorNode } from '../BehaviorTree';
import { RandomWanderActionNode } from '../nodes/RandomWanderActionNode';
import { IdleAnimationActionNode } from '../nodes/IdleAnimationActionNode';
import { WaitNode } from '../nodes/WaitNode';

/**
 * Idle behavior tree that makes a character perform idle activities
 */
export class IdleBehaviorTree extends BehaviorTree {
  constructor() {
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

    super(root, context);
  }
}
