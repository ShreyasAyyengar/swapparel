import type React from "react";
import { useState } from "react";
import { useMasonry } from "../../_hooks/use-masonry";

type MasonryLayoutProps = {
  children: React.ReactNode;
  gap?: number;
};

export default function MasonryLayout({ children, gap = 20 }: MasonryLayoutProps) {
  const [ready, setReady] = useState(false);
  const masonryRef = useMasonry({ gap, setReady });

  return (
    <div ref={masonryRef} className={`w-full ${ready ? "opacity-100" : "opacity-0"}`}>
      {children}
    </div>
  );
}
