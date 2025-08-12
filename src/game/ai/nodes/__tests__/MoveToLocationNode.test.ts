import { MoveToLocationNode } from '../MoveToLocationNode';
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

// Mock map with locations
const createMockMap = (id: number) => ({
  id,
  name: `Map ${id}`,
  characterIds: [],
  locations: [
    { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], north: 2, east: 3 },
    { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], south: 1, east: 4 },
    { id: 3, name: 'Location 3', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], west: 1, north: 4 },
    { id: 4, name: 'Location 4', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], south: 2, west: 3 },
    { id: 5, name: 'Location 5', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [] } // Isolated location
  ]
});

describe('MoveToLocationNode', () => {
  let mockContext: BehaviorContext;
  let mockGameState: any;
  let mockMap: any;
  let mockCharacter: any;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a MoveToLocationNode with target location', () => {
      const node = new MoveToLocationNode(5);
      expect(node.getName()).toBe('Move To Location');
    });

    it('should accept custom max path length', () => {
      const node = new MoveToLocationNode(5, 20);
      expect(node.getName()).toBe('Move To Location');
    });
  });

  describe('execute - direct movement', () => {
    it('should return SUCCESS if character is already at target location', () => {
      mockCharacter.location = 2;
      const node = new MoveToLocationNode(2);
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });

    it('should move character to adjacent location in one step', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(2);
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(2);
    });

    it('should move character to adjacent location in one step (east)', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(3);
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(3);
    });
  });

  describe('execute - pathfinding', () => {
    it('should find path to diagonal location', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(4);
      
      // First execution should start pathfinding
      let result = node.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      
      // Execute until we reach the target or fail
      let executions = 0;
      const maxExecutions = 10;
      
      while (result !== BehaviorStatus.SUCCESS && result !== BehaviorStatus.FAILURE && executions < maxExecutions) {
        // Advance time to avoid cooldown
        mockContext.currentTime += 2000;
        result = node.execute(mockContext);
        executions++;
      }
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(4);
    });

    it('should handle longer paths', () => {
      // Create a longer path: 1 -> 2 -> 4 -> 5 (if 5 was connected to 4)
      const extendedMap = createMockMap(1);
      extendedMap.locations[3].north = 5; // Connect location 4 to location 5
      extendedMap.locations[4].south = 4; // Connect location 5 to location 4
      
      mockGameState.mapRegistry.cachedMaps.set(1, extendedMap);
      mockCharacter.location = 1;
      
      const node = new MoveToLocationNode(5);
      
      // Execute multiple times to complete the path
      let result: BehaviorStatus = BehaviorStatus.RUNNING;
      let executions = 0;
      const maxExecutions = 10;
      
      while (result !== BehaviorStatus.SUCCESS && executions < maxExecutions) {
        result = node.execute(mockContext);
        executions++;
        
        // Add some time between executions to avoid cooldown
        mockContext.currentTime += 2000;
      }
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(5);
    });
  });

  describe('execute - edge cases', () => {
    it('should return FAILURE if character not found', () => {
      mockContext.characterId = 999;
      const node = new MoveToLocationNode(2);
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should return FAILURE if map not found', () => {
      mockGameState.mapRegistry.cachedMaps.clear();
      const node = new MoveToLocationNode(2);
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should return FAILURE if target location not found', () => {
      const node = new MoveToLocationNode(999);
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should return FAILURE if no path exists to target', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(5); // Location 5 is isolated
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should return FAILURE if path exceeds max length', () => {
      // Create a very long chain of locations
      const longMap: GameMap = createMockMap(1);
      longMap.locations = [];
      
      // Create a chain: 1 -> 2 -> 3 -> ... -> 15
      for (let i = 1; i <= 15; i++) {
        longMap.locations.push({
          id: i,
          name: `Location ${i}`,
          type: 1,
          visible: true,
          discovered: true,
          exit: false,
          showName: true,
          objects: [],
        });
        if (i < 15) {
          longMap.locations[i-1].east = i + 1;
        }
        if (i > 1) {
          longMap.locations[i-1].west = i - 1;
        }
      }
      
      mockGameState.mapRegistry.cachedMaps.set(1, longMap);
      mockCharacter.location = 1;
      
      const node = new MoveToLocationNode(15, 5); // Max path length of 5
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('execute - movement cooldown', () => {
    it('should return RUNNING during cooldown period', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(2);
      
      // First execution should succeed
      const firstResult = node.execute(mockContext);
      expect(firstResult).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(2);
      
      // Second execution within cooldown should return RUNNING
      const secondResult = node.execute(mockContext);
      expect(secondResult).toBe(BehaviorStatus.RUNNING);
    });

    it('should allow movement after cooldown period', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(2);
      
      // First execution
      node.execute(mockContext);
      
      // Advance time past cooldown
      mockContext.currentTime += 2000; // 2 seconds
      
      // Should be able to move again
      const result = node.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });
  });

  describe('reset', () => {
    it('should reset internal state when called', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(2);
      
      // Execute to generate path
      node.execute(mockContext);
      
      // Reset
      node.reset();
      
      // Should be able to execute again from scratch
      const result = node.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(2);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple characters moving simultaneously', () => {
      const character2 = createMockCharacter(2, 3, 1);
      mockGameState.characterRegistry.characters.set(2, character2);
      
      const node1 = new MoveToLocationNode(4);
      const node2 = new MoveToLocationNode(1);
      
      const context1 = { ...mockContext, characterId: 1 };
      const context2 = { ...mockContext, characterId: 2 };
      
      // Execute both nodes with time advancement to avoid cooldown
      let result1 = node1.execute(context1);
      let result2 = node2.execute(context2);
      
      // Complete the movements
      while (result1 === BehaviorStatus.RUNNING) {
        context1.currentTime += 2000;
        result1 = node1.execute(context1);
      }
      
      while (result2 === BehaviorStatus.RUNNING) {
        context2.currentTime += 2000;
        result2 = node2.execute(context2);
      }
      
      expect(result1).toBe(BehaviorStatus.SUCCESS);
      expect(result2).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(4);
      expect(character2.location).toBe(1);
    });

    it('should handle path recalculation when map changes', () => {
      mockCharacter.location = 1;
      const node = new MoveToLocationNode(4);
      
      // Start pathfinding
      node.execute(mockContext);
      
      // Change map structure (remove connection)
      mockMap.locations[0].north = undefined;
      mockMap.locations[1].south = undefined;
      
      // Should recalculate path
      const result = node.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
    });
  });
});
