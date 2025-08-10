import { 
  MapObject, 
  MapObjectType, 
  MapNode, 
  GameMapWithObjects 
} from '../interface/map-object-interfaces';
import { 
  getRandomObjectByType, 
  getAllObjectsByType 
} from './map-object-definitions';

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
  node: MapNode,
  rules: ObjectInjectionRules[]
): MapNode {
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
          position: positions[i]
        };
        
        objects.push(object);
      }
    }
  }
  
  return {
    ...node,
    objects: [...node.objects, ...objects]
  };
}

/**
 * Injects objects into all nodes of a map based on injection rules
 */
export function injectObjectsIntoMap(
  map: GameMapWithObjects,
  rules: ObjectInjectionRules[]
): GameMapWithObjects {
  return {
    ...map,
    nodes: map.nodes.map(node => injectObjectsIntoNode(node, rules))
  };
}

/**
 * Creates a MapNode from a Location (for backward compatibility)
 */
export function createMapNodeFromLocation(location: any): MapNode {
  return {
    id: location.id,
    name: location.name,
    type: location.type,
    visible: location.visible,
    discovered: location.discovered,
    exit: location.exit,
    showName: location.showName,
    north: location.north,
    east: location.east,
    south: location.south,
    west: location.west,
    objects: []
  };
}

/**
 * Converts a GameMapWithObjects back to the original format for backward compatibility
 */
export function convertMapToOriginalFormat(map: GameMapWithObjects): any {
  return {
    id: map.id,
    name: map.name,
    locations: map.nodes.map(node => node.id),
    characterIds: map.characterIds
  };
}

/**
 * Predefined injection rules for common map types
 */
export const DEFAULT_INJECTION_RULES: ObjectInjectionRules[] = [
  // Town buildings - furniture and decorations
  {
    nodeType: 2, // Building type
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
  
  // Roads - decorations and mechanical devices
  {
    nodeType: 1, // Road type
    objectTypes: [MapObjectType.DECORATION, MapObjectType.MECHANICAL],
    probability: 0.3,
    minCount: 0,
    maxCount: 2,
    placementStrategy: {
      type: 'random',
      maxObjects: 2,
      minDistance: 15
    }
  },
  
  // Field locations - resources
  {
    nodeType: 1, // Field type (assuming type 1 is also used for fields)
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
    nodeType: 3, // Exit type
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
