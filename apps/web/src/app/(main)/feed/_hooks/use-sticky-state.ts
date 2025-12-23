import { useEffect, useRef, useState } from "react";

export const useStickyTrue = (value: boolean, delayMs = 150) => {
  const [sticky, setSticky] = useState(value);
  const t = useRef<number | null>(null);

  useEffect(() => {
    if (value) {
      if (t.current) window.clearTimeout(t.current);
      setSticky(true);
      return;
    }

    t.current = window.setTimeout(() => setSticky(false), delayMs);

    return () => {
      if (t.current) window.clearTimeout(t.current);
    };
  }, [value, delayMs]);

  return sticky;
};
