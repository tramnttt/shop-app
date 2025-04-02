import { useState, useEffect, useCallback } from 'react';
import { Basket, BasketItem } from '../types/basket';

const STORAGE_KEY = 'shop_basket';

// Calculate total price of items in basket
const calculateTotal = (items: BasketItem[]): number => {
    return items.reduce((total, item) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
        return total + (price * item.quantity);
    }, 0);
};

// Load basket from session storage with error handling
const loadBasket = (): Basket => {
    try {
        const storedBasket = sessionStorage.getItem(STORAGE_KEY);
        if (storedBasket) {
            const parsedBasket = JSON.parse(storedBasket);
            console.log('Loaded basket from storage:', parsedBasket);
            return {
                ...parsedBasket,
                total: calculateTotal(parsedBasket.items)
            };
        }
    } catch (error) {
        console.error('Error loading basket from storage:', error);
    }

    // Return empty basket if nothing in storage or on error
    return { items: [], total: 0 };
};

// Save basket to session storage with error handling
const saveBasket = (basket: Basket): void => {
    try {
        const basketToSave = {
            ...basket,
            total: calculateTotal(basket.items)
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(basketToSave));
        console.log('Saved basket to storage:', basketToSave);
    } catch (error) {
        console.error('Error saving basket to storage:', error);
    }
};

export const useBasket = () => {
    // Initialize state with basket from storage
    const [basket, setBasket] = useState<Basket>(loadBasket);

    // Handle storage changes from other tabs/components
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                try {
                    const newBasket = JSON.parse(event.newValue);
                    console.log('Storage changed, updating basket:', newBasket);
                    setBasket({
                        ...newBasket,
                        total: calculateTotal(newBasket.items)
                    });
                } catch (error) {
                    console.error('Error parsing basket from storage event:', error);
                }
            }
        };

        // Listen for storage events
        window.addEventListener('storage', handleStorageChange);

        // Custom event for same-tab communication
        const handleCustomEvent = (event: CustomEvent) => {
            if (event.detail && typeof event.detail === 'object') {
                console.log('Custom basket event received:', event.detail);
                setBasket(event.detail);
            }
        };

        window.addEventListener('basketUpdate' as any, handleCustomEvent as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('basketUpdate' as any, handleCustomEvent as EventListener);
        };
    }, []);

    // Save basket to storage whenever it changes
    useEffect(() => {
        saveBasket(basket);

        // Dispatch custom event for other components in same tab
        try {
            const event = new CustomEvent('basketUpdate', { detail: basket });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Error dispatching basket update event:', error);
        }
    }, [basket]);

    // Add an item to the basket
    const addItem = useCallback((item: Omit<BasketItem, 'quantity'>) => {
        console.log('Adding item to basket:', item);

        // Ensure price is a number
        const normalizedItem = {
            ...item,
            price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0
        };

        setBasket(prevBasket => {
            const existingItemIndex = prevBasket.items.findIndex(i => i.id === normalizedItem.id);

            if (existingItemIndex >= 0) {
                // Update existing item
                const updatedItems = [...prevBasket.items];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };

                const newBasket = {
                    items: updatedItems,
                    total: calculateTotal(updatedItems)
                };
                console.log('Updated basket (existing item):', newBasket);
                return newBasket;
            } else {
                // Add new item
                const newItems = [...prevBasket.items, { ...normalizedItem, quantity: 1 }];
                const newBasket = {
                    items: newItems,
                    total: calculateTotal(newItems)
                };
                console.log('Updated basket (new item):', newBasket);
                return newBasket;
            }
        });
    }, []);

    // Remove an item from the basket
    const removeItem = useCallback((itemId: number) => {
        console.log('Removing item from basket:', itemId);
        setBasket(prevBasket => {
            const updatedItems = prevBasket.items.filter(item => item.id !== itemId);
            return {
                items: updatedItems,
                total: calculateTotal(updatedItems)
            };
        });
    }, []);

    // Update the quantity of an item
    const updateQuantity = useCallback((itemId: number, quantity: number) => {
        if (quantity < 1) {
            removeItem(itemId);
            return;
        }

        console.log('Updating item quantity:', { itemId, quantity });
        setBasket(prevBasket => {
            const updatedItems = prevBasket.items.map(item =>
                item.id === itemId
                    ? { ...item, quantity }
                    : item
            );
            return {
                items: updatedItems,
                total: calculateTotal(updatedItems)
            };
        });
    }, [removeItem]);

    // Clear the entire basket
    const clearBasket = useCallback(() => {
        console.log('Clearing basket');
        // Directly remove from sessionStorage first
        try {
            sessionStorage.removeItem(STORAGE_KEY);
            console.log('Successfully removed basket from sessionStorage');
        } catch (error) {
            console.error('Error removing basket from sessionStorage:', error);
        }

        // Then update state
        setBasket({ items: [], total: 0 });
    }, []);

    return {
        basket,
        addItem,
        removeItem,
        updateQuantity,
        clearBasket
    };
}; 