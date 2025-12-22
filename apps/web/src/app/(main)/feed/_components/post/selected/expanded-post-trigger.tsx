"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import type z from "zod";
import PostImage from "./post-image";

export default function ExpandedPostTrigger({ post, children }: { post: z.infer<typeof internalPostSchema>; children: React.ReactNode }) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString);

  const handleClose = async () => {
    await setSelectedPost(null);
  };

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [imageHeight, setImageHeight] = useState<number>(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const updateHeight = () => {
      if (imageContainerRef.current) {
        const height = imageContainerRef.current.clientHeight;
        setImageHeight(height);
        if (textContainerRef.current) {
          textContainerRef.current.style.height = `${height - 24}px`;
        }
      }
    };

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(updateHeight);

    if (imageContainerRef.current) {
      resizeObserver.observe(imageContainerRef.current);
    }

    return () => {
      document.body.style.overflow = "";
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-2 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onMouseDown={handleClose} />

      {/*TODO: make grid*/}
      {/*TODO: if image goes outside webpage bounds, scroll*/}
      <div className="relative z-10 flex w-200 rounded-2xl border border-secondary bg-accent p-10 text-foreground">
        <div className="relative flex shrink-0 items-center justify-center" ref={imageContainerRef}>
          <PostImage imageSRC={post.images} />
        </div>

        <div
          className={"ml-8 flex h-full min-h-100 w-90 flex-col overflow-auto rounded-md border-2 border-secondary bg-accent p-2"}
          ref={textContainerRef}
        >
          {imageHeight > 0 && children}
        </div>
      </div>
    </div>
  );
}
