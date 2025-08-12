import { Location, GameMap } from '../game/interface/map';

/**
 * Node used internally by A* algorithm
 */
interface PathNode {
  locationId: number;
  g: number; // Cost from start to this node
  h: number; // Heuristic cost from this node to goal
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

/**
 * A* pathfinding implementation for navigating between locations on a map
 * Returns an array of location IDs representing the path from start to destination
 * 
 * @param map - The game map containing locations
 * @param startLocationId - ID of the starting location
 * @param destinationLocationId - ID of the destination location
 * @returns Array of location IDs in path order, or empty array if no path found
 */
export function findPath(
  map: GameMap,
  startLocationId: number,
  destinationLocationId: number
): number[] {
  // Validate inputs
  if (!map || !map.locations) {
    return [];
  }

  const startLocation = map.locations.find(loc => loc.id === startLocationId);
  const destinationLocation = map.locations.find(loc => loc.id === destinationLocationId);

  if (!startLocation || !destinationLocation) {
    return [];
  }

  // If start and destination are the same, return single location
  if (startLocationId === destinationLocationId) {
    return [startLocationId];
  }

  // Initialize open and closed sets
  const openSet: PathNode[] = [];
  const closedSet = new Set<number>();

  // Create start node
  const startNode: PathNode = {
    locationId: startLocationId,
    g: 0,
    h: calculateHeuristic(startLocation, destinationLocation),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find node with lowest f cost
    let currentNodeIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentNodeIndex].f) {
        currentNodeIndex = i;
      }
    }

    const currentNode = openSet[currentNodeIndex];

    // If we reached the destination, reconstruct and return the path
    if (currentNode.locationId === destinationLocationId) {
      return reconstructPath(currentNode);
    }

    // Move current node from open to closed set
    openSet.splice(currentNodeIndex, 1);
    closedSet.add(currentNode.locationId);

    // Get current location and its neighbors
    const currentLocation = map.locations.find(loc => loc.id === currentNode.locationId);
    if (!currentLocation) continue;

    // Check all four directions for neighbors
    const directions = [
      { key: 'north', dx: 0, dy: -1 },
      { key: 'east', dx: 1, dy: 0 },
      { key: 'south', dx: 0, dy: 1 },
      { key: 'west', dx: -1, dy: 0 }
    ];

    for (const direction of directions) {
      const neighborId = currentLocation[direction.key as keyof Location] as number | undefined;
      
      if (neighborId === undefined) continue;

      // Skip if neighbor is in closed set
      if (closedSet.has(neighborId)) continue;

      // Calculate tentative g cost
      const tentativeG = currentNode.g + 1; // Each step costs 1

      // Find or create neighbor node
      let neighborNode = openSet.find(node => node.locationId === neighborId);
      
      if (!neighborNode) {
        const neighborLocation = map.locations.find(loc => loc.id === neighborId);
        if (!neighborLocation) continue;

        neighborNode = {
          locationId: neighborId,
          g: Infinity,
          h: calculateHeuristic(neighborLocation, destinationLocation),
          f: Infinity,
          parent: null
        };
        openSet.push(neighborNode);
      }

      // If this path is better than previous one, update it
      if (tentativeG < neighborNode.g) {
        neighborNode.parent = currentNode;
        neighborNode.g = tentativeG;
        neighborNode.f = tentativeG + neighborNode.h;
      }
    }
  }

  // No path found
  return [];
}

/**
 * Calculate heuristic distance between two locations
 * Uses Manhattan distance as a simple heuristic
 */
function calculateHeuristic(location1: Location, location2: Location): number {
  // For now, use a simple heuristic based on location IDs
  // In a more sophisticated implementation, you might use actual coordinates
  // or other distance metrics based on your game's needs
  return Math.abs(location1.id - location2.id);
}

/**
 * Reconstruct the path from the destination node back to the start
 */
function reconstructPath(endNode: PathNode): number[] {
  const path: number[] = [];
  let currentNode: PathNode | null = endNode;

  while (currentNode !== null) {
    path.unshift(currentNode.locationId);
    currentNode = currentNode.parent;
  }

  return path;
}

/**
 * Alternative pathfinding function that allows custom movement costs
 * Useful if different terrain types or conditions affect movement
 */
export function findPathWithCosts(
  map: GameMap,
  startLocationId: number,
  destinationLocationId: number,
  getMovementCost: (fromLocation: Location, toLocation: Location) => number
): number[] {
  // This is a more advanced version that could be implemented later
  // For now, it just calls the basic findPath function
  return findPath(map, startLocationId, destinationLocationId);
}

/**
 * Utility function to check if a path exists between two locations
 */
export function pathExists(
  map: GameMap,
  startLocationId: number,
  destinationLocationId: number
): boolean {
  const path = findPath(map, startLocationId, destinationLocationId);
  return path.length > 0;
}

/**
 * Get the distance (number of steps) between two locations
 * Returns -1 if no path exists
 */
export function getPathDistance(
  map: GameMap,
  startLocationId: number,
  destinationLocationId: number
): number {
  const path = findPath(map, startLocationId, destinationLocationId);
  if (path.length === 0) return -1;
  return path.length - 1; // Subtract 1 because path includes start location
}
