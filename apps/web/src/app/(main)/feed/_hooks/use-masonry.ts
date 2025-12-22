import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useMasonry({ gap = 16 }: { gap: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingImagesRef = useRef(new Set<HTMLImageElement>());
  const layoutRequestRef = useRef<number | null>(null);

  const COLUMN_MIN = 240;

  const layout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    if (!children.length) {
      container.style.height = "0px";
      return;
    }

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
        scheduleLayout(); // schedule layout

        // Fade in new children after layout
        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) return;
          Array.from(container.children).forEach((child) => {
            (child as HTMLElement).style.opacity = "1";
          });
        });
      }
    },
    [scheduleLayout]
  );

  const setupImageListeners = useCallback(
    (root: HTMLElement) => {
      const img = root.querySelector("img");
      if (!img) return;

      if (!(loadingImagesRef.current.has(img) || img.complete)) {
        loadingImagesRef.current.add(img);

        const handler = () => handleImageLoad(img);
        img.addEventListener("load", handler, { once: true });
        img.addEventListener("error", handler, { once: true });
        return;
      }

      // Image already loaded and no other images pending
      if (loadingImagesRef.current.size === 0) {
        scheduleLayout();
      }
    },
    [handleImageLoad, scheduleLayout]
  );

  useLayoutEffect(() => {
    if (containerRef.current) {
      setupImageListeners(containerRef.current);
    }
  }, [setupImageListeners]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(scheduleLayout);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [scheduleLayout]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          node.style.opacity = "0";
          node.style.transition = "opacity 0.3s ease";
          setupImageListeners(node);
        });
        mutation.removedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          node.querySelectorAll?.("img").forEach((img) => {
            loadingImagesRef.current.delete(img);
          });
        });
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: false,
    });

    return () => observer.disconnect();
  }, [setupImageListeners]);

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
