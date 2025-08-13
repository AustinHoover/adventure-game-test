import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Character } from '../game/interface/character';
import type { Item } from '../game/interface/item';
import { ITEM_DEFINITIONS } from '../game/data/itemdef';
import { ShopPools } from '../game/interface/shop';
import { useGame } from '../contexts/GameContext';

interface LocationState {
  selectedCharacter?: Character;
  playerCharacter?: Character;
}

interface TransactionItem {
  item: Item;
  quantity: number;
}

function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCharacter, playerCharacter } = (location.state as LocationState) || {};
  const { currentSave, setCurrentSave } = useGame();

  // Transaction state
  const [itemsToSell, setItemsToSell] = useState<TransactionItem[]>([]);
  const [itemsToBuy, setItemsToBuy] = useState<TransactionItem[]>([]);
  const [vendorItems, setVendorItems] = useState<Item[]>([]);

  // Generate vendor inventory based on shop pools
  useEffect(() => {
    if (selectedCharacter?.shopPools) {
      const vendorInventory: Item[] = [];
      
      selectedCharacter.shopPools.forEach(poolTag => {
        const pool = ShopPools.find(p => p.tag === poolTag);
        if (pool) {
          pool.itemIds.forEach(itemId => {
            const item = ITEM_DEFINITIONS.find(i => i.id === itemId);
            if (item) {
              // Add multiple quantities of each item for sale
              vendorInventory.push({
                ...item,
                amount: 5, // Vendor has 5 of each item
                material: item.defaultMaterialType,
              });
            }
          });
        }
      });
      
      setVendorItems(vendorInventory);
    }
  }, [selectedCharacter]);

  const handleBack = () => {
    navigate('/interaction', { state: { selectedCharacter } });
  };

  const handleConfirmTransaction = () => {
    if (!currentSave || !playerCharacter) {
      console.error('No save file or player character available');
      return;
    }

    console.log('Processing transaction:');
    console.log('Items to sell:', itemsToSell);
    console.log('Items to buy:', itemsToBuy);

    // Get the current player character from the save
    const currentPlayerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
    if (!currentPlayerCharacter) {
      console.error('Player character not found in save');
      return;
    }

    // Create a copy of the player's inventory
    const updatedInventory = {
      items: [...currentPlayerCharacter.inventory.items],
      currency: currentPlayerCharacter.inventory.currency
    };

    // Process items to sell (remove from player inventory, add currency)
    itemsToSell.forEach(transaction => {
      const itemIndex = updatedInventory.items.findIndex(item => item.id === transaction.item.id);
      if (itemIndex !== -1) {
        const currentItem = updatedInventory.items[itemIndex];
        if (currentItem.amount > transaction.quantity) {
          // Reduce quantity
          updatedInventory.items[itemIndex] = {
            ...currentItem,
            amount: currentItem.amount - transaction.quantity
          };
        } else if (currentItem.amount === transaction.quantity) {
          // Remove item completely
          updatedInventory.items.splice(itemIndex, 1);
        }
        // Add currency for sold items
        updatedInventory.currency += transaction.item.cost * transaction.quantity;
      }
    });

    // Process items to buy (add to player inventory, subtract currency)
    itemsToBuy.forEach(transaction => {
      // Subtract currency for bought items
      updatedInventory.currency -= transaction.item.cost * transaction.quantity;
      
      // Check if player already has this item
      const existingItemIndex = updatedInventory.items.findIndex(item => item.id === transaction.item.id);
      if (existingItemIndex !== -1) {
        // Add to existing item
        updatedInventory.items[existingItemIndex] = {
          ...updatedInventory.items[existingItemIndex],
          amount: updatedInventory.items[existingItemIndex].amount + transaction.quantity
        };
      } else {
        // Add new item to inventory
        updatedInventory.items.push({
          ...transaction.item,
          amount: transaction.quantity
        });
      }
    });

    // Update the player character with new inventory
    const updatedPlayerCharacter: Character = {
      ...currentPlayerCharacter,
      inventory: updatedInventory
    };

    // Update the character registry
    const updatedCharacters = new Map(currentSave.characterRegistry.characters);
    updatedCharacters.set(currentSave.playerCharacterId, updatedPlayerCharacter);
    
    const updatedCharacterRegistry = {
      ...currentSave.characterRegistry,
      characters: updatedCharacters
    };

    // Update the save file
    const updatedSave = {
      ...currentSave,
      characterRegistry: updatedCharacterRegistry
    };

    setCurrentSave(updatedSave);

    // Clear transaction state
    setItemsToSell([]);
    setItemsToBuy([]);

    console.log('Transaction completed successfully!');
    console.log('New player currency:', updatedInventory.currency);
    console.log('New player inventory:', updatedInventory.items);
  };

  // Move item from player inventory to sell list
  const moveToSell = (item: Item) => {
    const existingTransaction = itemsToSell.find(t => t.item.id === item.id);
    if (existingTransaction) {
      setItemsToSell(itemsToSell.map(t => 
        t.item.id === item.id 
          ? { ...t, quantity: t.quantity + 1 }
          : t
      ));
    } else {
      setItemsToSell([...itemsToSell, { item, quantity: 1 }]);
    }
  };

  // Move item from sell list back to player inventory
  const moveFromSell = (item: Item) => {
    const existingTransaction = itemsToSell.find(t => t.item.id === item.id);
    if (existingTransaction) {
      if (existingTransaction.quantity === 1) {
        setItemsToSell(itemsToSell.filter(t => t.item.id !== item.id));
      } else {
        setItemsToSell(itemsToSell.map(t => 
          t.item.id === item.id 
            ? { ...t, quantity: t.quantity - 1 }
            : t
        ));
      }
    }
  };

  // Move item from vendor inventory to buy list
  const moveToBuy = (item: Item) => {
    const existingTransaction = itemsToBuy.find(t => t.item.id === item.id);
    if (existingTransaction) {
      setItemsToBuy(itemsToBuy.map(t => 
        t.item.id === item.id 
          ? { ...t, quantity: t.quantity + 1 }
          : t
      ));
    } else {
      setItemsToBuy([...itemsToBuy, { item, quantity: 1 }]);
    }
  };

  // Move item from buy list back to vendor inventory
  const moveFromBuy = (item: Item) => {
    const existingTransaction = itemsToBuy.find(t => t.item.id === item.id);
    if (existingTransaction) {
      if (existingTransaction.quantity === 1) {
        setItemsToBuy(itemsToBuy.filter(t => t.item.id !== item.id));
      } else {
        setItemsToBuy(itemsToBuy.map(t => 
          t.item.id === item.id 
            ? { ...t, quantity: t.quantity - 1 }
            : t
        ));
      }
    }
  };

  const getAvailableQuantity = (item: Item, isPlayerItem: boolean) => {
    if (isPlayerItem) {
      // Get the current player character from the save (which updates after transactions)
      const currentPlayerCharacter = currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId);
      const playerItem = currentPlayerCharacter?.inventory.items.find(i => i.id === item.id);
      const inSellQueue = itemsToSell.find(t => t.item.id === item.id)?.quantity || 0;
      return (playerItem?.amount || 0) - inSellQueue;
    } else {
      const inBuyQueue = itemsToBuy.find(t => t.item.id === item.id)?.quantity || 0;
      return item.amount - inBuyQueue;
    }
  };

  // Calculate the net money change from the transaction
  const calculateMoneyDelta = () => {
    let delta = 0;
    
    // Add money from selling items (positive)
    itemsToSell.forEach(transaction => {
      delta += transaction.item.cost * transaction.quantity;
    });
    
    // Subtract money from buying items (negative)
    itemsToBuy.forEach(transaction => {
      delta -= transaction.item.cost * transaction.quantity;
    });
    
    return delta;
  };

  return (
    <div className="shop-container" style={{
      padding: '1rem',
      minHeight: '100vh',
      backgroundColor: '#2a2a2a',
      color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Shop - {selectedCharacter?.name || 'Unknown Vendor'}
      </h1>
      
      {!currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId) ? (
        <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
          <p>No player character data available</p>
        </div>
      ) : (
        <>
          {/* Three-column layout */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            height: '60vh'
          }}>
            
            {/* Player Inventory (Left) */}
            <div style={{
              flex: 1,
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '1rem',
              overflow: 'auto'
            }}>
              <h3 style={{ marginTop: 0, color: '#4CAF50' }}>Your Inventory</h3>
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#aaa' }}>
                Currency: {currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0} coins
              </div>
              
              {(currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.items.length || 0) === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>No items</p>
              ) : (
                <div>
                  {(currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.items || []).map((item, index) => {
                    const availableQty = getAvailableQuantity(item, true);
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#3a3a3a',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        borderRadius: '4px',
                        border: availableQty <= 0 ? '1px solid #666' : '1px solid #555'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                            Available: {availableQty} • {item.cost} coins each
                          </div>
                        </div>
                        <button
                          onClick={() => moveToSell(item)}
                          disabled={availableQty <= 0}
                          style={{
                            backgroundColor: availableQty > 0 ? '#2196F3' : '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: availableQty > 0 ? 'pointer' : 'not-allowed',
                            fontSize: '0.8rem'
                          }}
                        >
                          →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transaction Summary (Middle) */}
            <div style={{
              flex: 1,
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '1rem',
              overflow: 'auto'
            }}>
              <h3 style={{ marginTop: 0, color: '#FF9800' }}>Transaction Summary</h3>
              
              {/* Money Delta Display */}
              {(itemsToSell.length > 0 || itemsToBuy.length > 0) && (
                <div style={{
                  backgroundColor: '#3a3a3a',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  border: '1px solid #555'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>Net Change:</span>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: calculateMoneyDelta() >= 0 ? '#4CAF50' : '#f44336'
                    }}>
                      {calculateMoneyDelta() >= 0 ? '+' : ''}{calculateMoneyDelta()} coins
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#aaa',
                    marginTop: '0.25rem'
                  }}>
                    Current: {currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0} → New: {(currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0) + calculateMoneyDelta()}
                  </div>
                  {((currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0) + calculateMoneyDelta() < 0) && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#ff6b6b',
                      marginTop: '0.25rem',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ Insufficient funds!
                    </div>
                  )}
                </div>
              )}
              
              {/* Items to Sell */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#f44336', marginBottom: '0.5rem' }}>Selling:</h4>
                {itemsToSell.length === 0 ? (
                  <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>No items to sell</p>
                ) : (
                  itemsToSell.map((transaction, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#4a2a2a',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      borderRadius: '4px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{transaction.item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                          Qty: {transaction.quantity} • +{transaction.item.cost * transaction.quantity} coins
                        </div>
                      </div>
                      <button
                        onClick={() => moveFromSell(transaction.item)}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        ←
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Items to Buy */}
              <div>
                <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Buying:</h4>
                {itemsToBuy.length === 0 ? (
                  <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>No items to buy</p>
                ) : (
                  itemsToBuy.map((transaction, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#2a4a2a',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      borderRadius: '4px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{transaction.item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                          Qty: {transaction.quantity} • -{transaction.item.cost * transaction.quantity} coins
                        </div>
                      </div>
                      <button
                        onClick={() => moveFromBuy(transaction.item)}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vendor Inventory (Right) */}
            <div style={{
              flex: 1,
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '1rem',
              overflow: 'auto'
            }}>
              <h3 style={{ marginTop: 0, color: '#2196F3' }}>Vendor Inventory</h3>
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#aaa' }}>
                Shop Pools: {selectedCharacter?.shopPools?.join(', ') || 'None'}
              </div>
              
              {vendorItems.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>No items for sale</p>
              ) : (
                <div>
                  {vendorItems.map((item, index) => {
                    const availableQty = getAvailableQuantity(item, false);
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#3a3a3a',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        borderRadius: '4px',
                        border: availableQty <= 0 ? '1px solid #666' : '1px solid #555'
                      }}>
                        <button
                          onClick={() => moveToBuy(item)}
                          disabled={availableQty <= 0}
                          style={{
                            backgroundColor: availableQty > 0 ? '#2196F3' : '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: availableQty > 0 ? 'pointer' : 'not-allowed',
                            fontSize: '0.8rem',
                            marginRight: '0.5rem'
                          }}
                        >
                          ←
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                            Available: {availableQty} • {item.cost} coins each
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#aaa' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px'
          }}>
            <button
              onClick={handleBack}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#777'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#666'}
            >
              Back to Interaction
            </button>
            
            <button
              onClick={handleConfirmTransaction}
              disabled={
                (itemsToSell.length === 0 && itemsToBuy.length === 0) || 
                ((currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0) + calculateMoneyDelta() < 0)
              }
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: (
                  (itemsToSell.length > 0 || itemsToBuy.length > 0) && 
                  ((currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0) + calculateMoneyDelta() >= 0)
                ) ? '#4CAF50' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (
                  (itemsToSell.length > 0 || itemsToBuy.length > 0) && 
                  ((currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0) + calculateMoneyDelta() >= 0)
                ) ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (
                  (itemsToSell.length > 0 || itemsToBuy.length > 0) && 
                  ((currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0) + calculateMoneyDelta() >= 0)
                ) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }
              }}
              onMouseLeave={(e) => {
                if (
                  (itemsToSell.length > 0 || itemsToBuy.length > 0) && 
                  ((currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId)?.inventory.currency || 0) + calculateMoneyDelta() >= 0)
                ) {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                }
              }}
            >
              💰 Confirm Transaction
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Shop;
