export default function PostsSectionSkeleton() {
  return (
    <div className="relative mt-10 flex w-3/4 flex-col items-center justify-center gap-5 rounded-md border-2 border-foreground bg-accent p-6">
      {/* Filter Button Placeholder */}
      <div className="absolute top-5 left-10 h-9 w-9 animate-pulse rounded-md bg-muted" />

      {/* Title */}
      <div className="w-full text-center">
        <div className="mx-auto mb-2 h-6 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Masonry Skeleton */}
      <div className="flex w-full items-center justify-center px-10">
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-full animate-pulse rounded-2xl bg-muted" style={{ height: 200 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
