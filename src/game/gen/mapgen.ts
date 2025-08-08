import { GameMap, Location } from '../interface/map-interfaces';
import { CharacterRegistryManager } from '../interface/character-interfaces';
import { TicketSystem } from '../../utils/ticketSystem';
import { generateMerchant } from './chargen';

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
        showName: false, // Don't show names by default
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

/**
 * Generates a town with a main road and buildings branching off
 * @returns Object containing a GameMap and array of Locations
 */
export function generateTown(): { gameMap: GameMap; locations: Location[] } {
  const locations: Location[] = [];
  let nextId = 1;

  // Generate exit location at the beginning of the main road
  const exitId = nextId++;
  const exitLocation: Location = {
    id: exitId,
    name: "Town Exit",
    type: 3, // Exit type
    visible: true,
    discovered: true,
    exit: true, // This is the exit
    showName: true, // Show the exit name
    north: undefined,
    east: nextId, // Connects to the first road segment
    south: undefined,
    west: undefined
  };
  
  locations.push(exitLocation);

  // Generate main road (horizontal line of locations)
  const roadLength = 8; // Number of road segments
  const roadIds: number[] = [];
  
  for (let i = 0; i < roadLength; i++) {
    const roadId = nextId++;
    roadIds.push(roadId);
    
    // Calculate road connections
    const west = i > 0 ? roadIds[i - 1] : exitId; // First road connects to exit
    const east = i < roadLength - 1 ? nextId : undefined;
    
    const roadLocation: Location = {
      id: roadId,
      name: `Road ${roadId}`,
      type: 1, // Road type
      visible: true,
      discovered: true,
      exit: false,
      showName: false, // Roads don't show names
      north: undefined,
      east,
      south: undefined,
      west
    };
    
    locations.push(roadLocation);
  }

  // Generate buildings branching off from the road
  const buildingCount = 6; // Number of buildings to generate
  const buildingIds: number[] = [];
  
  // Track which road segments already have houses on each side
  const roadOccupancy: { [roadId: number]: { north: boolean; south: boolean } } = {};
  roadIds.forEach(roadId => {
    roadOccupancy[roadId] = { north: false, south: false };
  });
  
  for (let i = 0; i < buildingCount; i++) {
    const buildingId = nextId++;
    buildingIds.push(buildingId);
    
    // Find available road segments (those that don't have houses on both sides)
    const availableRoads = roadIds.filter(roadId => {
      const occupancy = roadOccupancy[roadId];
      return !occupancy.north || !occupancy.south;
    });
    
    // If no roads are available, skip this building
    if (availableRoads.length === 0) {
      console.warn(`No available road space for building ${buildingId}, skipping`);
      continue;
    }
    
    // Randomly choose from available road segments
    const roadId = availableRoads[Math.floor(Math.random() * availableRoads.length)];
    const occupancy = roadOccupancy[roadId];
    
    // Determine which side is available
    let isNorth: boolean;
    if (!occupancy.north && !occupancy.south) {
      // Both sides available, choose randomly
      isNorth = Math.random() > 0.5;
    } else if (!occupancy.north) {
      // Only north side available
      isNorth = true;
    } else {
      // Only south side available
      isNorth = false;
    }
    
    const buildingLocation: Location = {
      id: buildingId,
      name: `House ${buildingId}`,
      type: 2, // Building type
      visible: true,
      discovered: true,
      exit: false,
      showName: true, // Buildings show names
      north: isNorth ? undefined : roadId,
      east: undefined,
      south: isNorth ? roadId : undefined,
      west: undefined
    };
    
    locations.push(buildingLocation);
    
    // Use ticket system to determine if this building should have a merchant
    const merchantTicketSystem = new TicketSystem<string>();
    merchantTicketSystem.addOption('no_merchant', 2); // 2 tickets for no merchant
    merchantTicketSystem.addOption('create_merchant', 1); // 1 ticket for creating merchant
    
    const merchantRoll = merchantTicketSystem.selectRandom();
    if (merchantRoll === 'create_merchant') {
      const merchant = generateMerchant(buildingId, 2); // mapId is 2 for town
      console.log(`Generated merchant ${merchant.name} at location ${buildingId}`);
    }
    
    // Update the road location to connect to this building
    const roadLocation = locations.find(loc => loc.id === roadId);
    if (roadLocation) {
      if (isNorth) {
        roadLocation.north = buildingId;
      } else {
        roadLocation.south = buildingId;
      }
    }
    
    // Mark this side as occupied
    if (isNorth) {
      occupancy.north = true;
    } else {
      occupancy.south = true;
    }
  }
  
  // Get character IDs for this map from the registry
  const registryManager = CharacterRegistryManager.getInstance();
  const charactersInMap = registryManager.getAllCharacters().filter(char => char.mapId === 2);
  
  const gameMap: GameMap = {
    id: 2, // Different ID from test area
    locations: locations.map(loc => loc.id),
    characterIds: charactersInMap.map(char => char.id)
  };
  
  return { gameMap, locations };
}

