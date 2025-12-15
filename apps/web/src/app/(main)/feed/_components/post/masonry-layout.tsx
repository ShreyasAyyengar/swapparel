"use client";

import useMasonry from "../../_hooks/state/use-masonry";

export default function MasonryLayout({ children, postCount }: { children: React.ReactNode; postCount: number }) {
  const masonryRef = useMasonry(postCount);
  return (
    <div ref={masonryRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  );
}
