/**
 * Name generation utilities for the game
 * 
 * This file contains functions to generate various types of names
 * including town names, character names, and other location names.
 */

/**
 * Generates a town name using various naming patterns
 * @returns A randomly generated town name
 */
export function generateTownName(): string {
  const prefixes = [
    'New', 'Old', 'Great', 'Little', 'Upper', 'Lower', 'East', 'West', 'North', 'South',
    'Port', 'Fort', 'Castle', 'Bridge', 'Cross', 'Mill', 'Market', 'Fair', 'Green', 'White',
    'Black', 'Red', 'Blue', 'Golden', 'Silver', 'Iron', 'Stone', 'Wood', 'River', 'Lake',
    'Hill', 'Mountain', 'Valley', 'Forest', 'Meadow', 'Spring', 'Summer', 'Winter', 'Autumn'
  ];

  const roots = [
    'ton', 'ville', 'burg', 'ford', 'bridge', 'port', 'haven', 'field', 'wood', 'stone',
    'hill', 'dale', 'brook', 'creek', 'spring', 'well', 'cross', 'market', 'fair', 'mill',
    'forge', 'smith', 'hall', 'keep', 'tower', 'castle', 'fort', 'gate', 'wall', 'street',
    'road', 'lane', 'way', 'path', 'trail', 'ridge', 'peak', 'cliff', 'bay', 'cove',
    'marsh', 'swamp', 'pond', 'lake', 'river', 'stream', 'canyon', 'grove', 'meadow', 'plain'
  ];

  const suffixes = [
    'shire', 'land', 'stead', 'wick', 'by', 'thorpe', 'ham', 'chester', 'caster', 'minster',
    'church', 'abbey', 'priory', 'monastery', 'temple', 'sanctuary', 'refuge', 'haven', 'home',
    'end', 'side', 'corner', 'point', 'edge', 'border', 'frontier', 'outpost', 'settlement'
  ];

  // 40% chance for prefix + root
  // 30% chance for root + suffix  
  // 20% chance for prefix + root + suffix
  // 10% chance for just root
  const pattern = Math.random();
  
  if (pattern < 0.4) {
    // Prefix + Root
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    return `${prefix}${root.charAt(0).toUpperCase() + root.slice(1)}`;
  } else if (pattern < 0.7) {
    // Root + Suffix
    const root = roots[Math.floor(Math.random() * roots.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${root.charAt(0).toUpperCase() + root.slice(1)}${suffix}`;
  } else if (pattern < 0.9) {
    // Prefix + Root + Suffix
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${root.charAt(0).toUpperCase() + root.slice(1)}${suffix}`;
  } else {
    // Just Root
    const root = roots[Math.floor(Math.random() * roots.length)];
    return root.charAt(0).toUpperCase() + root.slice(1);
  }
}

/**
 * Generates a character name (placeholder for future expansion)
 * @returns A placeholder character name
 */
export function generateCharacterName(): string {
  // TODO: Implement character name generation
  return "Character";
}

/**
 * Generates a location name (placeholder for future expansion)
 * @returns A placeholder location name
 */
export function generateLocationName(): string {
  // TODO: Implement location name generation
  return "Location";
}
