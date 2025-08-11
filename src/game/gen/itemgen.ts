import { ItemDef } from "../data/itemdef";
import { Item } from "../interface/item";

/**
 * Generates an item from an item definition
 * @param itemDef - The item definition to generate an item from
 * @param amount - The amount of the item to generate
 * @param material - The material of the item to generate
 * @returns The generated item
 */
export function generateItem(itemDef: ItemDef, amount: number = 1, material: string = itemDef.defaultMaterialType): Item {
    return {
        ...itemDef,
        amount: amount,
        material: material
    }
}