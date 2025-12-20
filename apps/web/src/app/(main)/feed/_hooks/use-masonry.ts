import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

type UseMasonryOptions = {
  gap?: number;
};

export function useMasonry({ gap = 16 }: UseMasonryOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const COLUMN_MIN = 240;

  const layout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    if (!children.length) return;

    console.log(`Running masonry layout for ${children.length} posts`);

    const containerWidth = container.clientWidth;
    const columnCount = Math.max(1, Math.floor((containerWidth + gap) / (COLUMN_MIN + gap)));

    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;

    const columnHeights = new Array(columnCount).fill(0);

    children.forEach((child) => {
      child.style.position = "absolute";
      child.style.width = `${columnWidth}px`;

      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

      const x = shortestColumnIndex * (columnWidth + gap);
      const y = columnHeights[shortestColumnIndex];

      child.style.transform = `translate(${x}px, ${y}px)`;

      columnHeights[shortestColumnIndex] += child.offsetHeight + gap;
    });

    container.style.height = `${Math.max(...columnHeights)}px`;
  }, [gap]);

  useLayoutEffect(() => {
    layout();
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(containerRef.current);

    window.addEventListener("resize", layout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", layout);
    };
  }, [layout]);

  return containerRef;
}
