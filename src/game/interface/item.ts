
/**
 * The quality of an item
 */
export type Quality = 'poor' | 'normal' | 'good' | 'excellent'

/**
 * An item in the game
 */
export interface Item {
  /**
   * The unique identifier for this item
   */
  id: string;

  /**
   * The name of the item
   */
  name: string;

  /**
   * The quantity/amount of this item
   */
  amount: number;

  /**
   * Description of the item
   */
  description: string;

  /**
   * Array of tags associated with the item (e.g., ["weapon", "rare", "magic"])
   */
  tags: string[];

  /**
   * The cost of the item
   */
  cost: number;

  /**
   * The material this item is made of
   */
  material: string;
}

/**
 * A character's inventory
 */
export interface Inventory {
  /**
   * Array of items in the inventory  
   */
  items: Item[];
  /**
   * Amount of currency/money the character has
   */
  currency: number;
}
