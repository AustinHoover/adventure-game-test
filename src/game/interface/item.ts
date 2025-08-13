
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

/**
 * Adds an item to the inventory. If an item with the same id exists, stack the amount.
 * If the amount is negative, remove that amount from the existing item.
 * If the resulting amount is zero or less, remove the item from the inventory.
 * @param inventory The inventory to modify
 * @param item The item to add (or remove, if amount is negative)
 */
export function addItemToInventory(inventory: Inventory, item: Item): void {
  // Find the index of the item with the same id
  const idx = inventory.items.findIndex(invItem => invItem.id === item.id);

  if (idx !== -1) {
    // Item exists, stack or remove
    inventory.items[idx].amount += item.amount;

    // If amount is zero or less, remove the item from inventory
    if (inventory.items[idx].amount <= 0) {
      inventory.items.splice(idx, 1);
    }
  } else {
    // Item does not exist, only add if amount is positive
    if (item.amount > 0) {
      // Shallow copy to avoid external mutation
      inventory.items.push({ ...item });
    }
    // If amount is negative or zero and item doesn't exist, do nothing
  }
}

