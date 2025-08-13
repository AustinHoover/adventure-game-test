import { 
  validateNoNodeOverlap, 
  validateGridMap, 
  generateValidationReport,
  extractCoordinateNodes,
  calculateDistance,
  CoordinateNode
} from '../mapValidation';
import { GameMap, Location } from '../../game/interface/map';

describe('Map Validation Functions', () => {
  describe('calculateDistance', () => {
    it('should calculate correct distance between two nodes', () => {
      const node1: CoordinateNode = { id: 1, x: 0, y: 0 };
      const node2: CoordinateNode = { id: 2, x: 3, y: 4 };
      
      const distance = calculateDistance(node1, node2);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should handle 3D coordinates', () => {
      const node1: CoordinateNode = { id: 1, x: 1, y: 1, z: 1 };
      const node2: CoordinateNode = { id: 2, x: 2, y: 2, z: 2 };
      
      const distance = calculateDistance(node1, node2);
      expect(distance).toBeCloseTo(Math.sqrt(3), 5); // √(1² + 1² + 1²) = √3
    });
  });

  describe('extractCoordinateNodes', () => {
    it('should extract nodes from grid-based map', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Test Grid',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 2, south: 6, west: undefined },
          { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 3, south: 7, west: 1 },
        ],
        characterIds: []
      };

      const nodes = extractCoordinateNodes(gameMap, 3); // 3x3 grid
      expect(nodes).toHaveLength(2);
      expect(nodes[0]).toEqual({ id: 1, x: 0, y: 0 });
      expect(nodes[1]).toEqual({ id: 2, x: 1, y: 0 });
    });
  });

  describe('validateNoNodeOverlap', () => {
    it('should validate a valid grid map with no overlaps', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Valid Grid',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 2, south: 4, west: undefined },
          { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 3, south: 5, west: 1 },
          { id: 3, name: 'Location 3', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: undefined, south: 6, west: 2 },
          { id: 4, name: 'Location 4', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 1, east: 5, south: 7, west: undefined },
          { id: 5, name: 'Location 5', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 2, east: 6, south: 8, west: 4 },
          { id: 6, name: 'Location 6', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 3, east: undefined, south: 9, west: 5 },
          { id: 7, name: 'Location 7', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 4, east: 8, south: undefined, west: undefined },
          { id: 8, name: 'Location 8', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 5, east: 9, south: undefined, west: 7 },
          { id: 9, name: 'Location 9', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 6, east: undefined, south: undefined, west: 8 },
        ],
        characterIds: []
      };

      const result = validateNoNodeOverlap(gameMap, 1.0, 3);
      expect(result.isValid).toBe(true);
      expect(result.overlappingNodes).toHaveLength(0);
    });

    it('should detect overlapping nodes', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Overlapping Grid',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 2, south: undefined, west: undefined },
          { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: undefined, south: undefined, west: 1 },
        ],
        characterIds: []
      };

      const result = validateNoNodeOverlap(gameMap, 1.5, 2); // Use higher tolerance to detect the 1-unit separation
      expect(result.isValid).toBe(false);
      expect(result.overlappingNodes).toHaveLength(1);
      expect(result.overlappingNodes[0].node1.id).toBe(1);
      expect(result.overlappingNodes[0].node2.id).toBe(2);
    });

    it('should handle empty map', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Empty Map',
        locations: [],
        characterIds: []
      };

      const result = validateNoNodeOverlap(gameMap);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Map has no locations to validate');
    });

    it('should handle single location map', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Single Location',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: undefined, south: undefined, west: undefined },
        ],
        characterIds: []
      };

      const result = validateNoNodeOverlap(gameMap);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Map has only one location - no overlap possible');
    });
  });

  describe('validateGridMap', () => {
    it('should validate a 3x3 grid map correctly', () => {
      const gameMap: GameMap = {
        id: 1,
        name: '3x3 Grid',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 2, south: 4, west: undefined },
          { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 3, south: 5, west: 1 },
          { id: 3, name: 'Location 3', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: undefined, south: 6, west: 2 },
          { id: 4, name: 'Location 4', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 1, east: 5, south: 7, west: undefined },
          { id: 5, name: 'Location 5', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 2, east: 6, south: 8, west: 4 },
          { id: 6, name: 'Location 6', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 3, east: undefined, south: 9, west: 5 },
          { id: 7, name: 'Location 7', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 4, east: 8, south: undefined, west: undefined },
          { id: 8, name: 'Location 8', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 5, east: 9, south: undefined, west: 7 },
          { id: 9, name: 'Location 9', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 6, east: undefined, south: undefined, west: 8 },
        ],
        characterIds: []
      };

      const result = validateGridMap(gameMap, 3);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect incorrect grid size', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Incorrect Grid',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 2, south: undefined, west: undefined },
          { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: undefined, south: undefined, west: 1 },
        ],
        characterIds: []
      };

      const result = validateGridMap(gameMap, 3); // Expecting 9 locations for 3x3
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected 9 locations for 3x3 grid, but found 2');
    });
  });

  describe('generateValidationReport', () => {
    it('should generate a valid report for an invalid map', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Invalid Map',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 2, south: undefined, west: undefined },
          { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: undefined, south: undefined, west: 1 },
        ],
        characterIds: []
      };

      const result = validateNoNodeOverlap(gameMap, 1.5, 2); // Use higher tolerance to detect the 1-unit separation
      const report = generateValidationReport(result);
      
      expect(report).toContain('Map Validation Report');
      expect(report).toContain('Status: ❌ INVALID');
      expect(report).toContain('Found 1 overlapping node pairs:');
    });

    it('should generate a valid report for a valid map', () => {
      const gameMap: GameMap = {
        id: 1,
        name: 'Valid Map',
        locations: [
          { id: 1, name: 'Location 1', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: 2, south: 3, west: undefined },
          { id: 2, name: 'Location 2', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: undefined, east: undefined, south: 4, west: 1 },
          { id: 3, name: 'Location 3', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 1, east: 4, south: undefined, west: undefined },
          { id: 4, name: 'Location 4', type: 1, visible: true, discovered: true, exit: false, showName: false, objects: [], north: 2, east: undefined, south: undefined, west: 3 },
        ],
        characterIds: []
      };

      const result = validateNoNodeOverlap(gameMap, 1.0, 2);
      const report = generateValidationReport(result);
      
      expect(report).toContain('Map Validation Report');
      expect(report).toContain('Status: ✅ VALID');
    });
  });
});
