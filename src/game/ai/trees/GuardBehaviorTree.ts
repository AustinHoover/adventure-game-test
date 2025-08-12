import { BehaviorTree, BehaviorContext, SelectorNode, SequenceNode } from '../BehaviorTree';
import { SimpleGuardMovementNode } from '../nodes/SimpleGuardMovementNode';
import { IsThreatDetectedConditionNode } from '../nodes/IsThreatDetectedConditionNode';
import { InvestigateThreatActionNode } from '../nodes/InvestigateThreatActionNode';
import { WaitNode } from '../nodes/WaitNode';

/**
 * Simplified guard behavior tree that moves left or right randomly when possible
 */
export class GuardBehaviorTree extends BehaviorTree {
  constructor() {
    const root = new SelectorNode('Guard Behavior', [
      new IsThreatDetectedConditionNode(),
      new InvestigateThreatActionNode(),
      new SequenceNode('Guard Movement', [
        new SimpleGuardMovementNode(),
        new WaitNode(2000) // Wait 2 seconds between movements
      ])
    ]);

    const context: BehaviorContext = {
      characterId: 0,
      gameState: null as any,
      currentTime: Date.now()
    };

    super(root, context);
  }
}
