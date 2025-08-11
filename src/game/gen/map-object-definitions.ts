import { 
  MapObject, 
  MapObjectType, 
  FurnitureData, 
  ResourceData, 
  MechanicalData, 
  DecorationData, 
  ContainerData 
} from '../interface/map-interfaces';

// Furniture Definitions
export const FURNITURE_DEFINITIONS: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>> = new Map([
  ['bed_wooden', {
    name: 'Wooden Bed',
    description: 'A sturdy wooden bed frame with a comfortable mattress',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'oak',
      condition: 'good',
      comfort: 7,
      storageCapacity: 0
    } as FurnitureData
  }],
  
  ['bed_iron', {
    name: 'Iron Bed',
    description: 'A metal bed frame with iron bars and a soft mattress',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'iron',
      condition: 'pristine',
      comfort: 8,
      storageCapacity: 0
    } as FurnitureData
  }],
  
  ['crafting_table', {
    name: 'Crafting Table',
    description: 'A sturdy workbench for crafting various items',
    type: MapObjectType.FURNITURE,
    visible: true,
    interactable: true,
    data: {
      material: 'pine',
      condition: 'good',
      craftingType: 'general'
    } as FurnitureData
  }],
  
  ['anvil', {
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
    } as ResourceData
  }],
  
  ['tree_pine', {
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
    } as ResourceData
  }],
  
  ['mineral_iron', {
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
    } as ResourceData
  }],
  
  ['mineral_coal', {
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
    } as MechanicalData
  }]
]);

// Decoration Definitions
export const DECORATION_DEFINITIONS: Map<string, Omit<MapObject, 'id' | 'position' | 'locationId'>> = new Map([
  ['torch_wall', {
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
    } as ContainerData
  }],
  
  ['barrel_water', {
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
