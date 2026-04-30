export function CardSkeleton() {
  return (
    <div className="cover-frame rounded-xl bg-white/5 ring-1 ring-white/5">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-transparent" />
    </div>
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LineSkeleton({ width = "100%" }: { width?: string }) {
  return <div className="h-4 w-full max-w-full animate-pulse rounded bg-white/5" style={{ width }} />;
}
