import { 
  MapObject, 
  MapObjectType, 
  FurnitureData, 
  ResourceData, 
  MechanicalData, 
  DecorationData, 
  ContainerData,
  MapObjectCallback
} from '../interface/map';
import { GameState } from '../interface/gamestate';

// Example callback functions
const healingBedCallback: MapObjectCallback = (gameState: GameState, data: any) => {
  // Restore health when sleeping in this bed
  const playerCharacter = gameState.characterRegistry.characters.get(gameState.playerCharacterId);
  if (playerCharacter && data.healingAmount) {
    // This would need to be implemented based on your character health system
    console.log(`Player rested in healing bed, restored ${data.healingAmount} health`);
  }
};

const craftingTableCallback: MapObjectCallback = (gameState: GameState, data: any) => {
  // Open crafting interface when interacting with crafting table
  console.log(`Opening ${data.craftingType} crafting interface`);
  // This would trigger the crafting UI to open
};

const treasureChestCallback: MapObjectCallback = async (gameState: GameState, data: any) => {
  // Generate loot when opening treasure chest
  console.log(`Opening treasure chest with lock level ${data.lockLevel}`);
  // This would handle the loot generation and opening animation
};

const crystalSwitchCallback: MapObjectCallback = (gameState: GameState, data: any) => {
  // Handle crystal switch activation
  console.log(`Crystal switch activated! Effects: ${data.effects.join(', ')}`);
  // This would trigger the effects like illuminating the room or powering machinery
};

// Factory function to create dynamic callbacks
export function createResourceHarvestCallback(resourceType: string, baseYield: number): MapObjectCallback {
  return (gameState: GameState, data: any) => {
    const playerCharacter = gameState.characterRegistry.characters.get(gameState.playerCharacterId);
    if (!playerCharacter) return;

    // Calculate harvest yield based on player skills and tool quality
    const harvestYield = Math.floor(baseYield * (data.quality === 'excellent' ? 1.5 : 1.0));
    
    console.log(`Harvested ${harvestYield} ${resourceType} from ${data.name}`);
    
    // This would add the harvested resources to the player's inventory
    // and update the resource quantity
  };
}

export function createLockedContainerCallback(lockLevel: number, trapLevel: number): MapObjectCallback {
  return async (gameState: GameState, data: any) => {
    const playerCharacter = gameState.characterRegistry.characters.get(gameState.playerCharacterId);
    if (!playerCharacter) return;

    console.log(`Attempting to open ${data.name} (Lock: ${lockLevel}, Trap: ${trapLevel})`);
    
    // This would trigger a lockpicking minigame or skill check
    // and handle trap disarming if needed
  };
}

// Furniture Definitions
export const FURNITURE_DEFINITIONS: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>> = new Map([
  ['bed_wooden', {
    key: 'bed_wooden',
    name: 'Wooden Bed',
    description: 'A sturdy wooden bed frame with a comfortable mattress',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'oak',
      condition: 'good',
      comfort: 7,
      storageCapacity: 0,
      healingAmount: 10
    } as FurnitureData,
    callback: healingBedCallback
  }],
  
  ['bed_iron', {
    key: 'bed_iron',
    name: 'Iron Bed',
    description: 'A metal bed frame with iron bars and a soft mattress',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'iron',
      condition: 'pristine',
      comfort: 8,
      storageCapacity: 0,
      healingAmount: 15
    } as FurnitureData,
    callback: healingBedCallback
  }],
  
  ['crafting_table', {
    key: 'crafting_table',
    name: 'Crafting Table',
    description: 'A sturdy workbench for crafting various items',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'pine',
      condition: 'good',
      craftingType: 'general'
    } as FurnitureData,
    callback: craftingTableCallback
  }],
  
  ['anvil', {
    key: 'anvil',
    name: 'Anvil',
    description: 'A heavy iron anvil for metalworking',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'iron',
      condition: 'worn',
      craftingType: 'blacksmithing'
    } as FurnitureData
  }],
  
  ['chest_wooden', {
    key: 'chest_wooden',
    name: 'Wooden Chest',
    description: 'A wooden storage chest with iron bindings',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'oak',
      condition: 'good',
      storageCapacity: 50
    } as FurnitureData
  }],
  
  ['chair_wooden', {
    key: 'chair_wooden',
    name: 'Wooden Chair',
    description: 'A simple wooden chair',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'pine',
      condition: 'good',
      comfort: 5
    } as FurnitureData
  }]
]);

// Resource Definitions
export const RESOURCE_DEFINITIONS: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>> = new Map([
  ['tree_oak', {
    key: 'tree_oak',
    name: 'Oak Tree',
    description: 'A tall oak tree with sturdy branches',
    type: MapObjectType.RESOURCE,
    visible: true,
    interactable: true,
    data: {
      resourceType: 'wood',
      quantity: 100,
      maxQuantity: 100,
      respawnTime: 3600, // 1 hour
      quality: 'good',
      harvestMethod: 'chopping'
    } as ResourceData,
    callback: createResourceHarvestCallback('wood', 25)
  }],
  
  ['tree_pine', {
    key: 'tree_pine',
    name: 'Pine Tree',
    description: 'A straight pine tree perfect for lumber',
    type: MapObjectType.RESOURCE,
    visible: true,
    interactable: true,
    data: {
      resourceType: 'wood',
      quantity: 80,
      maxQuantity: 80,
      respawnTime: 3000, // 50 minutes
      quality: 'normal',
      harvestMethod: 'chopping'
    } as ResourceData,
    callback: createResourceHarvestCallback('wood', 20)
  }],
  
  ['mineral_iron', {
    key: 'mineral_iron',
    name: 'Iron Deposit',
    description: 'A rich vein of iron ore',
    type: MapObjectType.RESOURCE,
    visible: true,
    interactable: true,
    data: {
      resourceType: 'iron_ore',
      quantity: 200,
      maxQuantity: 200,
      respawnTime: 7200, // 2 hours
      quality: 'excellent',
      harvestMethod: 'mining'
    } as ResourceData,
    callback: createResourceHarvestCallback('iron_ore', 40)
  }],
  
  ['mineral_coal', {
    key: 'mineral_coal',
    name: 'Coal Deposit',
    description: 'A seam of black coal',
    type: MapObjectType.RESOURCE,
    visible: true,
    interactable: true,
    data: {
      resourceType: 'coal',
      quantity: 150,
      maxQuantity: 150,
      respawnTime: 5400, // 1.5 hours
      quality: 'good',
      harvestMethod: 'mining'
    } as ResourceData
  }],
  
  ['herb_healing', {
    key: 'herb_healing',
    name: 'Healing Herb',
    description: 'A cluster of healing herbs',
    type: MapObjectType.RESOURCE,
    visible: true,
    interactable: true,
    data: {
      resourceType: 'healing_herb',
      quantity: 10,
      maxQuantity: 10,
      respawnTime: 1800, // 30 minutes
      quality: 'normal',
      harvestMethod: 'gathering'
    } as ResourceData
  }],
  
  ['berry_bush', {
    key: 'berry_bush',
    name: 'Berry Bush',
    description: 'A bush laden with ripe berries',
    type: MapObjectType.RESOURCE,
    visible: true,
    interactable: true,
    data: {
      resourceType: 'berries',
      quantity: 25,
      maxQuantity: 25,
      respawnTime: 1200, // 20 minutes
      quality: 'good',
      harvestMethod: 'gathering'
    } as ResourceData
  }]
]);

// Mechanical Definitions
export const MECHANICAL_DEFINITIONS: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>> = new Map([
  ['switch_lever', {
    key: 'switch_lever',
    name: 'Lever Switch',
    description: 'A heavy iron lever that can be pulled',
    type: MapObjectType.MECHANICAL,
    visible: true,
    interactable: true,
    data: {
      mechanismType: 'lever',
      isActivated: false,
      effects: ['opens_door', 'activates_bridge'],
      cooldown: 5
    } as MechanicalData
  }],
  
  ['pressure_plate', {
    key: 'pressure_plate',
    name: 'Pressure Plate',
    description: 'A stone plate that responds to weight',
    type: MapObjectType.MECHANICAL,
    visible: true,
    interactable: false,
    data: {
      mechanismType: 'pressure_plate',
      isActivated: false,
      effects: ['reveals_hidden_passage', 'activates_trap'],
      cooldown: 0
    } as MechanicalData
  }],
  
  ['crystal_switch', {
    key: 'crystal_switch',
    name: 'Crystal Switch',
    description: 'A glowing crystal that responds to touch',
    type: MapObjectType.MECHANICAL,
    visible: true,
    interactable: true,
    data: {
      mechanismType: 'crystal',
      isActivated: false,
      activationRequirements: ['magic_essence'],
      effects: ['illuminates_room', 'powers_machinery'],
      cooldown: 30
    } as MechanicalData,
    callback: crystalSwitchCallback
  }]
]);

// Decoration Definitions
export const DECORATION_DEFINITIONS: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>> = new Map([
  ['torch_wall', {
    key: 'torch_wall',
    name: 'Wall Torch',
    description: 'A burning torch mounted on the wall',
    type: MapObjectType.DECORATION,
    visible: true,
    interactable: false,
    data: {
      aestheticValue: 3,
      theme: 'rustic'
    } as DecorationData
  }],
  
  ['banner_noble', {
    key: 'banner_noble',
    name: 'Noble Banner',
    description: 'A fine silk banner with noble insignia',
    type: MapObjectType.DECORATION,
    visible: true,
    interactable: false,
    data: {
      aestheticValue: 8,
      theme: 'elegant'
    } as DecorationData
  }],
  
  ['statue_guardian', {
    key: 'statue_guardian',
    name: 'Guardian Statue',
    description: 'A stone statue of an ancient guardian',
    type: MapObjectType.DECORATION,
    visible: true,
    interactable: false,
    data: {
      aestheticValue: 9,
      theme: 'mystical'
    } as DecorationData
  }]
]);

// Container Definitions
export const CONTAINER_DEFINITIONS: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>> = new Map([
  ['chest_treasure', {
    key: 'chest_treasure',
    name: 'Treasure Chest',
    description: 'An ornate chest that might contain valuables',
    type: MapObjectType.CONTAINER,
    visible: true,
    interactable: true,
    data: {
      containerType: 'chest',
      lockLevel: 3,
      trapLevel: 2,
      contents: ['gold_coins', 'precious_gem'],
      lootTable: 'treasure_chest_common'
    } as ContainerData,
    callback: createLockedContainerCallback(3, 2)
  }],
  
  ['barrel_water', {
    key: 'barrel_water',
    name: 'Water Barrel',
    description: 'A wooden barrel filled with fresh water',
    type: MapObjectType.CONTAINER,
    visible: true,
    interactable: true,
    data: {
      containerType: 'barrel',
      lockLevel: 0,
      trapLevel: 0,
      contents: ['water'],
      lootTable: 'water_barrel'
    } as ContainerData
  }],
  
  ['sack_grain', {
    key: 'sack_grain',
    name: 'Grain Sack',
    description: 'A burlap sack filled with grain',
    type: MapObjectType.CONTAINER,
    visible: true,
    interactable: true,
    data: {
      containerType: 'sack',
      lockLevel: 0,
      trapLevel: 0,
      contents: ['grain', 'flour'],
      lootTable: 'grain_sack'
    } as ContainerData
  }]
]);

// Helper function to get a random object definition by type
export function getRandomObjectByType(type: MapObjectType): Omit<MapObject, 'id' | 'position' | 'locationId'> | null {
  let definitions: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>>;
  
  switch (type) {
    case MapObjectType.FURNITURE:
      definitions = FURNITURE_DEFINITIONS;
      break;
    case MapObjectType.RESOURCE:
      definitions = RESOURCE_DEFINITIONS;
      break;
    case MapObjectType.MECHANICAL:
      definitions = MECHANICAL_DEFINITIONS;
      break;
    case MapObjectType.DECORATION:
      definitions = DECORATION_DEFINITIONS;
      break;
    case MapObjectType.CONTAINER:
      definitions = CONTAINER_DEFINITIONS;
      break;
    default:
      return null;
  }
  
  const keys = Array.from(definitions.keys());
  if (keys.length === 0) return null;
  
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return definitions.get(randomKey) || null;
}

// Helper function to get all object definitions by type
export function getAllObjectsByType(type: MapObjectType): Omit<MapObject, 'id' | 'position' | 'locationId'>[] {
  let definitions: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>>;
  
  switch (type) {
    case MapObjectType.FURNITURE:
      definitions = FURNITURE_DEFINITIONS;
      break;
    case MapObjectType.RESOURCE:
      definitions = RESOURCE_DEFINITIONS;
      break;
    case MapObjectType.MECHANICAL:
      definitions = MECHANICAL_DEFINITIONS;
      break;
    case MapObjectType.DECORATION:
      definitions = DECORATION_DEFINITIONS;
      break;
    case MapObjectType.CONTAINER:
      definitions = CONTAINER_DEFINITIONS;
      break;
    default:
      return [];
  }
  
  return Array.from(definitions.values());
}

/**
 * Finds a matching object definition and applies its callback to a map object
 * @param mapObject The map object to find a callback for
 * @returns The map object with callback applied if a match is found
 */
export function findAndApplyCallback(mapObject: MapObject): MapObject {
  let definitions: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>>;
  
  // Get the appropriate definitions based on object type
  switch (mapObject.type) {
    case MapObjectType.FURNITURE:
      definitions = FURNITURE_DEFINITIONS;
      break;
    case MapObjectType.RESOURCE:
      definitions = RESOURCE_DEFINITIONS;
      break;
    case MapObjectType.MECHANICAL:
      definitions = MECHANICAL_DEFINITIONS;
      break;
    case MapObjectType.DECORATION:
      definitions = DECORATION_DEFINITIONS;
      break;
    case MapObjectType.CONTAINER:
      definitions = CONTAINER_DEFINITIONS;
      break;
    default:
      return mapObject; // No callback for unknown types
  }
  
  // Try to find a matching definition by comparing key properties
  for (const [key, definition] of Array.from(definitions.entries())) {
    if (isMatchingObject(mapObject, definition)) {
      // Apply the callback from the definition
      console.log(`Applied callback for ${mapObject.name} (${mapObject.type}) from definition: ${key}`);
      return {
        ...mapObject,
        callback: definition.callback
      };
    }
  }
  
  // Log when no callback is found (for debugging)
  if (mapObject.type !== MapObjectType.DECORATION) { // Skip decorations as they usually don't have callbacks
    console.log(`No callback found for ${mapObject.name} (${mapObject.type})`);
  }
  
  return mapObject; // No match found, return original object
}

/**
 * Determines if a map object matches a definition based on key properties
 * @param mapObject The map object to check
 * @param definition The definition to match against
 * @returns True if the objects match
 */
function isMatchingObject(
  mapObject: MapObject, 
  definition: Omit<MapObject, 'id' | 'position' | 'locationId'>
): boolean {
  // Match by key first (most reliable and efficient)
  if (mapObject.key === definition.key) {
    return true;
  }
  
  // Fallback to name matching for backward compatibility
  if (mapObject.name === definition.name) {
    return true;
  }
  
  // Match by type and key data properties as additional fallback
  if (mapObject.type === definition.type) {
    // For furniture, match by material and crafting type if available
    if (mapObject.type === MapObjectType.FURNITURE) {
      const mapData = mapObject.data as any;
      const defData = definition.data as any;
      
      if (mapData.material === defData.material) {
        if (defData.craftingType && mapData.craftingType === defData.craftingType) {
          return true;
        }
        if (defData.storageCapacity !== undefined && mapData.storageCapacity === defData.storageCapacity) {
          return true;
        }
      }
    }
    
    // For resources, match by resource type and harvest method
    if (mapObject.type === MapObjectType.RESOURCE) {
      const mapData = mapObject.data as any;
      const defData = definition.data as any;
      
      if (mapData.resourceType === defData.resourceType && 
          mapData.harvestMethod === defData.harvestMethod) {
        return true;
      }
    }
    
    // For mechanical objects, match by mechanism type
    if (mapObject.type === MapObjectType.MECHANICAL) {
      const mapData = mapObject.data as any;
      const defData = definition.data as any;
      
      if (mapData.mechanismType === defData.mechanismType) {
        return true;
      }
    }
    
    // For containers, match by container type
    if (mapObject.type === MapObjectType.CONTAINER) {
      const mapData = mapObject.data as any;
      const defData = definition.data as any;
      
      if (mapData.containerType === defData.containerType) {
        return true;
      }
    }
  }
  
  return false;
}
