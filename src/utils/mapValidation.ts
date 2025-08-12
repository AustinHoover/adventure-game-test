import { GameMap, Location, MapObject } from '../game/interface/map';

/**
 * Interface for a node with explicit coordinates
 */
export interface CoordinateNode {
  id: number;
  x: number;
  y: number;
  z?: number; // Optional z-coordinate for 3D maps
}

/**
 * Interface for validation results
 */
export interface MapValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  overlappingNodes: Array<{
    node1: CoordinateNode;
    node2: CoordinateNode;
    distance: number;
  }>;
}

/**
 * Converts a grid-based location to coordinate-based positioning
 * Assumes a grid where each node is separated by 1 unit along each axis
 * @param location The location to convert
 * @param gridSize The size of the grid (e.g., 5 for 5x5 grid)
 * @returns CoordinateNode with calculated x, y coordinates
 */
export function locationToCoordinates(location: Location, gridSize: number): CoordinateNode {
  // Calculate position based on ID assuming a grid layout
  // IDs start from 1 and go row by row
  const id = location.id - 1; // Convert to 0-based index
  const row = Math.floor(id / gridSize);
  const col = id % gridSize;
  
  return {
    id: location.id,
    x: col,
    y: row
  };
}

/**
 * Extracts coordinate nodes from a map, handling both explicit coordinates and grid-based positioning
 * @param gameMap The game map to analyze
 * @param gridSize Optional grid size for grid-based maps
 * @returns Array of CoordinateNode objects
 */
export function extractCoordinateNodes(gameMap: GameMap, gridSize?: number): CoordinateNode[] {
  const nodes: CoordinateNode[] = [];
  
  for (const location of gameMap.locations) {
    if (gridSize) {
      // Grid-based positioning
      nodes.push(locationToCoordinates(location, gridSize));
    } else {
      // Try to extract coordinates from map objects if they exist
      const mapObjectWithPosition = location.objects.find(obj => 
        obj.position && typeof obj.position.x === 'number' && typeof obj.position.y === 'number'
      );
      
      if (mapObjectWithPosition) {
        // Use the position from the first map object as the location's position
        nodes.push({
          id: location.id,
          x: mapObjectWithPosition.position.x,
          y: mapObjectWithPosition.position.y
        });
      } else {
        // Fallback: assume grid-based positioning with estimated grid size
        const estimatedGridSize = Math.ceil(Math.sqrt(gameMap.locations.length));
        nodes.push(locationToCoordinates(location, estimatedGridSize));
      }
    }
  }
  
  return nodes;
}

/**
 * Calculates the distance between two coordinate nodes
 * @param node1 First node
 * @param node2 Second node
 * @returns Distance between the nodes
 */
export function calculateDistance(node1: CoordinateNode, node2: CoordinateNode): number {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  const dz = (node1.z || 0) - (node2.z || 0);
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Validates that no nodes overlap in a map
 * Nodes are considered overlapping if they are within a specified tolerance distance
 * @param gameMap The game map to validate
 * @param tolerance Minimum distance required between nodes (default: 1.0)
 * @param gridSize Optional grid size for grid-based maps
 * @returns MapValidationResult with validation details
 */
export function validateNoNodeOverlap(
  gameMap: GameMap, 
  tolerance: number = 1.0,
  gridSize?: number
): MapValidationResult {
  const result: MapValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    overlappingNodes: []
  };
  
  if (!gameMap.locations || gameMap.locations.length === 0) {
    result.errors.push('Map has no locations to validate');
    result.isValid = false;
    return result;
  }
  
  if (gameMap.locations.length === 1) {
    result.warnings.push('Map has only one location - no overlap possible');
    return result;
  }
  
  // Extract coordinate nodes
  const nodes = extractCoordinateNodes(gameMap, gridSize);
  
  // Check for overlapping nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      const distance = calculateDistance(node1, node2);
      
      if (distance < tolerance) {
        result.overlappingNodes.push({
          node1,
          node2,
          distance
        });
        result.isValid = false;
      }
    }
  }
  
  // Generate error messages for overlapping nodes
  if (result.overlappingNodes.length > 0) {
    result.errors.push(`Found ${result.overlappingNodes.length} overlapping node pairs:`);
    result.overlappingNodes.forEach((overlap, index) => {
      result.errors.push(
        `  ${index + 1}. Nodes ${overlap.node1.id} (${overlap.node1.x}, ${overlap.node1.y}) and ` +
        `${overlap.node2.id} (${overlap.node2.x}, ${overlap.node2.y}) are ${overlap.distance.toFixed(3)} units apart`
      );
    });
  }
  
  // Add warnings for nodes that are very close but not overlapping
  const closeThreshold = tolerance * 1.5;
  let closeNodeCount = 0;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = calculateDistance(nodes[i], nodes[j]);
      if (distance >= tolerance && distance < closeThreshold) {
        closeNodeCount++;
      }
    }
  }
  
  if (closeNodeCount > 0) {
    result.warnings.push(`${closeNodeCount} node pairs are very close (within ${closeThreshold.toFixed(1)} units)`);
  }
  
  return result;
}

/**
 * Validates a specific grid-based map (like the test area or field)
 * @param gameMap The game map to validate
 * @param expectedGridSize The expected grid size (e.g., 5 for 5x5)
 * @returns MapValidationResult with validation details
 */
export function validateGridMap(gameMap: GameMap, expectedGridSize: number): MapValidationResult {
  const result = validateNoNodeOverlap(gameMap, 1.0, expectedGridSize);
  
  // Additional grid-specific validation
  const expectedLocationCount = expectedGridSize * expectedGridSize;
  if (gameMap.locations.length !== expectedLocationCount) {
    result.errors.push(
      `Expected ${expectedLocationCount} locations for ${expectedGridSize}x${expectedGridSize} grid, ` +
      `but found ${gameMap.locations.length}`
    );
    result.isValid = false;
  }
  
  // Validate that all locations have proper neighbor connections
  const locationMap = new Map(gameMap.locations.map(loc => [loc.id, loc]));
  
  for (const location of gameMap.locations) {
    const { row, col } = idToGridPosition(location.id, expectedGridSize);
    
    // Check north neighbor
    if (row > 0) {
      const expectedNorthId = (row - 1) * expectedGridSize + col + 1;
      if (location.north !== expectedNorthId) {
        result.warnings.push(
          `Location ${location.id} at (${row}, ${col}) has north neighbor ${location.north}, ` +
          `expected ${expectedNorthId}`
        );
      }
    }
    
    // Check south neighbor
    if (row < expectedGridSize - 1) {
      const expectedSouthId = (row + 1) * expectedGridSize + col + 1;
      if (location.south !== expectedSouthId) {
        result.warnings.push(
          `Location ${location.id} at (${row}, ${col}) has south neighbor ${location.south}, ` +
          `expected ${expectedSouthId}`
        );
      }
    }
    
    // Check west neighbor
    if (col > 0) {
      const expectedWestId = row * expectedGridSize + (col - 1) + 1;
      if (location.west !== expectedWestId) {
        result.warnings.push(
          `Location ${location.id} at (${row}, ${col}) has west neighbor ${location.west}, ` +
          `expected ${expectedWestId}`
        );
      }
    }
    
    // Check east neighbor
    if (col < expectedGridSize - 1) {
      const expectedEastId = row * expectedGridSize + (col + 1) + 1;
      if (location.east !== expectedEastId) {
        result.warnings.push(
          `Location ${location.id} at (${row}, ${col}) has east neighbor ${location.east}, ` +
          `expected ${expectedEastId}`
        );
      }
    }
  }
  
  return result;
}

/**
 * Converts a location ID to grid row and column position
 * @param id The location ID
 * @param gridSize The grid size
 * @returns Object with row and column
 */
function idToGridPosition(id: number, gridSize: number): { row: number; col: number } {
  const index = id - 1; // Convert to 0-based index
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  return { row, col };
}

/**
 * Generates a summary report of map validation
 * @param result The validation result
 * @returns Formatted string summary
 */
export function generateValidationReport(result: MapValidationResult): string {
  let report = `Map Validation Report\n`;
  report += `=====================\n\n`;
  
  report += `Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
  
  if (result.errors.length > 0) {
    report += `Errors (${result.errors.length}):\n`;
    result.errors.forEach(error => {
      report += `  ❌ ${error}\n`;
    });
    report += `\n`;
  }
  
  if (result.warnings.length > 0) {
    report += `Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach(warning => {
      report += `  ⚠️  ${warning}\n`;
    });
    report += `\n`;
  }
  
  if (result.overlappingNodes.length > 0) {
    report += `Overlapping Node Details:\n`;
    result.overlappingNodes.forEach((overlap, index) => {
      report += `  ${index + 1}. Nodes ${overlap.node1.id} and ${overlap.node2.id}\n`;
      report += `     Distance: ${overlap.distance.toFixed(3)} units\n`;
      report += `     Positions: (${overlap.node1.x}, ${overlap.node1.y}) and (${overlap.node2.x}, ${overlap.node2.y})\n\n`;
    });
  }
  
  return report;
}
