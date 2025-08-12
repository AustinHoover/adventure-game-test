import {
  AIController,
  createBackAndForthAI,
  createDefaultAIController
} from '../AIController';
import { BehaviorTree, BehaviorStatus } from '../BehaviorTree';
import { GameState } from '../../interface/gamestate';
import { Character } from '../../interface/character';
import { GameMap, Location } from '../../interface/map';

// Mock behavior tree for testing
class MockBehaviorTree extends BehaviorTree {
  public executionCount: number = 0;
  public shouldSucceed: boolean = true;
  public shouldRun: boolean = false;

  constructor(shouldSucceed: boolean = true, shouldRun: boolean = false) {
    const mockContext = {
      characterId: 1,
      gameState: {},
      currentTime: Date.now()
    };
    
    // Create a simple mock root node
    const mockRoot = {
      execute: () => {
        this.executionCount++;
        if (this.shouldRun) return BehaviorStatus.RUNNING;
        return this.shouldSucceed ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE;
      },
      reset: () => {},
      getName: () => 'MockRoot'
    };

    super(mockRoot as any, mockContext);
  }

  reset(): void {
    super.reset();
    this.executionCount = 0;
  }
}

// Mock game state for testing
function createMockGameState(): GameState {
  const mockCharacter: Character = {
    id: 1,
    name: 'TestCharacter',
    location: 1,
    unitId: 1,
    mapId: 1,
    shopPools: [],
    inventory: { items: [], currency: 0 },
    level: 1,
    experience: 0,
    raceId: 'human',
    maxHp: 100,
    currentHp: 100,
    attack: 10
  };

  const mockLocation: Location = {
    id: 1,
    name: 'Test Location',
    type: 1,
    visible: true,
    discovered: true,
    exit: false,
    showName: true,
    objects: []
  };

  const mockMap: GameMap = {
    id: 1,
    name: 'Test Map',
    characterIds: [1],
    locations: [mockLocation]
  };

  return {
    name: 'Test Game',
    lastOpened: new Date().toISOString(),
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    characterRegistry: {
      characters: new Map([[1, mockCharacter]])
    },
    playerCharacterId: 1,
    mapRegistry: {
      mapFiles: new Map(),
      cachedMaps: new Map([[1, mockMap]])
    },
    worldState: {
      gameTime: 360
    }
  } as GameState;
}

describe('AIController', () => {
  let mockGameState: GameState;
  let aiController: AIController;

  beforeEach(() => {
    mockGameState = createMockGameState();
    aiController = new AIController(mockGameState);
  });

  afterEach(() => {
    if (aiController.isControllerRunning()) {
      aiController.stop();
    }
  });

  describe('Character Management', () => {
    it('should add and remove characters', () => {
      const behaviorTree = new MockBehaviorTree();
      
      aiController.addCharacter(1, behaviorTree);
      expect(aiController.getCharacterCount()).toBe(1);
      expect(aiController.getCharacterBehavior(1)).toBe(behaviorTree);
      
      aiController.removeCharacter(1);
      expect(aiController.getCharacterCount()).toBe(0);
      expect(aiController.getCharacterBehavior(1)).toBeUndefined();
    });

    it('should handle multiple characters', () => {
      const behaviorTree1 = new MockBehaviorTree();
      const behaviorTree2 = new MockBehaviorTree();
      
      aiController.addCharacter(1, behaviorTree1);
      aiController.addCharacter(2, behaviorTree2);
      
      expect(aiController.getCharacterCount()).toBe(2);
      expect(aiController.getCharacterBehavior(1)).toBe(behaviorTree1);
      expect(aiController.getCharacterBehavior(2)).toBe(behaviorTree2);
    });

    it('should clear all characters', () => {
      const behaviorTree1 = new MockBehaviorTree();
      const behaviorTree2 = new MockBehaviorTree();
      
      aiController.addCharacter(1, behaviorTree1);
      aiController.addCharacter(2, behaviorTree2);
      expect(aiController.getCharacterCount()).toBe(2);
      
      aiController.clear();
      expect(aiController.getCharacterCount()).toBe(0);
    });
  });

  describe('Controller Lifecycle', () => {
    it('should start and stop the controller', () => {
      expect(aiController.isControllerRunning()).toBe(false);
      
      aiController.start();
      expect(aiController.isControllerRunning()).toBe(true);
      
      aiController.stop();
      expect(aiController.isControllerRunning()).toBe(false);
    });

    it('should not start if already running', () => {
      aiController.start();
      expect(aiController.isControllerRunning()).toBe(true);
      
      aiController.start(); // Should not start again
      expect(aiController.isControllerRunning()).toBe(true);
    });

    it('should not stop if not running', () => {
      expect(aiController.isControllerRunning()).toBe(false);
      
      aiController.stop(); // Should not cause issues
      expect(aiController.isControllerRunning()).toBe(false);
    });
  });

  describe('Behavior Execution', () => {
    it('should execute behavior trees for all characters', () => {
      const behaviorTree1 = new MockBehaviorTree();
      const behaviorTree2 = new MockBehaviorTree();
      
      aiController.addCharacter(1, behaviorTree1);
      aiController.addCharacter(2, behaviorTree2);
      
      aiController.start();
      
      // Wait a bit for the interval to execute
      setTimeout(() => {
        expect(behaviorTree1.executionCount).toBeGreaterThan(0);
        expect(behaviorTree2.executionCount).toBeGreaterThan(0);
      }, 150);
    });

    it('should handle behavior execution errors gracefully', () => {
      const failingBehaviorTree = new MockBehaviorTree(false, false);
      aiController.addCharacter(1, failingBehaviorTree);
      
      // Should not throw an error
      expect(() => {
        aiController.start();
        setTimeout(() => aiController.stop(), 150);
      }).not.toThrow();
    });
  });

  describe('Update Interval', () => {
    it('should use the default update interval', () => {
      aiController.start();
      expect(aiController.isControllerRunning()).toBe(true);
      
      aiController.stop();
    });

    it('should allow changing the update interval', () => {
      aiController.setUpdateInterval(200);
      aiController.start();
      
      // Should still be running
      expect(aiController.isControllerRunning()).toBe(true);
      
      aiController.stop();
    });
  });

  describe('Context Updates', () => {
    it('should update context for behavior trees', () => {
      const behaviorTree = new MockBehaviorTree();
      aiController.addCharacter(1, behaviorTree);
      
      // The controller should update the context with current time
      aiController.start();
      
      setTimeout(() => {
        // Context should be updated with current time
        expect(behaviorTree.getContext().currentTime).toBeGreaterThan(0);
        aiController.stop();
      }, 150);
    });
  });
});

describe('createBackAndForthAI', () => {
  it('should create a behavior tree for back and forth movement', () => {
    const behaviorTree = createBackAndForthAI(1, 1, 2, 'north', 1000);
    
    expect(behaviorTree).toBeInstanceOf(BehaviorTree);
    expect(behaviorTree.getContext().characterId).toBe(1);
  });

  it('should create behavior tree with correct parameters', () => {
    const characterId = 5;
    const locationA = 10;
    const locationB = 20;
    const direction = 'east' as const;
    const waitTime = 500;
    
    const behaviorTree = createBackAndForthAI(characterId, locationA, locationB, direction, waitTime);
    
    expect(behaviorTree.getContext().characterId).toBe(characterId);
  });
});

describe('createDefaultAIController', () => {
  it('should create an AI controller with the provided game state', () => {
    const mockGameState = createMockGameState();
    const aiController = createDefaultAIController(mockGameState);
    
    expect(aiController).toBeInstanceOf(AIController);
    expect(aiController.getCharacterCount()).toBe(0);
    expect(aiController.isControllerRunning()).toBe(false);
  });
});

describe('Integration Tests', () => {
  it('should manage a complete AI system lifecycle', () => {
    const mockGameState = createMockGameState();
    const aiController = createDefaultAIController(mockGameState);
    
    // Create behavior trees for multiple characters
    const behaviorTree1 = createBackAndForthAI(1, 1, 2, 'north', 100);
    const behaviorTree2 = createBackAndForthAI(2, 3, 4, 'south', 200);
    
    // Add characters
    aiController.addCharacter(1, behaviorTree1);
    aiController.addCharacter(2, behaviorTree2);
    
    expect(aiController.getCharacterCount()).toBe(2);
    
    // Start the controller
    aiController.start();
    expect(aiController.isControllerRunning()).toBe(true);
    
    // Stop the controller
    aiController.stop();
    expect(aiController.isControllerRunning()).toBe(false);
    
    // Clean up
    aiController.clear();
    expect(aiController.getCharacterCount()).toBe(0);
  });

  it('should handle rapid start/stop cycles', () => {
    const mockGameState = createMockGameState();
    const aiController = createDefaultAIController(mockGameState);
    
    const behaviorTree = new MockBehaviorTree();
    aiController.addCharacter(1, behaviorTree);
    
    // Rapid start/stop cycles
    for (let i = 0; i < 5; i++) {
      aiController.start();
      aiController.stop();
    }
    
    expect(aiController.isControllerRunning()).toBe(false);
    expect(aiController.getCharacterCount()).toBe(1);
  });
});
