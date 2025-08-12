/**
 * Behavior Tree implementation for AI characters
 * 
 * A behavior tree is a hierarchical structure that controls AI decision making.
 * Each node in the tree returns a status (SUCCESS, FAILURE, or RUNNING) and
 * the tree is evaluated from top to bottom, left to right.
 */

export enum BehaviorStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  RUNNING = 'RUNNING'
}

/**
 * Base interface for all behavior tree nodes
 */
export interface BehaviorNode {
  /**
   * Execute the behavior node
   * @param context The game context containing character, map, and game state
   * @returns The status of the behavior execution
   */
  execute(context: BehaviorContext): BehaviorStatus;
  
  /**
   * Reset the node's internal state
   */
  reset(): void;
}

/**
 * Context object passed to behavior nodes containing game state
 */
export interface BehaviorContext {
  characterId: number;
  gameState: any; // Will be properly typed when imported
  currentTime: number;
}

/**
 * Base class for behavior nodes
 */
export abstract class BaseBehaviorNode implements BehaviorNode {
  protected name: string;
  protected status: BehaviorStatus = BehaviorStatus.FAILURE;

  constructor(name: string) {
    this.name = name;
  }

  abstract execute(context: BehaviorContext): BehaviorStatus;

  reset(): void {
    this.status = BehaviorStatus.FAILURE;
  }

  getName(): string {
    return this.name;
  }

  getStatus(): BehaviorStatus {
    return this.status;
  }
}

/**
 * Leaf node that performs an action
 */
export abstract class ActionNode extends BaseBehaviorNode {
  constructor(name: string) {
    super(name);
  }

  abstract execute(context: BehaviorContext): BehaviorStatus;
}

/**
 * Leaf node that checks a condition
 */
export abstract class ConditionNode extends BaseBehaviorNode {
  constructor(name: string) {
    super(name);
  }

  abstract execute(context: BehaviorContext): BehaviorStatus;
}

/**
 * Decorator node that modifies the behavior of its child
 */
export abstract class DecoratorNode extends BaseBehaviorNode {
  protected child: BehaviorNode;

  constructor(name: string, child: BehaviorNode) {
    super(name);
    this.child = child;
  }

  reset(): void {
    super.reset();
    this.child.reset();
  }
}

/**
 * Composite node that manages multiple children
 */
export abstract class CompositeNode extends BaseBehaviorNode {
  protected children: BehaviorNode[];

  constructor(name: string, children: BehaviorNode[] = []) {
    super(name);
    this.children = children;
  }

  addChild(child: BehaviorNode): void {
    this.children.push(child);
  }

  removeChild(child: BehaviorNode): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  reset(): void {
    super.reset();
    this.children.forEach(child => child.reset());
  }
}

/**
 * Sequence node - executes children in order until one fails
 */
export class SequenceNode extends CompositeNode {
  private currentChildIndex: number = 0;

  constructor(name: string, children: BehaviorNode[] = []) {
    super(name, children);
  }

  execute(context: BehaviorContext): BehaviorStatus {
    if (this.children.length === 0) {
      return BehaviorStatus.SUCCESS;
    }

    // Execute all children in sequence until one fails or we're done
    while (this.currentChildIndex < this.children.length) {
      const currentChild = this.children[this.currentChildIndex];
      const status = currentChild.execute(context);

      if (status === BehaviorStatus.RUNNING) {
        this.status = BehaviorStatus.RUNNING;
        return BehaviorStatus.RUNNING;
      }

      if (status === BehaviorStatus.FAILURE) {
        // Reset and return failure
        this.currentChildIndex = 0;
        this.status = BehaviorStatus.FAILURE;
        return BehaviorStatus.FAILURE;
      }

      // Child succeeded, move to next
      this.currentChildIndex++;
    }

    // All children succeeded
    this.currentChildIndex = 0;
    this.status = BehaviorStatus.SUCCESS;
    return BehaviorStatus.SUCCESS;
  }

  reset(): void {
    super.reset();
    this.currentChildIndex = 0;
  }
}

/**
 * Selector node - executes children in order until one succeeds
 */
export class SelectorNode extends CompositeNode {
  private currentChildIndex: number = 0;

  constructor(name: string, children: BehaviorNode[] = []) {
    super(name, children);
  }

  execute(context: BehaviorContext): BehaviorStatus {
    if (this.children.length === 0) {
      return BehaviorStatus.FAILURE;
    }

    // Execute all children in sequence until one succeeds or we're done
    while (this.currentChildIndex < this.children.length) {
      const currentChild = this.children[this.currentChildIndex];
      const status = currentChild.execute(context);

      if (status === BehaviorStatus.RUNNING) {
        this.status = BehaviorStatus.RUNNING;
        return BehaviorStatus.RUNNING;
      }

      if (status === BehaviorStatus.SUCCESS) {
        // Reset and return success
        this.currentChildIndex = 0;
        this.status = BehaviorStatus.SUCCESS;
        return BehaviorStatus.SUCCESS;
      }

      // Child failed, move to next
      this.currentChildIndex++;
    }

    // All children failed
    this.currentChildIndex = 0;
    this.status = BehaviorStatus.FAILURE;
    return BehaviorStatus.FAILURE;
  }

  reset(): void {
    super.reset();
    this.currentChildIndex = 0;
  }
}

/**
 * Parallel node - executes all children simultaneously
 */
export class ParallelNode extends CompositeNode {
  constructor(name: string, children: BehaviorNode[] = []) {
    super(name, children);
  }

  execute(context: BehaviorContext): BehaviorStatus {
    if (this.children.length === 0) {
      return BehaviorStatus.SUCCESS;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const child of this.children) {
      const status = child.execute(context);
      
      if (status === BehaviorStatus.SUCCESS) {
        successCount++;
      } else if (status === BehaviorStatus.FAILURE) {
        failureCount++;
      }
    }

    if (failureCount === this.children.length) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    if (successCount === this.children.length) {
      this.status = BehaviorStatus.SUCCESS;
      return BehaviorStatus.SUCCESS;
    }

    this.status = BehaviorStatus.RUNNING;
    return BehaviorStatus.RUNNING;
  }
}

/**
 * Inverter decorator - inverts the result of its child
 */
export class InverterNode extends DecoratorNode {
  constructor(name: string, child: BehaviorNode) {
    super(name, child);
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const status = this.child.execute(context);
    
    if (status === BehaviorStatus.SUCCESS) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    } else if (status === BehaviorStatus.FAILURE) {
      this.status = BehaviorStatus.SUCCESS;
      return BehaviorStatus.SUCCESS;
    }
    
    this.status = BehaviorStatus.RUNNING;
    return BehaviorStatus.RUNNING;
  }
}

/**
 * Repeater decorator - repeats its child a specified number of times
 */
export class RepeaterNode extends DecoratorNode {
  private maxIterations: number;
  private currentIteration: number = 0;

  constructor(name: string, child: BehaviorNode, maxIterations: number = -1) {
    super(name, child);
    this.maxIterations = maxIterations; // -1 means infinite
  }

  execute(context: BehaviorContext): BehaviorStatus {
    if (this.maxIterations !== -1 && this.currentIteration >= this.maxIterations) {
      this.status = BehaviorStatus.SUCCESS;
      return BehaviorStatus.SUCCESS;
    }

    const status = this.child.execute(context);
    
    if (status === BehaviorStatus.RUNNING) {
      this.status = BehaviorStatus.RUNNING;
      return BehaviorStatus.RUNNING;
    }

    if (status === BehaviorStatus.SUCCESS) {
      this.currentIteration++;
      this.child.reset();
      
      // Otherwise, continue running
      this.status = BehaviorStatus.RUNNING;
      return BehaviorStatus.RUNNING;
    }

    // Child failed, stop repeating
    this.status = BehaviorStatus.FAILURE;
    return BehaviorStatus.FAILURE;
  }

  reset(): void {
    super.reset();
    this.currentIteration = 0;
  }
}

/**
 * Main behavior tree class
 */
export class BehaviorTree {
  private root: BehaviorNode;
  private context: BehaviorContext;

  constructor(root: BehaviorNode, context: BehaviorContext) {
    this.root = root;
    this.context = context;
  }

  /**
   * Execute the behavior tree
   */
  execute(): BehaviorStatus {
    return this.root.execute(this.context);
  }

  /**
   * Reset the behavior tree
   */
  reset(): void {
    this.root.reset();
  }

  /**
   * Update the context
   */
  updateContext(context: BehaviorContext): void {
    this.context = context;
  }

  /**
   * Get the current context
   */
  getContext(): BehaviorContext {
    return this.context;
  }
}
