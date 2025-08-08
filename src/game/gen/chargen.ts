import { Character, CharacterRegistryManager } from "../interface/character-interfaces"

export const generateMerchant = (location: number, mapId: number): Character => {
    const registry = CharacterRegistryManager.getInstance();
    const id = registry.getNextId();
    
    const merchant: Character = {
        id: id,
        name: "Merchant",
        location: location,
        unitId: 1,
        mapId: mapId,
        shopPools: ["consumables"],
        inventory: { items: [], currency: 0 } // Merchant starts with empty inventory and no currency
    }
    
    registry.addCharacter(merchant);
    return merchant;
}
