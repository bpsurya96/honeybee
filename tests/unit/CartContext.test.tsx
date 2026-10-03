import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { CartProvider, useCart } from '@/context/CartContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockProduct = {
  id: 'prod-1',
  name: 'Test Product',
  price: 1000,
  slug: 'test-product',
  description: 'Test',
  active: true,
};

const TestComponent = () => {
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-price">{totalPrice}</div>
      <button onClick={() => addToCart(mockProduct as any, 1)} data-testid="add-btn">Add</button>
      <button onClick={() => updateQuantity('prod-1', 5)} data-testid="update-btn">Update</button>
      <button onClick={() => removeFromCart('prod-1')} data-testid="remove-btn">Remove</button>
      <button onClick={() => clearCart()} data-testid="clear-btn">Clear</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should manage cart state correctly', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('total-price').textContent).toBe('0');

    act(() => { screen.getByTestId('add-btn').click(); });
    expect(screen.getByTestId('total-items').textContent).toBe('1');
    expect(screen.getByTestId('total-price').textContent).toBe('1000');

    act(() => { screen.getByTestId('update-btn').click(); });
    expect(screen.getByTestId('total-items').textContent).toBe('5');
    expect(screen.getByTestId('total-price').textContent).toBe('5000');

    act(() => { screen.getByTestId('remove-btn').click(); });
    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('total-price').textContent).toBe('0');
  });

  it('should persist to localStorage', async () => {
    render(<CartProvider><TestComponent /></CartProvider>);
    act(() => { screen.getByTestId('add-btn').click(); });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('honeybee_cart', expect.stringContaining('prod-1'));
  });
});
