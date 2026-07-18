import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function useMasonry({ gap = 16 }: { gap: number }) {
  // TODO<Alex>: store latest children's position in a column and incrementally place only new children, skipping already-positioned children entirely. This prevents O(n) re-layout on every image load as the feed grows long.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingImagesRef = useRef(new Map<HTMLImageElement, () => void>());
  const predictedHeightsRef = useRef(new Map<HTMLImageElement, number>());
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

      let itemHeight = child.offsetHeight;
      const img = child.querySelector("img");
      if (img && loadingImagesRef.current.has(img)) {
        const attrW = img.getAttribute("width");
        const attrH = img.getAttribute("height");
        if (attrW && attrH) {
          const w = Number.parseInt(attrW, 10);
          const h = Number.parseInt(attrH, 10);
          if (w > 0 && h > 0) {
            const imgWidth = img.getBoundingClientRect().width || columnWidth;
            const expectedImgHeight = imgWidth * (h / w);
            predictedHeightsRef.current.set(img, expectedImgHeight);
            itemHeight = itemHeight - img.offsetHeight + expectedImgHeight;
          }
        }
      }

      columnHeights[shortestColumnIndex] += itemHeight + gap;
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
      }
      const predicted = predictedHeightsRef.current.get(img);
      if (predicted !== undefined) {
        predictedHeightsRef.current.delete(img);
        // const actual = img.getBoundingClientRect().height;
        // if (Math.abs(Math.round(actual) - Math.round(predicted)) > 2) {
        //   scheduleLayout();
        // }
      } else {
        scheduleLayout();
      }

      const container = containerRef.current;
      if (container) {
        for (const child of container.children) {
          if ((child as HTMLElement).contains(img) && newChildrenRef.current.has(child as HTMLElement)) {
            requestAnimationFrame(() => {
              (child as HTMLElement).classList.remove("opacity-0");
              (child as HTMLElement).classList.add("opacity-100");
              newChildrenRef.current.delete(child as HTMLElement);
            });
            break;
          }
        }
      }

      setLoadedImages((prev) => prev + 1);
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
            predictedHeightsRef.current.delete(img);
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
