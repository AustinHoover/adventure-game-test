import { findPath, findPathWithCosts, pathExists, getPathDistance } from './pathfinding';
import { GameMap, Location } from '../game/interface/map';

// Helper function to create a simple test map
function createTestMap(): GameMap {
  return {
    id: 1,
    name: 'Test Map',
    characterIds: [],
    locations: [
      {
        id: 1,
        name: 'Start',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: 2,
        east: undefined,
        south: undefined,
        west: undefined,
        objects: []
      },
      {
        id: 2,
        name: 'Middle',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: 3,
        east: undefined,
        south: 1,
        west: undefined,
        objects: []
      },
      {
        id: 3,
        name: 'End',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: undefined,
        east: undefined,
        south: 2,
        west: undefined,
        objects: []
      }
    ]
  };
}

// Helper function to create a more complex test map with multiple paths
function createComplexTestMap(): GameMap {
  return {
    id: 2,
    name: 'Complex Test Map',
    characterIds: [],
    locations: [
      {
        id: 1,
        name: 'A',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: 2,
        east: 3,
        south: undefined,
        west: undefined,
        objects: []
      },
      {
        id: 2,
        name: 'B',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: 4,
        east: undefined,
        south: 1,
        west: undefined,
        objects: []
      },
      {
        id: 3,
        name: 'C',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: undefined,
        east: undefined,
        south: undefined,
        west: 1,
        objects: []
      },
      {
        id: 4,
        name: 'D',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: undefined,
        east: undefined,
        south: 2,
        west: undefined,
        objects: []
      }
    ]
  };
}

// Helper function to create a disconnected map
function createDisconnectedMap(): GameMap {
  return {
    id: 3,
    name: 'Disconnected Map',
    characterIds: [],
    locations: [
      {
        id: 1,
        name: 'Island A',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: undefined,
        east: undefined,
        south: undefined,
        west: undefined,
        objects: []
      },
      {
        id: 2,
        name: 'Island B',
        type: 1,
        visible: true,
        discovered: true,
        exit: false,
        showName: true,
        north: undefined,
        east: undefined,
        south: undefined,
        west: undefined,
        objects: []
      }
    ]
  };
}

describe('Pathfinding', () => {
  describe('findPath', () => {
    test('should find path in simple linear map', () => {
      const map = createTestMap();
      const path = findPath(map, 1, 3);
      
      expect(path).toEqual([1, 2, 3]);
    });

    test('should find path in reverse direction', () => {
      const map = createTestMap();
      const path = findPath(map, 3, 1);
      
      expect(path).toEqual([3, 2, 1]);
    });

    test('should return single location when start equals destination', () => {
      const map = createTestMap();
      const path = findPath(map, 2, 2);
      
      expect(path).toEqual([2]);
    });

    test('should find shortest path in complex map', () => {
      const map = createComplexTestMap();
      const path = findPath(map, 1, 4);
      
      // Should find the path A -> B -> D (length 3)
      expect(path).toEqual([1, 2, 4]);
    });

    test('should return empty array when no path exists', () => {
      const map = createDisconnectedMap();
      const path = findPath(map, 1, 2);
      
      expect(path).toEqual([]);
    });

    test('should return empty array for invalid start location', () => {
      const map = createTestMap();
      const path = findPath(map, 999, 3);
      
      expect(path).toEqual([]);
    });

    test('should return empty array for invalid destination location', () => {
      const map = createTestMap();
      const path = findPath(map, 1, 999);
      
      expect(path).toEqual([]);
    });

    test('should return empty array for null map', () => {
      const path = findPath(null as any, 1, 3);
      
      expect(path).toEqual([]);
    });

    test('should return empty array for map without locations', () => {
      const map: GameMap = {
        id: 1,
        name: 'Empty Map',
        characterIds: [],
        locations: []
      };
      const path = findPath(map, 1, 3);
      
      expect(path).toEqual([]);
    });

    test('should handle map with undefined locations property', () => {
      const map: GameMap = {
        id: 1,
        name: 'Invalid Map',
        characterIds: [],
        locations: undefined as any
      };
      const path = findPath(map, 1, 3);
      
      expect(path).toEqual([]);
    });
  });

  describe('pathExists', () => {
    test('should return true when path exists', () => {
      const map = createTestMap();
      const exists = pathExists(map, 1, 3);
      
      expect(exists).toBe(true);
    });

    test('should return false when no path exists', () => {
      const map = createDisconnectedMap();
      const exists = pathExists(map, 1, 2);
      
      expect(exists).toBe(false);
    });

    test('should return true for same start and destination', () => {
      const map = createTestMap();
      const exists = pathExists(map, 2, 2);
      
      expect(exists).toBe(true);
    });

    test('should return false for invalid locations', () => {
      const map = createTestMap();
      const exists = pathExists(map, 999, 3);
      
      expect(exists).toBe(false);
    });
  });

  describe('getPathDistance', () => {
    test('should return correct distance for valid path', () => {
      const map = createTestMap();
      const distance = getPathDistance(map, 1, 3);
      
      // Path: 1 -> 2 -> 3, so distance is 2 steps
      expect(distance).toBe(2);
    });

    test('should return 0 for same start and destination', () => {
      const map = createTestMap();
      const distance = getPathDistance(map, 2, 2);
      
      expect(distance).toBe(0);
    });

    test('should return -1 when no path exists', () => {
      const map = createDisconnectedMap();
      const distance = getPathDistance(map, 1, 2);
      
      expect(distance).toBe(-1);
    });

    test('should return -1 for invalid locations', () => {
      const map = createTestMap();
      const distance = getPathDistance(map, 999, 3);
      
      expect(distance).toBe(-1);
    });
  });

  describe('findPathWithCosts', () => {
    test('should call basic findPath function', () => {
      const map = createTestMap();
      const getMovementCost = jest.fn().mockReturnValue(1);
      
      const path = findPathWithCosts(map, 1, 3, getMovementCost);
      
      expect(path).toEqual([1, 2, 3]);
      // Note: Currently this function just calls findPath, so the cost function isn't used yet
    });

    test('should handle custom movement cost function (currently unused)', () => {
      const map = createTestMap();
      const getMovementCost = jest.fn().mockReturnValue(5);
      
      const path = findPathWithCosts(map, 1, 3, getMovementCost);
      
      expect(path).toEqual([1, 2, 3]);
      // Note: The movement cost function is currently not used in the implementation
      // This test documents the current behavior for future enhancement
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    test('should handle map with single location', () => {
      const singleLocationMap: GameMap = {
        id: 1,
        name: 'Single Location Map',
        characterIds: [],
        locations: [
          {
            id: 1,
            name: 'Only Location',
            type: 1,
            visible: true,
            discovered: true,
            exit: false,
            showName: true,
            north: undefined,
            east: undefined,
            south: undefined,
            west: undefined,
            objects: []
          }
        ]
      };
      
      const path = findPath(singleLocationMap, 1, 1);
      expect(path).toEqual([1]);
      
      const distance = getPathDistance(singleLocationMap, 1, 1);
      expect(distance).toBe(0);
    });

    test('should handle circular path', () => {
      const circularMap: GameMap = {
        id: 4,
        name: 'Circular Map',
        characterIds: [],
        locations: [
          {
            id: 1,
            name: 'A',
            type: 1,
            visible: true,
            discovered: true,
            exit: false,
            showName: true,
            north: 2,
            east: undefined,
            south: undefined,
            west: undefined,
            objects: []
          },
          {
            id: 2,
            name: 'B',
            type: 1,
            visible: true,
            discovered: true,
            exit: false,
            showName: true,
            north: undefined,
            east: undefined,
            south: 1,
            west: undefined,
            objects: []
          }
        ]
      };
      
      const path = findPath(circularMap, 1, 2);
      expect(path).toEqual([1, 2]);
      
      const reversePath = findPath(circularMap, 2, 1);
      expect(reversePath).toEqual([2, 1]);
    });

    test('should find optimal path when multiple routes exist', () => {
      const multiPathMap: GameMap = {
        id: 5,
        name: 'Multi-Path Map',
        characterIds: [],
        locations: [
          {
            id: 1,
            name: 'Start',
            type: 1,
            visible: true,
            discovered: true,
            exit: false,
            showName: true,
            north: 2,
            east: 3,
            south: undefined,
            west: undefined,
            objects: []
          },
          {
            id: 2,
            name: 'North Path',
            type: 1,
            visible: true,
            discovered: true,
            exit: false,
            showName: true,
            north: 4,
            east: undefined,
            south: 1,
            west: undefined,
            objects: []
          },
          {
            id: 3,
            name: 'East Path',
            type: 1,
            visible: true,
            discovered: true,
            exit: false,
            showName: true,
            north: undefined,
            east: 4,
            south: undefined,
            west: 1,
            objects: []
          },
          {
            id: 4,
            name: 'End',
            type: 1,
            visible: true,
            discovered: true,
            exit: false,
            showName: true,
            north: undefined,
            east: undefined,
            south: 2,
            west: 3,
            objects: []
          }
        ]
      };
      
      // Both paths should be valid and of equal length
      const path1 = findPath(multiPathMap, 1, 4);
      const path2 = findPath(multiPathMap, 1, 4);
      
      expect(path1.length).toBe(3);
      expect(path2.length).toBe(3);
      expect(path1[0]).toBe(1);
      expect(path1[path1.length - 1]).toBe(4);
      expect(path2[0]).toBe(1);
      expect(path2[path2.length - 1]).toBe(4);
    });
  });
});
