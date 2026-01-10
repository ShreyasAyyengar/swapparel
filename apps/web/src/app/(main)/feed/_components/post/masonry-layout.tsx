import type React from "react";
import {useMasonry} from "../../_hooks/use-masonry";

type MasonryLayoutProps = {
  children: React.ReactNode;
  gap?: number;
};

export default function MasonryLayout({ children, gap = 20 }: MasonryLayoutProps) {
  // const [ready, setReady] = useState(true);
  const masonryRef = useMasonry({ gap });

  return (
    <div ref={masonryRef} className={"w-full"}>
      {children}
    </div>
  );
}
