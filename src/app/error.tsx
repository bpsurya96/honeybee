'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-stone-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-stone-100">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-black text-stone-900">Something went wrong!</h2>
          <p className="text-stone-500 text-sm">
            We apologize for the inconvenience. Our team has been notified.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:shadow-amber-500/40 transition-all active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
