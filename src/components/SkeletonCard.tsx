// Скелетон загрузки с shimmer-эффектом
export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass relative overflow-hidden p-4">
      <div className="space-y-3">
        <div className="h-5 w-1/3 rounded-md bg-white/10" />
        {Array.from({ length: Math.max(lines - 1, 1) }).map((_, i) => (
          <div key={i} className="h-3 rounded-md bg-white/10" style={{ width: `${90 - i * 20}%` }} />
        ))}
      </div>
      <div className="absolute inset-0 animate-shimmer bg-shimmer-gradient" />
    </div>
  );
}
