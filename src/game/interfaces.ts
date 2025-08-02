export interface Location {
  id: number;
  name: string;
  type: number;
  visible: boolean;
  discovered: boolean;
  exit: boolean;

  //north-adjacent neighbor
  north?: number;
  //east-adjacent neighbor
  east?: number;
  //south-adjacent neighbor
  south?: number;
  //west-adjacent neighbor
  west?: number;

}

export interface GameMap {
  id: number;
  locations: number[];
}

export interface SaveFile {
  name: string;
  lastOpened: string; // ISO 8601 date string
  version: string; // Game version when save was created
  createdAt: string; // ISO 8601 date string when save was first created
} 