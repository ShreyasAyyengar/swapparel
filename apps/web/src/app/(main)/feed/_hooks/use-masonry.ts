import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
export function useMasonry({ gap = 16, setReady }: { gap: number; setReady: React.Dispatch<React.SetStateAction<T>> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  }, [gap]);

  useLayoutEffect(() => {
    layout();
  }, [layout]);

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll("img");
    if (!images.length) {
      layout(); // no images, safe to layout
      return;
    }

    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        layout(); // all images loaded, now layout
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        // already loaded
        loadedCount++;
      } else {
        img.addEventListener("load", onImageLoad);
        img.addEventListener("error", onImageLoad); // count errors too
      }
    });

    // If all images were already loaded
    if (loadedCount === images.length) layout();

    return () => {
      // cleanup listeners
      images.forEach((img) => {
        img.removeEventListener("load", onImageLoad);
        img.removeEventListener("error", onImageLoad);
      });
    };
  }, [layout]);

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

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver(() => {
      const container = containerRef.current;
      if (!container) return;

      const children = Array.from(container.children) as HTMLElement[];
      if (!children.length) return;

      const images = container.querySelectorAll("img");
      if (!images.length) {
        layout(); // no images, safe to layout
        return;
      }

      let loadedCount = 0;

      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          // console.log("Children Mutated");
          layout(); // all images loaded, now layout
        }
      };

      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.addEventListener("load", onImageLoad);
          img.addEventListener("error", onImageLoad); // count errors too
        }
      });

      // if all images were already loaded
      if (loadedCount === images.length) {
        console.log("Children Mutated");

        layout();
      }

      // cleanup listeners after layout
      return () => {
        images.forEach((img) => {
          img.removeEventListener("load", onImageLoad);
          img.removeEventListener("error", onImageLoad);
        });
      };
    });

    observer.observe(containerRef.current, { childList: true });

    return () => observer.disconnect();
  }, [layout]);

  return containerRef;
}
