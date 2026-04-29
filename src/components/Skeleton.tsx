export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-cover" />
      <div style={{ padding: 16 }}>
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
        <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: 8 }} />
        <div className="skeleton skeleton-text" style={{ width: '60%', marginTop: 8 }} />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return <div className="skeleton skeleton-text" style={{ width }} />;
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="novel-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
