"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs/server";
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

    // define updateHeight function
    const updateHeight = () => {
      if (imageContainerRef.current) {
        const height = imageContainerRef.current.clientHeight;
        setImageHeight(height);
        if (textContainerRef.current) {
          textContainerRef.current.style.height = `${height - 24}px`;
        }
      }
    };

    // wait for images to load
    const imageContainer = imageContainerRef.current;
    if (imageContainer) {
      const images = imageContainer.querySelectorAll("img");

      if (images.length > 0) {
        let loadedCount = 0;
        const totalImages = images.length;

        const onImageLoad = () => {
          loadedCount++;
          if (loadedCount === totalImages) updateHeight();
        };

        images.forEach((img) => {
          // use cached image
          if (img.complete) onImageLoad();
          else img.addEventListener("load", onImageLoad);
        });

        // Fallback: update after a short delay in case images are already loaded
        // const timeoutId = setTimeout(updateHeight, 0);

        return () => {
          document.body.style.overflow = "";
          // clearTimeout(timeoutId);
          images.forEach((img) => {
            img.removeEventListener("load", onImageLoad);
          });
        };
      }
      // No images, update immediately
      updateHeight();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, []); // Only run once on mount

  return (
    <div className="fixed inset-0 z-2 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onMouseDown={handleClose} />

      {/*TODO: make grid*/}
      <div className="relative z-10 flex w-200 rounded-2xl border border-secondary bg-accent p-10 text-foreground">
        <div className="relative flex shrink-0 items-center justify-center" ref={imageContainerRef}>
          <PostImage imageSRC={post.images} />
        </div>

        <div
          className={"ml-8 flex min-h-100 w-90 flex-col overflow-auto rounded-md border-2 border-secondary bg-accent p-2"}
          ref={textContainerRef}
        >
          {imageHeight > 0 && children}
        </div>
      </div>
    </div>
  );
}
