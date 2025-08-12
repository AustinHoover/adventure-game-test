import { Character, CharacterRegistryManager } from "../../interface/character"

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
        behaviorTreeId: 'merchant_behavior', // Assign merchant behavior tree
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

export const generateGuard = (location: number, mapId: number): Character => {
    const registry = CharacterRegistryManager.getInstance();
    const id = registry.getNextId();
    
    const guard: Character = {
        id: id,
        name: "Guard",
        location: location,
        unitId: 2, // Different unit ID from merchant
        mapId: mapId,
        shopPools: [], // Guards don't sell items
        inventory: { items: [], currency: 0 }, // Guards start with empty inventory and no currency
        behaviorTreeId: 'guard_patrol', // Assign guard patrol behavior tree
        // Combat stats - Guards are stronger than merchants
        level: 5, // Guards are level 5
        experience: 750, // Experience appropriate for level 5
        raceId: 'human', // Guards are human
        maxHp: 120, // Higher HP for a combat-oriented NPC
        currentHp: 120, // Start at full health
        attack: 25 // Higher attack since they're trained fighters
    }
    
    registry.addCharacter(guard);
    return guard;
}
