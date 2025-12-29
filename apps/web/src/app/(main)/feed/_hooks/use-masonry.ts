import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

// TODO fading was not working ??????
// TODO: fix fading between prerendered filtered posts
export function useMasonry({ gap = 16 }: { gap: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingImagesRef = useRef(new Map<HTMLImageElement, () => void>());
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
        scheduleLayout();

        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) return;
          Array.from(container.children).forEach((child) => {
            (child as HTMLElement).classList.remove("opacity-0");
            (child as HTMLElement).classList.add("opacity-100");
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
      // console.log("mutation observer fired");
      let changedChildren = false;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          changedChildren = true;
          // node.classList.remove("opacity-100");
          node.classList.add("transition-opacity", "duration-500", "ease-in", "opacity-0");
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
