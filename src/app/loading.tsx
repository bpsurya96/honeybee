export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 border-4 border-amber-200 rounded-full animate-ping opacity-20"></div>
        {/* Inner spinning ring */}
        <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        {/* Center element */}
        <div className="absolute inset-3 bg-amber-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-8 text-amber-600 font-display font-bold animate-pulse tracking-widest uppercase text-sm">
        Loading...
      </p>
    </div>
  );
}
