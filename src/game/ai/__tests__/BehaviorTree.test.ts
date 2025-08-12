import {
  BehaviorTree,
  BehaviorStatus,
  BehaviorContext,
  SequenceNode,
  SelectorNode,
  ParallelNode,
  InverterNode,
  RepeaterNode,
  ActionNode,
  ConditionNode
} from '../BehaviorTree';

// Mock behavior nodes for testing
class MockActionNode extends ActionNode {
  private shouldSucceed: boolean;
  private shouldRun: boolean;
  private executionCount: number = 0;

  constructor(name: string, shouldSucceed: boolean = true, shouldRun: boolean = false) {
    super(name);
    this.shouldSucceed = shouldSucceed;
    this.shouldRun = shouldRun;
  }

  execute(context: BehaviorContext): BehaviorStatus {
    this.executionCount++;
    
    if (this.shouldRun) {
      this.status = BehaviorStatus.RUNNING;
      return BehaviorStatus.RUNNING;
    }
    
    const result = this.shouldSucceed ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE;
    this.status = result;
    return result;
  }

  getExecutionCount(): number {
    return this.executionCount;
  }

  reset(): void {
    super.reset();
    this.executionCount = 0;
  }
}

class MockConditionNode extends ConditionNode {
  private shouldSucceed: boolean;

  constructor(name: string, shouldSucceed: boolean = true) {
    super(name);
    this.shouldSucceed = shouldSucceed;
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const result = this.shouldSucceed ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE;
    this.status = result;
    return result;
  }
}

describe('BehaviorTree', () => {
  let mockContext: BehaviorContext;

  beforeEach(() => {
    mockContext = {
      characterId: 1,
      gameState: {},
      currentTime: Date.now()
    };
  });

  describe('MockActionNode', () => {
    it('should execute', () => {
      const node = new MockActionNode('TestNode');
      expect(node.getExecutionCount()).toBe(0);
      expect(node.execute(mockContext)).toBe(BehaviorStatus.SUCCESS);
      expect(node.getExecutionCount()).toBe(1);
    });
  });

  describe('BaseBehaviorNode', () => {
    it('should have a name and status', () => {
      const node = new MockActionNode('TestNode');
      expect(node.getName()).toBe('TestNode');
      expect(node.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should reset status on reset', () => {
      const node = new MockActionNode('TestNode');
      node.execute(mockContext);
      expect(node.getStatus()).toBe(BehaviorStatus.SUCCESS);
      
      node.reset();
      expect(node.getStatus()).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('SequenceNode', () => {
    it('should succeed when all children succeed', () => {
      const child1 = new MockActionNode('Child1');
      const child2 = new MockActionNode('Child2');
      const sequence = new SequenceNode('TestSequence', [child1, child2]);

      const result = sequence.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(sequence.getStatus()).toBe(BehaviorStatus.SUCCESS);
    });

    it('should fail when any child fails', () => {
      const child1 = new MockActionNode('Child1');
      const child2 = new MockActionNode('Child2', false); // This will fail
      const sequence = new SequenceNode('TestSequence', [child1, child2]);

      const result = sequence.execute(mockContext);
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(sequence.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should return running when a child is running', () => {
      const child1 = new MockActionNode('Child1');
      const child2 = new MockActionNode('Child2', true, true); // This will run
      const sequence = new SequenceNode('TestSequence', [child1, child2]);

      const result = sequence.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(sequence.getStatus()).toBe(BehaviorStatus.RUNNING);
    });

    it('should execute children in order', () => {
      const child1 = new MockActionNode('Child1');
      const child2 = new MockActionNode('Child2');
      const sequence = new SequenceNode('TestSequence', [child1, child2]);

      sequence.execute(mockContext);
      expect(child1.getExecutionCount()).toBe(1);
      expect(child2.getExecutionCount()).toBe(1);
    });
  });

  describe('SelectorNode', () => {
    it('should succeed when any child succeeds', () => {
      const child1 = new MockActionNode('Child1', false); // This will fail
      const child2 = new MockActionNode('Child2'); // This will succeed
      const selector = new SelectorNode('TestSelector', [child1, child2]);

      const result = selector.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(selector.getStatus()).toBe(BehaviorStatus.SUCCESS);
    });

    it('should fail when all children fail', () => {
      const child1 = new MockActionNode('Child1', false);
      const child2 = new MockActionNode('Child2', false);
      const selector = new SelectorNode('TestSelector', [child1, child2]);

      const result = selector.execute(mockContext);
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(selector.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should return running when a child is running', () => {
      const child1 = new MockActionNode('Child1', false);
      const child2 = new MockActionNode('Child2', true, true); // This will run
      const selector = new SelectorNode('TestSelector', [child1, child2]);

      const result = selector.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(selector.getStatus()).toBe(BehaviorStatus.RUNNING);
    });
  });

  describe('ParallelNode', () => {
    it('should succeed when all children succeed', () => {
      const child1 = new MockActionNode('Child1');
      const child2 = new MockActionNode('Child2');
      const parallel = new ParallelNode('TestParallel', [child1, child2]);

      const result = parallel.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(parallel.getStatus()).toBe(BehaviorStatus.SUCCESS);
    });

    it('should fail when all children fail', () => {
      const child1 = new MockActionNode('Child1', false);
      const child2 = new MockActionNode('Child2', false);
      const parallel = new ParallelNode('TestParallel', [child1, child2]);

      const result = parallel.execute(mockContext);
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(parallel.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should return running when some children are still running', () => {
      const child1 = new MockActionNode('Child1');
      const child2 = new MockActionNode('Child2', true, true); // This will run
      const parallel = new ParallelNode('TestParallel', [child1, child2]);

      const result = parallel.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(parallel.getStatus()).toBe(BehaviorStatus.RUNNING);
    });
  });

  describe('InverterNode', () => {
    it('should invert success to failure', () => {
      const child = new MockActionNode('Child');
      const inverter = new InverterNode('TestInverter', child);

      const result = inverter.execute(mockContext);
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(inverter.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should invert failure to success', () => {
      const child = new MockActionNode('Child', false);
      const inverter = new InverterNode('TestInverter', child);

      const result = inverter.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(inverter.getStatus()).toBe(BehaviorStatus.SUCCESS);
    });

    it('should preserve running status', () => {
      const child = new MockActionNode('Child', true, true);
      const inverter = new InverterNode('TestInverter', child);

      const result = inverter.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(inverter.getStatus()).toBe(BehaviorStatus.RUNNING);
    });
  });

  describe('RepeaterNode', () => {
    it('should repeat child behavior infinitely when maxIterations is -1', () => {
      const child = new MockActionNode('Child', false, true);
      const repeater = new RepeaterNode('TestRepeater', child, -1);

      expect(child.getExecutionCount()).toBe(0);
      // Execute multiple times
      for (let i = 0; i < 5; i++) {
        const result = repeater.execute(mockContext);
        expect(result).toBe(BehaviorStatus.RUNNING);
        expect(child.getExecutionCount()).toBe(i + 1);
      }
    });

    it('should stop after maxIterations', () => {
      const child = new MockActionNode('Child');
      const repeater = new RepeaterNode('TestRepeater', child, 3);

      // Execute 3 times
      for (let i = 0; i < 3; i++) {
        const result = repeater.execute(mockContext);
        expect(result).toBe(BehaviorStatus.RUNNING);
      }

      // 4th execution should succeed and stop
      const result = repeater.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });

    it('should stop on child failure', () => {
      const child = new MockActionNode('Child', false);
      const repeater = new RepeaterNode('TestRepeater', child, -1);

      const result = repeater.execute(mockContext);
      expect(result).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('BehaviorTree', () => {
    it('should execute root node', () => {
      const root = new MockActionNode('Root');
      const tree = new BehaviorTree(root, mockContext);

      const result = tree.execute();
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });

    it('should update context', () => {
      const root = new MockActionNode('Root');
      const tree = new BehaviorTree(root, mockContext);

      const newContext: BehaviorContext = {
        characterId: 2,
        gameState: {},
        currentTime: Date.now()
      };

      tree.updateContext(newContext);
      expect(tree.getContext()).toBe(newContext);
    });

    it('should reset root node', () => {
      const root = new MockActionNode('Root');
      const tree = new BehaviorTree(root, mockContext);

      tree.execute();
      expect(root.getStatus()).toBe(BehaviorStatus.SUCCESS);

      tree.reset();
      expect(root.getStatus()).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('CompositeNode', () => {
    it('should add and remove children', () => {
      const composite = new SequenceNode('TestComposite');
      const child1 = new MockActionNode('Child1');
      const child2 = new MockActionNode('Child2');

      composite.addChild(child1);
      composite.addChild(child2);
      expect(composite.execute(mockContext)).toBe(BehaviorStatus.SUCCESS);

      composite.removeChild(child1);
      expect(composite.execute(mockContext)).toBe(BehaviorStatus.SUCCESS);
    });
  });
});
