'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('honeybee_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Sanitize the cart items to prevent crashes from malformed local storage
          const validItems = parsed.filter(item => 
            item && 
            item.product && 
            typeof item.product.price === 'number'
          );
          setItems(validItems);
        }
      } catch (e) {
        console.error('Failed to parse cart', e);
        localStorage.removeItem('honeybee_cart'); // Clear corrupted storage
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('honeybee_cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(current => {
      const existing = current.find(item => item.product?.id === product.id && !item.is_gift && !item.is_gift);
      if (existing) {
        return current.map(item =>
          item.product?.id === product.id && !item.is_gift
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { product, quantity, is_gift: false }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(current => current.filter(item => item.product?.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(current =>
      current.map(item =>
        item.product?.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  // Use optional chaining just in case
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 0)), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
