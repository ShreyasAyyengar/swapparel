import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useMasonry<T>({ gap = 16, setReady }: { gap: number; setReady: React.Dispatch<React.SetStateAction<T>> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingImagesRef = useRef(new Set<HTMLImageElement>());
  const layoutRequestRef = useRef<number | null>(null);

  const COLUMN_MIN = 240;

  const layout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    if (!children.length) return;

    const containerWidth = container.clientWidth;
    const columnCount = Math.max(1, Math.floor((containerWidth + gap) / (COLUMN_MIN + gap)));
    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
    const columnHeights = new Array(columnCount).fill(0);

    // Use transform for better performance
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
    setReady(true);
  }, [gap, setReady]);

  // Debounced layout using requestAnimationFrame
  const scheduleLayout = useCallback(() => {
    if (layoutRequestRef.current !== null) {
      cancelAnimationFrame(layoutRequestRef.current);
    }
    layoutRequestRef.current = requestAnimationFrame(() => {
      layout();
      layoutRequestRef.current = null;
    });
  }, [layout]);

  const handleImageLoad = useCallback(
    (img: HTMLImageElement) => {
      loadingImagesRef.current.delete(img);
      if (loadingImagesRef.current.size === 0) {
        scheduleLayout();
      }
    },
    [scheduleLayout]
  );

  const setupImageListeners = useCallback(
    (container: HTMLElement) => {
      loadingImagesRef.current.clear();

      const images = container.querySelectorAll("img");
      if (!images.length) {
        scheduleLayout();
        return;
      }

      images.forEach((img) => {
        if (!img.complete) {
          loadingImagesRef.current.add(img);
          const handler = () => handleImageLoad(img);
          img.addEventListener("load", handler, { once: true });
          img.addEventListener("error", handler, { once: true });
        }
      });

      if (loadingImagesRef.current.size === 0) {
        scheduleLayout();
      }
    },
    [handleImageLoad, scheduleLayout]
  );

  // Initial layout
  useLayoutEffect(() => {
    if (containerRef.current) {
      setupImageListeners(containerRef.current);
    }
  }, [setupImageListeners]);

  // Resize observer (more efficient than window resize)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(scheduleLayout);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [scheduleLayout]);

  // Mutation observer for dynamic content
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      setupImageListeners(container);
    });

    observer.observe(container, { childList: true, subtree: false });

    return () => observer.disconnect();
  }, [setupImageListeners]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (layoutRequestRef.current !== null) {
        cancelAnimationFrame(layoutRequestRef.current);
      }
    },
    []
  );

  return containerRef;
}
