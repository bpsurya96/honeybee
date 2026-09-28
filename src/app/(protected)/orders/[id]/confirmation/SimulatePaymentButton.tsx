'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimulatePaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dev/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      if (res.ok) {
        alert('Payment simulated successfully! Products have been assigned.');
        router.refresh();
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (err) {
      alert('Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSimulate} 
      disabled={loading}
      className="mt-4 px-6 py-2 bg-[var(--color-fun-purple)] hover:bg-[var(--color-fun-blue)] text-white rounded-xl font-bold transition-colors w-full"
    >
      {loading ? 'Processing...' : 'Simulate Payment (Dev Only)'}
    </button>
  );
}
