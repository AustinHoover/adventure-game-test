import { addItemToInventory, Inventory, Item } from '../item';

describe('addItemToInventory', () => {
  let inventory: Inventory;
  let testItem: Item;

  beforeEach(() => {
    // Reset inventory before each test
    inventory = {
      items: [],
      currency: 100
    };

    // Create a test item
    testItem = {
      id: 'test_sword',
      name: 'Test Sword',
      amount: 1,
      description: 'A test sword for testing',
      tags: ['weapon', 'sword'],
      cost: 50,
      material: 'iron'
    };
  });

  describe('Adding New Items', () => {
    it('should add a new item to an empty inventory', () => {
      addItemToInventory(inventory, testItem);

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0]).toEqual(testItem);
      expect(inventory.currency).toBe(100); // Currency should remain unchanged
    });

    it('should add a new item to an inventory with existing items', () => {
      const existingItem: Item = {
        id: 'existing_item',
        name: 'Existing Item',
        amount: 1,
        description: 'An existing item',
        tags: ['tool'],
        cost: 25,
        material: 'wood'
      };

      inventory.items.push(existingItem);

      addItemToInventory(inventory, testItem);

      expect(inventory.items).toHaveLength(2);
      expect(inventory.items).toContainEqual(existingItem);
      expect(inventory.items).toContainEqual(testItem);
    });

    it('should not add an item with zero amount', () => {
      const zeroItem = { ...testItem, amount: 0 };
      
      addItemToInventory(inventory, zeroItem);

      expect(inventory.items).toHaveLength(0);
    });

    it('should not add an item with negative amount', () => {
      const negativeItem = { ...testItem, amount: -1 };
      
      addItemToInventory(inventory, negativeItem);

      expect(inventory.items).toHaveLength(0);
    });
  });

  describe('Stacking Existing Items', () => {
    beforeEach(() => {
      // Add the test item to inventory first
      inventory.items.push({ ...testItem });
    });

    it('should stack items with the same ID by adding amounts', () => {
      const additionalItem = { ...testItem, amount: 3 };
      
      addItemToInventory(inventory, additionalItem);

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].amount).toBe(4); // 1 + 3
      expect(inventory.items[0].id).toBe('test_sword');
    });

    it('should handle stacking with different item properties (only amount should change)', () => {
      const modifiedItem = {
        ...testItem,
        amount: 2,
        name: 'Different Name', // This should not affect the existing item
        cost: 999, // This should not affect the existing item
        material: 'gold' // This should not affect the existing item
      };
      
      addItemToInventory(inventory, modifiedItem);

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].amount).toBe(3); // 1 + 2
      expect(inventory.items[0].name).toBe('Test Sword'); // Original name preserved
      expect(inventory.items[0].cost).toBe(50); // Original cost preserved
      expect(inventory.items[0].material).toBe('iron'); // Original material preserved
    });
  });

  describe('Removing Items', () => {
    beforeEach(() => {
      // Add the test item to inventory first
      inventory.items.push({ ...testItem, amount: 5 });
    });

    it('should remove items when amount becomes zero', () => {
      const removeItem = { ...testItem, amount: -5 };
      
      addItemToInventory(inventory, removeItem);

      expect(inventory.items).toHaveLength(0);
    });

    it('should remove items when amount becomes negative', () => {
      const removeItem = { ...testItem, amount: -6 };
      
      addItemToInventory(inventory, removeItem);

      expect(inventory.items).toHaveLength(0);
    });

    it('should reduce amount when removing less than total', () => {
      const removeItem = { ...testItem, amount: -2 };
      
      addItemToInventory(inventory, removeItem);

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].amount).toBe(3); // 5 - 2
    });

    it('should handle removing from non-existent item (do nothing)', () => {
      const nonExistentItem = { ...testItem, id: 'non_existent', amount: -1 };
      
      addItemToInventory(inventory, nonExistentItem);

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].amount).toBe(5); // Unchanged
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple items with same ID correctly', () => {
      // Add multiple items with same ID
      addItemToInventory(inventory, testItem);
      addItemToInventory(inventory, { ...testItem, amount: 2 });
      addItemToInventory(inventory, { ...testItem, amount: 3 });

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].amount).toBe(6); // 1 + 2 + 3
    });

    it('should handle complex add/remove operations', () => {
      // Start with 5 items
      inventory.items.push({ ...testItem, amount: 5 });

      // Add 3 more
      addItemToInventory(inventory, { ...testItem, amount: 3 });
      expect(inventory.items[0].amount).toBe(8);

      // Remove 2
      addItemToInventory(inventory, { ...testItem, amount: -2 });
      expect(inventory.items[0].amount).toBe(6);

      // Remove all
      addItemToInventory(inventory, { ...testItem, amount: -6 });
      expect(inventory.items).toHaveLength(0);
    });

    it('should preserve other items when removing one item', () => {
      const item1 = { ...testItem, id: 'item1', amount: 3 };
      const item2 = { ...testItem, id: 'item2', amount: 2 };
      
      inventory.items.push(item1, item2);

      // Remove item1 completely
      addItemToInventory(inventory, { ...item1, amount: -3 });

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].id).toBe('item2');
      expect(inventory.items[0].amount).toBe(2);
    });

    it('should handle items with very large amounts', () => {
      const largeItem = { ...testItem, amount: 1000000 };
      
      addItemToInventory(inventory, largeItem);

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].amount).toBe(1000000);
    });

    it('should handle items with very small amounts', () => {
      const smallItem = { ...testItem, amount: 0.1 };
      
      addItemToInventory(inventory, smallItem);

      expect(inventory.items).toHaveLength(1);
      expect(inventory.items[0].amount).toBe(0.1);
    });
  });

  describe('Data Integrity', () => {
    it('should not mutate the input item', () => {
      const originalItem = { ...testItem };
      
      addItemToInventory(inventory, testItem);

      expect(testItem).toEqual(originalItem);
      expect(testItem).not.toBe(inventory.items[0]); // Should be different objects
    });

    it('should create a shallow copy of the item when adding', () => {
      addItemToInventory(inventory, testItem);

      expect(inventory.items[0]).toEqual(testItem);
      expect(inventory.items[0]).not.toBe(testItem); // Should be a copy, not the same reference
    });

    it('should preserve all item properties exactly', () => {
      const complexItem: Item = {
        id: 'complex_item',
        name: 'Complex Item',
        amount: 1,
        description: 'A very complex item with many properties',
        tags: ['rare', 'magic', 'legendary', 'unique'],
        cost: 9999,
        material: 'mithril'
      };

      addItemToInventory(inventory, complexItem);

      expect(inventory.items[0]).toEqual(complexItem);
      expect(inventory.items[0].tags).toEqual(['rare', 'magic', 'legendary', 'unique']);
      expect(inventory.items[0].cost).toBe(9999);
      expect(inventory.items[0].material).toBe('mithril');
    });
  });

  describe('Inventory State Consistency', () => {
    it('should maintain inventory structure', () => {
      addItemToInventory(inventory, testItem);

      expect(inventory).toHaveProperty('items');
      expect(inventory).toHaveProperty('currency');
      expect(Array.isArray(inventory.items)).toBe(true);
      expect(typeof inventory.currency).toBe('number');
    });

    it('should not affect currency when adding items', () => {
      const initialCurrency = inventory.currency;
      
      addItemToInventory(inventory, testItem);

      expect(inventory.currency).toBe(initialCurrency);
    });

    it('should handle empty inventory correctly', () => {
      expect(inventory.items).toHaveLength(0);
      
      addItemToInventory(inventory, testItem);
      
      expect(inventory.items).toHaveLength(1);
    });
  });
});
