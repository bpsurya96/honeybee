'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-display font-black text-stone-900 mb-4">Your Cart</h1>
        <div className="bg-white rounded-3xl p-12 border border-stone-100 shadow-sm">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Your cart is empty</h2>
          <p className="text-stone-500 mb-6">Looks like you haven't added any learning kits yet.</p>
          <Link href="/products" className="inline-block px-6 py-3 bg-[var(--color-fun-red)] hover:bg-[var(--color-fun-red-hover)] text-white btn-pill font-semibold transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-8">Your Cart ({totalItems})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-4">
              <div className="w-24 h-24 bg-stone-50 rounded-xl overflow-hidden shrink-0">
                <img 
                  src={item.product.image_url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Product'} 
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 truncate">{item.product.name}</h3>
                <p className="text-stone-500 text-sm truncate">{item.product.description}</p>
                <div className="font-bold text-amber-600 mt-1">₹{item.product.price.toFixed(2)}</div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-stone-200">
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 hover:bg-stone-200 rounded text-stone-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 hover:bg-stone-200 rounded text-stone-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-red-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-stone-900">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-stone-900">Calculated at checkout</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-lg text-stone-900">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Link 
              href="/checkout"
              className="block w-full py-3 bg-[var(--color-fun-red)] hover:bg-[var(--color-fun-red-hover)] text-white text-center btn-pill font-bold transition-colors shadow-sm"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
