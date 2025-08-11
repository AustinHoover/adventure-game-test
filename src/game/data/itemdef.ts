import { Item } from "../interface/item";

export type ItemDef = Omit<Item, 'amount' | 'material'> & {
    /**
     * The default type of this item description
     */
    defaultMaterialType: string;
};

export const ITEM_DEFINITIONS: ItemDef[] = [
    {
        id: 'healpot',
        name: 'Healing Potion',
        description: 'A potion that heals 100 health',
        tags: ['consumable', 'healing'],
        cost: 100,
        defaultMaterialType: 'wood'
    }
]