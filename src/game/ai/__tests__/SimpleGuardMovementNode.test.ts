import { SimpleGuardMovementNode } from '../nodes/SimpleGuardMovementNode';
import { BehaviorContext, BehaviorStatus } from '../BehaviorTree';
import { GameMap } from '../../interface/map';

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
    { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], north: 2, east: 3, south: 4, west: 5 },
    { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], south: 1 },
    { id: 3, name: 'Location 3', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], west: 1 },
    { id: 4, name: 'Location 4', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], north: 1 },
    { id: 5, name: 'Location 5', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [], east: 1 },
    { id: 6, name: 'Location 6', type: 1, visible: true, discovered: true, exit: false, showName: true, objects: [] } // Isolated location
  ]
});

describe('SimpleGuardMovementNode', () => {
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
    it('should create a SimpleGuardMovementNode', () => {
      const node = new SimpleGuardMovementNode();
      expect(node.getName()).toBe('Simple Guard Movement');
    });
  });

  describe('execute - left/right movement priority', () => {
    it('should prioritize left (west) and right (east) movement', () => {
      mockCharacter.location = 1; // Location 1 has connections in all directions
      const node = new SimpleGuardMovementNode();
      
      // Execute multiple times to see the movement pattern
      const results: number[] = [];
      for (let i = 0; i < 10; i++) {
        mockContext.currentTime += 4000; // Advance time to avoid cooldown
        const result = node.execute(mockContext);
        if (result === BehaviorStatus.SUCCESS) {
          results.push(mockCharacter.location);
          // Reset character location for next iteration
          mockCharacter.location = 1;
        }
      }
      
      // Should only move to locations 3 (east) or 5 (west) - left/right priority
      const validMoves = [3, 5];
      results.forEach(location => {
        expect(validMoves).toContain(location);
      });
      
      // Should not contain the starting location
      expect(results).not.toContain(1);
    });

    it('should move left (west) when only west is available', () => {
      // Create a map where only west movement is possible
      const limitedMap = createMockMap(1);
      limitedMap.locations[0] = { ...limitedMap.locations[0], east: undefined, north: undefined, south: undefined };
      
      mockGameState.mapRegistry.cachedMaps.set(1, limitedMap);
      mockCharacter.location = 1;
      
      const node = new SimpleGuardMovementNode();
      mockContext.currentTime += 4000; // Advance time to avoid cooldown
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(5); // Should move west (left)
    });

    it('should move right (east) when only east is available', () => {
      // Create a map where only east movement is possible
      const limitedMap = createMockMap(1);
      limitedMap.locations[0] = { ...limitedMap.locations[0], west: undefined, north: undefined, south: undefined };
      
      mockGameState.mapRegistry.cachedMaps.set(1, limitedMap);
      mockCharacter.location = 1;
      
      const node = new SimpleGuardMovementNode();
      mockContext.currentTime += 4000; // Advance time to avoid cooldown
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(3); // Should move east (right)
    });
  });

  describe('execute - fallback to north/south', () => {
    it('should fallback to north/south when left/right not available', () => {
      // Create a map where only north/south movement is possible
      const limitedMap: GameMap = createMockMap(1);
      limitedMap.locations[0] = { ...limitedMap.locations[0], east: undefined, west: undefined };
      
      mockGameState.mapRegistry.cachedMaps.set(1, limitedMap);
      mockCharacter.location = 1;
      
      const node = new SimpleGuardMovementNode();
      mockContext.currentTime += 4000; // Advance time to avoid cooldown
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      // Should move to either north (2) or south (4)
      expect([2, 4]).toContain(mockCharacter.location);
    });

    it('should handle case where only one direction is available', () => {
      // Create a map where only north movement is possible
      const limitedMap: GameMap = createMockMap(1);
      limitedMap.locations[0] = { ...limitedMap.locations[0], east: undefined, west: undefined, south: undefined };
      
      mockGameState.mapRegistry.cachedMaps.set(1, limitedMap);
      mockCharacter.location = 1;
      
      const node = new SimpleGuardMovementNode();
      mockContext.currentTime += 4000; // Advance time to avoid cooldown
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(mockCharacter.location).toBe(2); // Should move north
    });
  });

  describe('execute - edge cases', () => {
    it('should return FAILURE if character not found', () => {
      mockContext.characterId = 999;
      const node = new SimpleGuardMovementNode();
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should return FAILURE if map not found', () => {
      mockGameState.mapRegistry.cachedMaps.clear();
      const node = new SimpleGuardMovementNode();
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });

    it('should return FAILURE if no movement is possible', () => {
      // Place character at isolated location
      mockCharacter.location = 6; // Location 6 has no connections
      const node = new SimpleGuardMovementNode();
      mockContext.currentTime += 4000; // Advance time to avoid cooldown
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('execute - movement cooldown', () => {
    it('should return RUNNING during cooldown period', () => {
      mockCharacter.location = 1;
      const node = new SimpleGuardMovementNode();
      
      // First execution should succeed
      const firstResult = node.execute(mockContext);
      expect(firstResult).toBe(BehaviorStatus.SUCCESS);
      
      // Second execution within cooldown should return RUNNING
      const secondResult = node.execute(mockContext);
      expect(secondResult).toBe(BehaviorStatus.RUNNING);
    });

    it('should allow movement after cooldown period', () => {
      mockCharacter.location = 1;
      const node = new SimpleGuardMovementNode();
      
      // First execution
      node.execute(mockContext);
      
      // Advance time past cooldown
      mockContext.currentTime += 4000; // 4 seconds
      
      // Should be able to move again
      const result = node.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });
  });

  describe('reset', () => {
    it('should reset internal state when called', () => {
      mockCharacter.location = 1;
      const node = new SimpleGuardMovementNode();
      
      // Execute to set lastMoveTime
      node.execute(mockContext);
      
      // Reset
      node.reset();
      
      // Should be able to execute again immediately
      const result = node.execute(mockContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });
  });

  describe('random movement behavior', () => {
    it('should not always move in the same direction', () => {
      mockCharacter.location = 1;
      const node = new SimpleGuardMovementNode();
      
      const movements: number[] = [];
      
      // Execute multiple times to see if movement varies
      for (let i = 0; i < 20; i++) {
        mockContext.currentTime += 4000; // Advance time to avoid cooldown
        const result = node.execute(mockContext);
        if (result === BehaviorStatus.SUCCESS) {
          movements.push(mockCharacter.location);
          // Reset character location for next iteration
          mockCharacter.location = 1;
        }
      }
      
      // Should have some variety in movement (not always the same location)
      const uniqueMovements = new Set(movements);
      expect(uniqueMovements.size).toBeGreaterThan(1);
    });
  });
});
