export interface Item {
  id: string; // The unique identifier for this item
  name: string; // The name of the item
  amount: number; // The quantity/amount of this item
  description: string; // Description of the item
  tags: string[]; // Array of tags associated with the item (e.g., ["weapon", "rare", "magic"])
  cost: number; // The cost of the item
}

export interface Inventory {
  items: Item[]; // Array of items in the inventory
  currency: number; // Amount of currency/money the character has
}

export const Items: Item[] = [
  {
    id: "healpot",
    name: "Healing Potion",
    amount: 1,
    description: "A potion that heals 100 health",
    tags: ["consumable", "healing"],
    cost: 100
  }
]
