import { Character, CharacterRegistryManager } from "../interface/character"

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
        inventory: { items: [], currency: 0 }, // Merchant starts with empty inventory and no currency
        // Combat stats
        level: 3, // Merchants are level 3
        experience: 300, // Experience appropriate for level 3
        raceId: 'human', // Merchants are human
        maxHp: 80, // Moderate HP for a non-combat NPC
        currentHp: 80, // Start at full health
        attack: 12 // Low attack since they're merchants, not fighters
    }
    
    registry.addCharacter(merchant);
    return merchant;
}
