import type React from "react";
import { useMasonry } from "../../_hooks/use-masonry";

type MasonryLayoutProps = {
  children: React.ReactNode;
  gap?: number;
};

export default function MasonryLayout({ children, gap = 20 }: MasonryLayoutProps) {
  const masonryRef = useMasonry({ gap });

  return (
    <div ref={masonryRef} className="mt-6 w-full">
      {children}
    </div>
  );
}
