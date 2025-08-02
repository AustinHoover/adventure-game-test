export interface Location {
  id: number;
  name: string;
  type: number;
  visible: boolean;
  discovered: boolean;
  north?: number;
  east?: number;
  south?: number;
  west?: number;
}

export interface GameMap {
  id: number;
  locations: number[];
} 