"use client";

import useMasonry from "../../_hooks/state/use-masonry";

export default function MasonryLayout({ children }: { children: React.ReactNode }) {
  const masonryRef = useMasonry();
  return (
    <div ref={masonryRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 [&>*:first-child]:mt-0">
      {children}
    </div>
  );
}
