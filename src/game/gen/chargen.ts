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
        shopPools: ["consumables"]
    }
    
    registry.addCharacter(merchant);
    return merchant;
}
