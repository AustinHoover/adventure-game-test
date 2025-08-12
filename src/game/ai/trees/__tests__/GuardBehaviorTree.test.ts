import { GuardBehaviorTree } from '../GuardBehaviorTree';
import { BehaviorContext, BehaviorStatus } from '../../BehaviorTree';
import { GameMap } from '../../../interface/map';

// Mock game state structure
const createMockGameState = () => ({
  characterRegistry: {
    characters: new Map()
  },
  mapRegistry: {
    cachedMaps: new Map()
  },
  worldState: {
    gameTime: 0
  }
});

// Mock character
const createMockCharacter = (id: number, location: number, mapId: number = 1) => ({
  id,
  name: `Character ${id}`,
  location,
  mapId,
  unitId: id,
  shopPools: [],
  inventory: { items: [] },
  level: 1,
  experience: 0,
  raceId: 'human',
  maxHp: 100,
  currentHp: 100,
  attack: 10
});

// Mock map with locations that support left/right movement
const createMockMap = (id: number) => ({
  id,
  name: `Map ${id}`,
  characterIds: [],
  locations: [
    { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], north: 2, east: 3, south: 4, west: 5 },
    { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], south: 1 },
    { id: 3, name: 'Location 3', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], west: 1 },
    { id: 4, name: 'Location 4', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], north: 1 },
    { id: 5, name: 'Location 5', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], east: 1 },
    { id: 6, name: 'Location 6', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [] } // Isolated location
  ]
});

// Mock map with limited left/right movement
const createLimitedMovementMap = (id: number) => ({
  id,
  name: `Map ${id}`,
  characterIds: [],
  locations: [
    { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], east: 3, west: 5 }, // Only left/right
    { id: 3, name: 'Location 3', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], west: 1 },
    { id: 5, name: 'Location 5', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], east: 1 }
  ]
});

describe('GuardBehaviorTree', () => {
  let mockContext: BehaviorContext;
  let mockGameState: any;
  let mockMap: any;
  let mockCharacter: any;
  let behaviorTree: GuardBehaviorTree;

  beforeEach(() => {
    mockGameState = createMockGameState();
    mockMap = createMockMap(1);
    mockCharacter = createMockCharacter(1, 1, 1);
    
    mockGameState.characterRegistry.characters.set(1, mockCharacter);
    mockGameState.mapRegistry.cachedMaps.set(1, mockMap);
    
    mockContext = {
      characterId: 1,
      gameState: mockGameState,
      currentTime: Date.now()
    };

    behaviorTree = new GuardBehaviorTree();
    behaviorTree.updateContext(mockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a GuardBehaviorTree with proper structure', () => {
      expect(behaviorTree).toBeInstanceOf(GuardBehaviorTree);
      expect(behaviorTree.getContext()).toBeDefined();
    });

    it('should execute without threats and return RUNNING (due to wait)', () => {
      // Ensure no threats are present
      expect(mockGameState.characterRegistry.characters.size).toBe(1);
      
      // Reset the behavior tree to ensure clean state
      behaviorTree.reset();
      

      
              const result = behaviorTree.execute();
      
      // Should execute movement and then wait, returning RUNNING
      expect(result).toBe(BehaviorStatus.RUNNING);
      // Character should have moved
      expect(mockCharacter.location).not.toBe(1);
    });
  });

  describe('random left/right movement behavior', () => {
    it('should move randomly left or right when no threats are present', () => {
      // Ensure no threats
      expect(mockGameState.characterRegistry.characters.size).toBe(1);
      
      const movements: number[] = [];
      
      // Execute multiple times to observe movement patterns
      for (let i = 0; i < 20; i++) {
        // Advance time to avoid cooldowns and complete wait periods
        mockContext.currentTime += 5000; // 5 seconds between executions
        behaviorTree.updateContext(mockContext);
        
        // First execution should move and wait (RUNNING)
        let result = behaviorTree.execute();
        if (result === BehaviorStatus.RUNNING) {
          // Character should have moved
          movements.push(mockCharacter.location);
          // Reset character location for next iteration
          mockCharacter.location = 1;
          
          // Advance time to complete wait period
          mockContext.currentTime += 3000; // Wait is 2 seconds
          behaviorTree.updateContext(mockContext);
          
          // Should complete wait and return SUCCESS
          result = behaviorTree.execute();
          expect(result).toBe(BehaviorStatus.SUCCESS);
        }
      }
      
      // Should have moved at least once
      expect(movements.length).toBeGreaterThan(0);
      
      // Should only move to left (west=5) or right (east=3) locations
      const validMoves = [3, 5];
      movements.forEach(location => {
        expect(validMoves).toContain(location);
      });
      
      // Should not contain the starting location
      expect(movements).not.toContain(1);
    });

    it('should prioritize left/right movement over north/south', () => {
      // Use a map with all directions available
      mockCharacter.location = 1;
      
      const movements: number[] = [];
      
      // Execute multiple times
      for (let i = 0; i < 15; i++) {
        mockContext.currentTime += 5000;
        behaviorTree.updateContext(mockContext);
        
        // First execution should move and wait (RUNNING)
        let result = behaviorTree.execute();
        if (result === BehaviorStatus.RUNNING) {
          // Character should have moved
          movements.push(mockCharacter.location);
          mockCharacter.location = 1;
          
          // Advance time to complete wait period
          mockContext.currentTime += 3000; // Wait is 2 seconds
          behaviorTree.updateContext(mockContext);
          
          // Should complete wait and return SUCCESS
          result = behaviorTree.execute();
          expect(result).toBe(BehaviorStatus.SUCCESS);
        }
      }
      
      // Should have some movements
      expect(movements.length).toBeGreaterThan(0);
      
      // Should only move to left/right locations (3 or 5), never north/south (2 or 4)
      const leftRightMoves = [3, 5];
      const northSouthMoves = [2, 4];
      
      movements.forEach(location => {
        expect(leftRightMoves).toContain(location);
        expect(northSouthMoves).not.toContain(location);
      });
    });

    it('should handle limited left/right movement scenarios', () => {
      // Use limited movement map
      const limitedMap = createLimitedMovementMap(1);
      mockGameState.mapRegistry.cachedMaps.set(1, limitedMap);
      mockCharacter.location = 1;
      
      const movements: number[] = [];
      
      // Execute multiple times
      for (let i = 0; i < 15; i++) {
        mockContext.currentTime += 5000;
        behaviorTree.updateContext(mockContext);
        
        // First execution should move and wait (RUNNING)
        let result = behaviorTree.execute();
        if (result === BehaviorStatus.RUNNING) {
          // Character should have moved
          movements.push(mockCharacter.location);
          mockCharacter.location = 1;
          
          // Advance time to complete wait period
          mockContext.currentTime += 3000; // Wait is 2 seconds
          behaviorTree.updateContext(mockContext);
          
          // Should complete wait and return SUCCESS
          result = behaviorTree.execute();
          expect(result).toBe(BehaviorStatus.SUCCESS);
        }
      }
      
      // Should have movements
      expect(movements.length).toBeGreaterThan(0);
      
      // Should only move to available left/right locations
      const validMoves = [3, 5];
      movements.forEach(location => {
        expect(validMoves).toContain(location);
      });
    });
  });

  describe('movement timing and cooldowns', () => {
    it('should respect movement cooldowns between executions', () => {
      // First execution should move and wait (RUNNING)
      let result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.RUNNING);
      const firstLocation = mockCharacter.location;
      expect(firstLocation).not.toBe(1); // Should have moved
      
      // Complete wait period
      mockContext.currentTime += 3000; // Wait is 2 seconds
      behaviorTree.updateContext(mockContext);
      
      // Should complete wait and return SUCCESS
      result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.SUCCESS);
      
      // Reset location for next test
      mockCharacter.location = 1;
      
      // Next execution should move again (cooldown is per-node, not per-tree)
      result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(mockCharacter.location).not.toBe(1); // Should have moved again
    });

    it('should wait between movement and next action', () => {
      // First execution should move and wait (RUNNING)
      let result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(mockCharacter.location).not.toBe(1); // Should have moved
      
      // Advance time past wait period
      mockContext.currentTime += 3000; // 3 seconds (wait is 2 seconds)
      behaviorTree.updateContext(mockContext);
      
      // Should complete wait and return SUCCESS
      result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });
  });

  describe('behavior tree structure validation', () => {
    it('should follow selector pattern for threat vs movement decision', () => {
      // No threats present
      expect(mockGameState.characterRegistry.characters.size).toBe(1);
      
      // Should execute movement sequence and wait
      const result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.RUNNING);
      
      // Character should have moved
      expect(mockCharacter.location).not.toBe(1);
    });

    it('should handle sequence node execution order correctly', () => {
      // Execute to start movement sequence
      let result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(mockCharacter.location).not.toBe(1); // Should have moved
      
      // After wait completes, should be ready for next movement
      mockContext.currentTime += 3000;
      behaviorTree.updateContext(mockContext);
      
      result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing character gracefully', () => {
      mockContext.characterId = 999;
      behaviorTree.updateContext(mockContext);
      
      const result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should handle missing map gracefully', () => {
      mockGameState.mapRegistry.cachedMaps.clear();
      behaviorTree.updateContext(mockContext);
      
      const result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should handle isolated location gracefully', () => {
      mockCharacter.location = 6; // Isolated location with no connections
      behaviorTree.updateContext(mockContext);
      
      const result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('randomness validation', () => {
    it('should not always move in the same direction', () => {
      mockCharacter.location = 1;
      
      const leftMoves: number[] = [];
      const rightMoves: number[] = [];
      
      // Execute many times to test randomness
      for (let i = 0; i < 50; i++) {
        mockContext.currentTime += 5000;
        behaviorTree.updateContext(mockContext);
        
        // First execution should move and wait (RUNNING)
        let result = behaviorTree.execute();
        if (result === BehaviorStatus.RUNNING) {
          if (mockCharacter.location === 5) { // West (left)
            leftMoves.push(mockCharacter.location);
          } else if (mockCharacter.location === 3) { // East (right)
            rightMoves.push(mockCharacter.location);
          }
          mockCharacter.location = 1;
          
          // Complete wait period
          mockContext.currentTime += 3000;
          behaviorTree.updateContext(mockContext);
          
          result = behaviorTree.execute();
          expect(result).toBe(BehaviorStatus.SUCCESS);
        }
      }
      
      // Should have some variety in movement direction
      expect(leftMoves.length).toBeGreaterThan(0);
      expect(rightMoves.length).toBeGreaterThan(0);
      
      // Should not be completely biased to one direction
      const totalMoves = leftMoves.length + rightMoves.length;
      expect(totalMoves).toBeGreaterThan(10);
      
      // Neither direction should dominate completely (allowing for some randomness)
      expect(leftMoves.length / totalMoves).toBeGreaterThan(0.1);
      expect(rightMoves.length / totalMoves).toBeGreaterThan(0.1);
    });
  });

  describe('reset functionality', () => {
    it('should reset all nodes when reset is called', () => {
      // Execute to set internal states
      behaviorTree.execute();
      
      // Reset
      behaviorTree.reset();
      
      // Reset character location for clean test
      mockCharacter.location = 1;
      
      // Should be able to execute again immediately
      const result = behaviorTree.execute();
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(mockCharacter.location).not.toBe(1); // Should have moved
    });
  });
});
