'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Child } from '@/types';

export default function CheckoutClient() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const router = useRouter();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', user.id);
        
        if (data && data.length > 0) {
          setChildren(data);
          setSelectedChild(data[0].id);
        }
      }
    };
    fetchChildren();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selectedChild) {
      setError('Please select a child for this order');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: selectedChild,
          mobile_number: mobileNumber,
          delivery_address: address,
          delivery_city: city,
          delivery_state: state,
          delivery_pincode: pincode,
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
          }))
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }

      clearCart();
      router.push(`/orders/${result.data.id}/confirmation`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => router.push('/products')} className="px-6 py-2 bg-[var(--color-fun-yellow)] text-stone-900 btn-pill font-bold">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-8">Checkout 📦</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-fun-purple)] mb-4">👦 Who is this book for?</h2>
              {children.length === 0 ? (
                <div className="text-stone-500 mb-4 text-sm">
                  No child profile found. Please add a child before placing an order.
                  <button type="button" onClick={() => router.push('/children/new')} className="ml-2 text-[var(--color-fun-red)] font-bold">Add Child</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <select 
                    value={selectedChild} 
                    onChange={e => setSelectedChild(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-fun-yellow)]"
                    required
                  >
                    <option value="" disabled>Select Child ▼</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-fun-purple)] mb-4">📞 Contact Details</h2>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-4 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 text-sm">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-fun-yellow)]"
                    placeholder="Enter your 10 digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-fun-purple)] mb-4">🏠 Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Address</label>
                  <textarea 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-fun-yellow)] min-h-24"
                    placeholder="House No, Building, Street Area"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">City</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-fun-yellow)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">State</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-fun-yellow)]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-fun-yellow)]"
                    pattern="[0-9]{6}"
                    placeholder="6 digit pincode"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-[var(--color-fun-red)] rounded-xl font-medium border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || children.length === 0}
              className="w-full py-4 bg-[var(--color-fun-red)] hover:bg-[var(--color-fun-red-hover)] text-white btn-pill font-bold text-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing... ⏳' : 'Place Order 🚀'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-4">
                    <span className="font-semibold text-[var(--color-fun-purple)]">{item.quantity}x</span> {item.product.name}
                  </div>
                  <div className="font-medium text-[var(--color-fun-red)] shrink-0">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-8 space-y-3 bg-stone-50 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                <span>🚚</span> Same Day Dispatch
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                <span>🔒</span> Safe & Secure Payments
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                <span>⭐</span> Best Quality Assured
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
