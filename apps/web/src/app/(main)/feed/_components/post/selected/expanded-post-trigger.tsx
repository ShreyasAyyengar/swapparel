"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs/server";
import { useEffect, useState } from "react";
import type z from "zod";

export default function ExpandedPostTrigger({ post, children }: { post: z.infer<typeof internalPostSchema>; children: React.ReactNode }) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [isHovered, setHovered] = useState<boolean>(false);

  const handleClose = async () => {
    await setSelectedPost(null);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
  });

  return (
    <div className="fixed inset-0 z-2 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onMouseDown={handleClose} />
      <div className="z-10 grid max-h-[83vh] w-1/2 grid-cols-1 items-center gap-5 overflow-y-auto rounded-2xl border border-secondary bg-accent p-10 text-foreground xl:grid-cols-2">
        <div className={"relative border border-lime-500"} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <div className="flex max-h-[calc(83vh-80px)] items-center justify-center overflow-y-auto rounded-md border-2 border-secondary">
            <Image
              src={post.images[currentImage] ?? ""}
              width={1200}
              height={1200}
              alt={"expanded-image"}
              className="flex w-full items-center justify-center"
            />
          </div>
          {isHovered && (
            <ChevronRight
              className="absolute top-1/2 right-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
              size={12}
            />
          )}
          {isHovered && (
            <ChevronLeft
              className="absolute top-1/2 left-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
              size={12}
            />
          )}
        </div>

        <div className="flex h-full max-h-[calc(83vh-80px)] w-full flex-col overflow-auto rounded-md border-2 border-secondary bg-accent p-2">
          {children}
        </div>
      </div>
    </div>
  );
}
