import { BehaviorTree, BehaviorContext, SequenceNode } from '../BehaviorTree';
import { MoveToLocationNode } from '../nodes/MoveToLocationNode';

/**
 * Behavior tree that moves a character to a specific location
 */
export class MoveToLocationBehaviorTree extends BehaviorTree {
  constructor(targetLocationId: number) {
    const root = new SequenceNode('Move To Location', [
      new MoveToLocationNode(targetLocationId)
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    super(root, context);
  }
}
