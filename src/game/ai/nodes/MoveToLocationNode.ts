import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';
import { Location } from '../../interface/map';

/**
 * Action node that moves a character to a specific location
 */
export class MoveToLocationNode extends ActionNode {
  private lastMoveTime: number = 0;
  private moveCooldown: number = 1000; // 1 second cooldown between moves
  private path: number[] = [];
  private currentPathIndex: number = 0;

  constructor(
    private targetLocationId: number,
    private maxPathLength: number = 10 // Maximum path length to prevent infinite loops
  ) {
    super('Move To Location');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const currentTime = context.currentTime;

    // Check if we should wait before moving
    if (currentTime - this.lastMoveTime < this.moveCooldown) {
      return BehaviorStatus.RUNNING;
    }

    // Get current character
    const character = context.gameState.characterRegistry.characters.get(context.characterId);
    if (!character) {
      return BehaviorStatus.FAILURE;
    }

    // Get current map
    const map = context.gameState.mapRegistry.cachedMaps.get(character.mapId);
    if (!map) {
      return BehaviorStatus.FAILURE;
    }

    // Check if we've already reached the target
    if (character.location === this.targetLocationId) {
      return BehaviorStatus.SUCCESS;
    }

    // Calculate path if we don't have one
    if (this.path.length === 0) {
      this.path = this.calculatePath(map, character.location, this.targetLocationId);
      this.currentPathIndex = 0;
      
      if (this.path.length === 0) {
        return BehaviorStatus.FAILURE; // No path found
      }
    }

    // Move along the path
    if (this.currentPathIndex < this.path.length) {
      const nextLocationId = this.path[this.currentPathIndex];
      
      // Verify the next location is accessible
      const currentLocation = map.locations.find((loc: Location) => loc.id === character.location);
      const nextLocation = map.locations.find((loc: Location) => loc.id === nextLocationId);
      
      if (!currentLocation || !nextLocation) {
        return BehaviorStatus.FAILURE;
      }

      // Check if locations are adjacent
      if (this.areLocationsAdjacent(currentLocation, nextLocation)) {
        // Move to next location
        character.location = nextLocationId;
        this.currentPathIndex++;
        this.lastMoveTime = currentTime;
        
        // Check if we've reached the target
        if (character.location === this.targetLocationId) {
          return BehaviorStatus.SUCCESS;
        }
        
        return BehaviorStatus.RUNNING;
      } else {
        // Path is broken, recalculate
        this.path = [];
        this.currentPathIndex = 0;
        return BehaviorStatus.RUNNING;
      }
    }

    // If we've processed the entire path but haven't reached the target
    // (this shouldn't happen with proper pathfinding, but just in case)
    if (this.currentPathIndex >= this.path.length) {
      this.path = [];
      this.currentPathIndex = 0;
      return BehaviorStatus.FAILURE;
    }

    return BehaviorStatus.RUNNING;
  }

  private calculatePath(map: any, startLocationId: number, targetLocationId: number): number[] {
    // Simple breadth-first search for pathfinding
    const visited = new Set<number>();
    const queue: Array<{ locationId: number; path: number[] }> = [{ locationId: startLocationId, path: [] }];
    
    while (queue.length > 0 && queue[0].path.length < this.maxPathLength) {
      const current = queue.shift()!;
      
      if (current.locationId === targetLocationId) {
        return current.path;
      }
      
      if (visited.has(current.locationId)) {
        continue;
      }
      
      visited.add(current.locationId);
      
      const currentLocation = map.locations.find((loc: any) => loc.id === current.locationId);
      if (!currentLocation) continue;
      
      // Check all adjacent locations
      const adjacentLocations = [
        { id: currentLocation.north, direction: 'north' },
        { id: currentLocation.east, direction: 'east' },
        { id: currentLocation.south, direction: 'south' },
        { id: currentLocation.west, direction: 'west' }
      ].filter(adj => adj.id !== undefined);
      
      for (const adj of adjacentLocations) {
        if (!visited.has(adj.id)) {
          const newPath = [...current.path, adj.id];
          queue.push({ locationId: adj.id, path: newPath });
        }
      }
    }
    
    return []; // No path found
  }

  private areLocationsAdjacent(loc1: any, loc2: any): boolean {
    return loc1.north === loc2.id || 
           loc1.east === loc2.id || 
           loc1.south === loc2.id || 
           loc1.west === loc2.id;
  }

  reset(): void {
    super.reset();
    this.lastMoveTime = 0;
    this.path = [];
    this.currentPathIndex = 0;
  }
}
