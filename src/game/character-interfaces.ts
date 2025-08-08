export interface Character {
  id: number;
  name: string;
  location: number;
  unitId: number;
  mapId: number; // ID of the map the character is currently on
}

export interface CharacterRegistry {
  characters: Map<number, Character>;
}
