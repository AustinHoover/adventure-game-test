import { GameMap, Location } from '../../interface/map-interfaces';
import { CharacterRegistryManager } from '../../interface/character-interfaces';
import { TicketSystem } from '../../../utils/ticketSystem';
import { generateMerchant } from '../chargen';
import { generateTownName } from '../namegen';
import { 
  getRulesForLocationType,
  injectObjectsIntoNode,
} from './objectinjector';
import { LOCATION_NAME_MAP, LOCATION_TYPE_BUILDING, LOCATION_TYPE_EXIT, LOCATION_TYPE_FIELD, LOCATION_TYPE_ROAD } from '../../data/locationtypes';


/*
  The purpose of this file is to provide fuctions to generate GameMap objects
  Each function is a different type of map. For instance, a field, a town, a dungeon, etc.
*/

function generateLocationType(id: number,locationTypeNum: number): Location {
  const locationType = LOCATION_NAME_MAP[locationTypeNum];
  var location: Location = {
    id,
    name: locationType.name,
    type: locationTypeNum,
    visible: true,
    discovered: true,
    exit: false,
    showName: false,
    objects: [],
  };
  injectObjectsIntoNode(location, getRulesForLocationType(locationTypeNum))
  return location
}


/**
 * Generates a 5x5 grid test area
 * @returns Object containing a GameMap and array of Locations
 */
export function generateTestArea(): GameMap {
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
      
      const location: Location = generateLocationType(id, LOCATION_TYPE_FIELD);
      location.north = north;
      location.east = east;
      location.south = south;
      location.west = west;
      
      locations.push(location);
    }
  }
  
  const gameMap: GameMap = {
    id: 1,
    name: "Test Area", // Generic name for test area
    locations: locations,
    characterIds: [] // No characters by default
  };
  
  return gameMap;
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
  const exitLocation: Location = generateLocationType(exitId, LOCATION_TYPE_EXIT);
  exitLocation.east = nextId
  exitLocation.exit = true
  
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
    
    const roadLocation: Location = generateLocationType(roadId, LOCATION_TYPE_ROAD);
    roadLocation.east = east;
    roadLocation.west = west;
    
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
    
    const buildingLocation: Location = generateLocationType(buildingId, LOCATION_TYPE_BUILDING);
    buildingLocation.north = isNorth ? undefined : roadId;
    buildingLocation.south = isNorth ? roadId : undefined;

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
    name: generateTownName(), // Generate a unique town name
    locations: locations,
    characterIds: charactersInMap.map(char => char.id)
  };
  
  return { gameMap, locations };
}

/**
 * Generates a field map with a square grid and an exit node on the edge
 * @returns Object containing a GameMap and array of Locations
 */
export function generateField(): GameMap {
  const locations: Location[] = [];
  const gridSize = 6; // 6x6 grid for a field
  const totalLocations = gridSize * gridSize;
  
  // Generate grid locations
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const id = row * gridSize + col + 1; // IDs from 1 to 36
      
      // Calculate neighbor IDs
      const north = row > 0 ? (row - 1) * gridSize + col + 1 : undefined;
      const south = row < gridSize - 1 ? (row + 1) * gridSize + col + 1 : undefined;
      const west = col > 0 ? row * gridSize + (col - 1) + 1 : undefined;
      const east = col < gridSize - 1 ? row * gridSize + (col + 1) + 1 : undefined;
      
      // Determine if this is an exit location (edge of the grid)
      const isExit = row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1;
      
      const location: Location = generateLocationType(id, LOCATION_TYPE_FIELD);
      location.exit = isExit
      location.north = north
      location.east = east
      location.south = south
      location.west = west
      
      locations.push(location);
    }
  }
  
  const gameMap: GameMap = {
    id: 999, // Use a high ID to avoid conflicts with stored maps
    name: "Wild Field", // Generic name for field maps
    locations: locations,
    characterIds: [] // No characters by default
  };
  
  return gameMap;
}

