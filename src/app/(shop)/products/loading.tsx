
export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-64 shrink-0 animate-pulse">
        <div className="bg-stone-100 h-[600px] rounded-3xl" />
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 w-full animate-pulse">
        <div className="h-12 w-48 bg-stone-100 rounded-xl mb-4" />
        <div className="h-6 w-96 bg-stone-100 rounded-xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-stone-100 rounded-3xl h-[420px]" />
          ))}
        </div>
      </div>
    </div>
  )
}
