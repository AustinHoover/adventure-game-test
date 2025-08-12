import { BehaviorTree, BehaviorContext, SelectorNode } from '../BehaviorTree';
import { IsShopOpenConditionNode } from '../nodes/IsShopOpenConditionNode';
import { OpenShopActionNode } from '../nodes/OpenShopActionNode';
import { WaitForCustomersActionNode } from '../nodes/WaitForCustomersActionNode';

/**
 * Merchant behavior tree that handles shop operations
 */
export class MerchantBehaviorTree extends BehaviorTree {
  constructor() {
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

    super(root, context);
  }
}
