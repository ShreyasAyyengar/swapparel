import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function useMasonry({ gap = 16 }: { gap: number }) {
  // TODO<Alex>: store latest children's position in a column and then place every new children under old children. Once that specific child is placed, fade in the new child. This prevents group fade ins and prolonged opacity-0's
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingImagesRef = useRef(new Map<HTMLImageElement, () => void>());
  const layoutRequestRef = useRef<number | null>(null);
  const newChildrenRef = useRef<Set<HTMLElement>>(new Set());
  const [loadedImages, setLoadedImages] = useState(0);

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
      setLoadedImages((prev) => {
        const newCount = prev + 1;

        // When we hit 20 loaded images, show the first 20 children
        if (newCount >= 20) {
          scheduleLayout();

          requestAnimationFrame(() => {
            const container = containerRef.current;
            if (!container) return;

            // Convert Set to Array and get first 20
            const newChildrenArray = Array.from(newChildrenRef.current);
            const first20 = newChildrenArray.slice(0, 20);

            // Update opacity for first 20 children
            first20.forEach((child) => {
              child.classList.remove("opacity-0");
              child.classList.add("opacity-100");
            });

            // Remove the first 20 from the Set
            first20.forEach((child) => {
              newChildrenRef.current.delete(child);
            });
          });
        }

        return newCount;
      });

      // When ALL images are loaded, show any remaining children
      if (loadingImagesRef.current.size === 0) {
        scheduleLayout();

        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) return;

          // Only update opacity for remaining new children
          newChildrenRef.current.forEach((child) => {
            child.classList.remove("opacity-0");
            child.classList.add("opacity-100");
          });

          // Clear the set after updating
          newChildrenRef.current.clear();
        });
      }
    },
    [scheduleLayout]
  );

  const setupImageListeners = useCallback(
    (root: HTMLElement) => {
      const img = root.querySelector("img");
      if (!img) return;

      // If image is already complete AND we haven't set up a listener, just return early
      if (img.complete && !loadingImagesRef.current.has(img)) {
        root.classList.remove("opacity-0");
        root.classList.add("opacity-100");
        return; // Don't do anything - layout will be triggered by the last image
      }

      if (!loadingImagesRef.current.has(img)) {
        const handler = () => {
          loadingImagesRef.current.delete(img);
          handleImageLoad(img);
        };

        loadingImagesRef.current.set(img, handler);
        img.addEventListener("load", handler, { once: true });
        img.addEventListener("error", handler, { once: true });
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

    // 🔥 Force layout when returning to route
    requestAnimationFrame(() => {
      setupImageListeners(container);
      scheduleLayout();
    });
  }, [scheduleLayout, setupImageListeners]);

  useEffect(() => {
    const handleResize = () => {
      //NOTE: this may lead to optimization issues
      scheduleLayout();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [scheduleLayout]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      let changedChildren = false;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          changedChildren = true;
          // node.classList.remove("opacity-100");
          node.classList.add("transition-opacity", "duration-500", "ease-in", "opacity-0");
          newChildrenRef.current.add(node);
          setupImageListeners(node);
        });
        mutation.removedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          changedChildren = true;

          node.querySelectorAll?.("img").forEach((img) => {
            const handler = loadingImagesRef.current.get(img);
            if (handler) {
              img.removeEventListener("load", handler);
              img.removeEventListener("error", handler);
              loadingImagesRef.current.delete(img);
            }
          });
        });
      }
      if (changedChildren) {
        if (container.children.length === 0) {
          container.style.height = "0px";
        } else {
          scheduleLayout();
        }
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
