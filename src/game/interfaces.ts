export interface Location {
  id: number;
  name: string;
  type: number;
  visible: boolean;
  discovered: boolean;


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