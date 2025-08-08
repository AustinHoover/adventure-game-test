export interface ShopPool {
  tag: string; // The tag associated with this shop pool (e.g., "weapons", "potions", "rare_items")
  itemIds: string[]; // Array of item IDs that belong to this pool
}


export const ShopPools: ShopPool[] = [
    {
        tag: "consumables",
        itemIds: [
            "healpot",
        ]
    }
]