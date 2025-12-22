"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs/server";
import { useEffect, useRef, useState } from "react";
import type z from "zod";

export default function ExpandedPostTrigger({ post, children }: { post: z.infer<typeof internalPostSchema>; children: React.ReactNode }) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString);
  const [currentImageCount, setCurrentImageCount] = useState<number>(0);
  const [isHovered, setHovered] = useState<boolean>(false);

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
          textContainerRef.current.style.height = `${height}px`;
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
      <div className="relative z-10 flex max-h-[83vh] w-200 rounded-2xl border border-secondary bg-accent p-10 text-foreground">
        <div className="flex min-h-0 items-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <div className="relative flex max-h-full shrink-0 items-center justify-center overflow-y-auto rounded-md" ref={imageContainerRef}>
            <Image
              src={post.images[currentImageCount] ?? ""}
              alt="gallery"
              width={350}
              height={200}
              className="rounded-md border-2 border-[#6F4D3880]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0">
            {currentImageCount > 0 && isHovered && (
              <ChevronLeft
                className="-translate-y-1/2 pointer-events-auto absolute top-1/2 left-13 z-10 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
                onClick={() => setCurrentImageCount((prev) => prev - 1)}
              />
            )}

            {currentImageCount < post.images.length - 1 && isHovered && (
              <ChevronRight
                className="-translate-y-1/2 pointer-events-auto absolute top-1/2 right-105 z-10 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
                onClick={() => setCurrentImageCount((prev) => prev + 1)}
              />
            )}
          </div>
        </div>

        <div className="ml-8 flex min-h-0 w-90 flex-col overflow-auto rounded-md border-2 border-secondary bg-accent p-2" ref={textContainerRef}>
          {imageHeight > 0 && children}
        </div>
      </div>
    </div>
  );
}
