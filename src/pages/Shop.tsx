import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Character } from '../game/interface/character-interfaces';
import type { Item } from '../game/interface/item-interfaces';
import { Items } from '../game/interface/item-interfaces';
import { ShopPools } from '../game/interface/shop-interfaces';

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
            const item = Items.find(i => i.id === itemId);
            if (item) {
              // Add multiple quantities of each item for sale
              vendorInventory.push({
                ...item,
                amount: 5 // Vendor has 5 of each item
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
    console.log('Transaction confirmed:');
    console.log('Items to sell:', itemsToSell);
    console.log('Items to buy:', itemsToBuy);
    // TODO: Implement actual transaction logic
    alert('Transaction functionality will be implemented soon!');
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
      const playerItem = playerCharacter?.inventory.items.find(i => i.id === item.id);
      const inSellQueue = itemsToSell.find(t => t.item.id === item.id)?.quantity || 0;
      return (playerItem?.amount || 0) - inSellQueue;
    } else {
      const inBuyQueue = itemsToBuy.find(t => t.item.id === item.id)?.quantity || 0;
      return item.amount - inBuyQueue;
    }
  };

  return (
    <div className="shop-container" style={{
      padding: '1rem',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Shop - {selectedCharacter?.name || 'Unknown Vendor'}
      </h1>
      
      {!playerCharacter ? (
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
                Currency: {playerCharacter.inventory.currency} coins
              </div>
              
              {playerCharacter.inventory.items.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>No items</p>
              ) : (
                <div>
                  {playerCharacter.inventory.items.map((item, index) => {
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
                            Available: {availableQty}
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
                          Qty: {transaction.quantity}
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
                          Qty: {transaction.quantity}
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
                            Available: {availableQty}
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
              disabled={itemsToSell.length === 0 && itemsToBuy.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: (itemsToSell.length > 0 || itemsToBuy.length > 0) ? '#4CAF50' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (itemsToSell.length > 0 || itemsToBuy.length > 0) ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (itemsToSell.length > 0 || itemsToBuy.length > 0) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }
              }}
              onMouseLeave={(e) => {
                if (itemsToSell.length > 0 || itemsToBuy.length > 0) {
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
