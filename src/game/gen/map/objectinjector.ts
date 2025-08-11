import { Location, MapObject, MapObjectType } from '../../interface/map';
import { 
  getRandomObjectByType, 
} from '../../data/mapobject';
import { LOCATION_TYPE_BUILDING, LOCATION_TYPE_EXIT, LOCATION_TYPE_FIELD, LOCATION_TYPE_ROAD } from '../../data/locationtypes';


/*
  This file is responsible for injecting objects into the map.
*/





/**
 * A strategy for placing objects on a map
 */
export interface ObjectPlacementStrategy {
  type: 'random' | 'grid' | 'clustered' | 'thematic';
  maxObjects?: number;
  minDistance?: number;
  preferEdges?: boolean;
  avoidCenter?: boolean;
}

export interface ObjectInjectionRules {
  nodeType: number; // The type of map node this applies to
  objectTypes: MapObjectType[];
  probability: number; // 0.0 to 1.0
  minCount: number;
  maxCount: number;
  placementStrategy: ObjectPlacementStrategy;
}

/**
 * Generates a unique ID for a map object
 */
function generateObjectId(nodeId: number, objectIndex: number): string {
  return `node_${nodeId}_object_${objectIndex}`;
}

/**
 * Generates random positions for objects within a map node
 */
function generateObjectPositions(
  count: number, 
  strategy: ObjectPlacementStrategy
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  
  // Define the node space (assuming a 100x100 grid within each node)
  const nodeWidth = 100;
  const nodeHeight = 100;
  
  switch (strategy.type) {
    case 'random':
      for (let i = 0; i < count; i++) {
        let position: { x: number; y: number };
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
          position = {
            x: Math.floor(Math.random() * nodeWidth),
            y: Math.floor(Math.random() * nodeHeight)
          };
          attempts++;
        } while (
          attempts < maxAttempts && 
          positions.some(pos => 
            Math.sqrt((pos.x - position.x) ** 2 + (pos.y - position.y) ** 2) < (strategy.minDistance || 10)
          )
        );
        
        positions.push(position);
      }
      break;
      
    case 'grid':
      const gridSize = Math.ceil(Math.sqrt(count));
      const cellWidth = nodeWidth / gridSize;
      const cellHeight = nodeHeight / gridSize;
      
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        positions.push({
          x: col * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * 10,
          y: row * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * 10
        });
      }
      break;
      
    case 'clustered':
      // Create clusters of objects
      const clusterCount = Math.ceil(count / 3);
      const clusters: { x: number; y: number }[] = [];
      
      // Generate cluster centers
      for (let i = 0; i < clusterCount; i++) {
        clusters.push({
          x: Math.random() * nodeWidth,
          y: Math.random() * nodeHeight
        });
      }
      
      // Distribute objects around cluster centers
      for (let i = 0; i < count; i++) {
        const cluster = clusters[i % clusterCount];
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 20;
        
        positions.push({
          x: Math.max(0, Math.min(nodeWidth, cluster.x + Math.cos(angle) * distance)),
          y: Math.max(0, Math.min(nodeHeight, cluster.y + Math.sin(angle) * distance))
        });
      }
      break;
      
    case 'thematic':
      // Place objects based on thematic considerations
      for (let i = 0; i < count; i++) {
        let x: number, y: number;
        
        if (strategy.preferEdges) {
          // Prefer edges of the node
          if (Math.random() > 0.5) {
            x = Math.random() > 0.5 ? 0 : nodeWidth;
            y = Math.random() * nodeHeight;
          } else {
            x = Math.random() * nodeWidth;
            y = Math.random() > 0.5 ? 0 : nodeHeight;
          }
        } else if (strategy.avoidCenter) {
          // Avoid the center area
          const centerX = nodeWidth / 2;
          const centerY = nodeHeight / 2;
          const centerRadius = 20;
          
          do {
            x = Math.random() * nodeWidth;
            y = Math.random() * nodeHeight;
          } while (
            Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) < centerRadius
          );
        } else {
          x = Math.random() * nodeWidth;
          y = Math.random() * nodeHeight;
        }
        
        positions.push({ x, y });
      }
      break;
  }
  
  return positions;
}

/**
 * Injects objects into a single map node based on injection rules
 */
export function injectObjectsIntoNode(
  node: Location,
  rules: ObjectInjectionRules[]
): void {
  const applicableRules = rules.filter(rule => rule.nodeType === node.type);
  const objects: MapObject[] = [];
  
  for (const rule of applicableRules) {
    // Check probability
    if (Math.random() > rule.probability) {
      continue;
    }
    
    // Determine object count
    const objectCount = Math.floor(
      Math.random() * (rule.maxCount - rule.minCount + 1) + rule.minCount
    );
    
    // Generate positions
    const positions = generateObjectPositions(objectCount, rule.placementStrategy);
    
    // Create objects
    for (let i = 0; i < objectCount; i++) {
      const objectType = rule.objectTypes[Math.floor(Math.random() * rule.objectTypes.length)];
      const objectDefinition = getRandomObjectByType(objectType);
      
      if (objectDefinition && positions[i]) {
        const object: MapObject = {
          ...objectDefinition,
          id: generateObjectId(node.id, objects.length),
          locationId: node.id,
          position: positions[i],
        };
        
        objects.push(object);
      }
    }
  }
  node.objects = node.objects.concat(objects)
}

/**
 * Predefined injection rules for common map types
 */
export const DEFAULT_INJECTION_RULES: ObjectInjectionRules[] = [
  // Town buildings - furniture and decorations only (no resources in towns)
  {
    nodeType: LOCATION_TYPE_BUILDING, // Building type
    objectTypes: [MapObjectType.FURNITURE, MapObjectType.DECORATION],
    probability: 0.8,
    minCount: 2,
    maxCount: 6,
    placementStrategy: {
      type: 'thematic',
      maxObjects: 6,
      preferEdges: true,
      avoidCenter: false
    }
  },
  
  // Exit locations - containers and mechanical devices
  {
    nodeType: LOCATION_TYPE_EXIT, // Exit type
    objectTypes: [MapObjectType.CONTAINER, MapObjectType.MECHANICAL],
    probability: 0.7,
    minCount: 1,
    maxCount: 3,
    placementStrategy: {
      type: 'thematic',
      maxObjects: 3,
      preferEdges: false,
      avoidCenter: true
    }
  }
];

/**
 * Injection rules specifically for field maps (resources and decorations)
 */
export const FIELD_INJECTION_RULES: ObjectInjectionRules[] = [
  // Field locations - resources
  {
    nodeType: LOCATION_TYPE_FIELD, // Field type
    objectTypes: [MapObjectType.RESOURCE],
    probability: 0.6,
    minCount: 1,
    maxCount: 4,
    placementStrategy: {
      type: 'clustered',
      maxObjects: 4,
      minDistance: 20
    }
  },
  
  // Exit locations - containers and mechanical devices
  {
    nodeType: LOCATION_TYPE_EXIT, // Exit type
    objectTypes: [MapObjectType.CONTAINER, MapObjectType.MECHANICAL],
    probability: 0.7,
    minCount: 1,
    maxCount: 3,
    placementStrategy: {
      type: 'thematic',
      maxObjects: 3,
      preferEdges: false,
      avoidCenter: true
    }
  }
];

/**
 * Helper function to create custom injection rules
 */
export function createInjectionRule(
  nodeType: number,
  objectTypes: MapObjectType[],
  probability: number,
  minCount: number,
  maxCount: number,
  placementStrategy: ObjectPlacementStrategy
): ObjectInjectionRules {
  return {
    nodeType,
    objectTypes,
    probability,
    minCount,
    maxCount,
    placementStrategy
  };
}

/**
 * Returns the injection rules for a given location type
 * @param locationType - The type of location to get rules for
 * @returns The injection rules for the given location type
 */
export function getRulesForLocationType(locationType: number): ObjectInjectionRules[] {
  switch(locationType){
    case LOCATION_TYPE_BUILDING: {
      return DEFAULT_INJECTION_RULES
    }
    case LOCATION_TYPE_FIELD: {
      return FIELD_INJECTION_RULES
    }
    case LOCATION_TYPE_EXIT: {
      return []
    }
    case LOCATION_TYPE_ROAD: {
      return []
    }
    default: {
      throw new Error("Unsupported location type! " + locationType)
    }
  }
}
