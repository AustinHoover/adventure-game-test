import { GameMap, Location } from './interfaces';

/**
 * Generates a 5x5 grid test area
 * @returns Object containing a GameMap and array of Locations
 */
export function generateTestArea(): { gameMap: GameMap; locations: Location[] } {
  const locations: Location[] = [];
  
  // Generate 5x5 grid (25 locations)
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const id = row * 5 + col + 1; // IDs from 1 to 25
      
      // Calculate neighbor IDs
      const north = row > 0 ? (row - 1) * 5 + col + 1 : undefined;
      const south = row < 4 ? (row + 1) * 5 + col + 1 : undefined;
      const west = col > 0 ? row * 5 + (col - 1) + 1 : undefined;
      const east = col < 4 ? row * 5 + (col + 1) + 1 : undefined;
      
      const location: Location = {
        id,
        name: `Location ${id}`,
        type: Math.floor(Math.random() * 3) + 1, // Random type 1-3
        visible: Math.random() > 0.3, // 70% chance to be visible
        discovered: Math.random() > 0.5, // 50% chance to be discovered
        exit: Math.random() > 0.9, // 10% chance to be an exit
        north,
        east,
        south,
        west
      };
      
      locations.push(location);
    }
  }
  
  const gameMap: GameMap = {
    id: 1,
    locations: locations.map(loc => loc.id),
    characterIds: [] // No characters by default
  };
  
  return { gameMap, locations };
} 