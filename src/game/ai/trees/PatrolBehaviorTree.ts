import { BehaviorTree, BehaviorContext, SequenceNode } from '../BehaviorTree';
import { PatrolActionNode } from '../nodes/PatrolActionNode';
import { WaitNode } from '../nodes/WaitNode';

/**
 * Patrol behavior tree that makes a character patrol between specified locations
 */
export class PatrolBehaviorTree extends BehaviorTree {
  constructor(patrolPoints: number[], waitTimeAtPoint: number = 5000) {
    const root = new SequenceNode('Patrol Sequence', [
      new PatrolActionNode(patrolPoints, waitTimeAtPoint),
      new WaitNode(waitTimeAtPoint)
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    super(root, context);
  }
}
