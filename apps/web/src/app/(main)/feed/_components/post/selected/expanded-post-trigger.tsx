"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import type z from "zod";
import { authClient } from "../../../../../../lib/auth-client";
import TradingBox from "../trading/trade";
import DeletePostButton from "./delete-post-button";

export default function ExpandedPostTrigger({ post, children }: { post: z.infer<typeof internalPostSchema>; children: React.ReactNode }) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [isHovered, setHovered] = useState<boolean>(false);
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [canSeeButton, setCanSeeButton] = useState(false);
  const [seeDelete, setSeeDelete] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  // TODO<Alex>: copy instagram delete post
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (data?.user.email !== post.createdBy) setCanSeeButton(true);
  }, [data, isPending, post.createdBy]);

  const handleClose = async () => {
    await setSelectedPost(null);
    document.body.style.overflow = "";
  };

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const updateHeight = () => {
      if (imageContainerRef.current) {
        const height = imageContainerRef.current.clientHeight;
        if (textContainerRef.current) {
          textContainerRef.current.style.height = `${height}px`;
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateHeight);

    if (imageContainerRef.current) {
      resizeObserver.observe(imageContainerRef.current);
    }

    return () => {
      document.body.style.overflow = "";
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setImgLoaded(false);
  }, [currentImage]);

  const handleEllipsisClick = () => {
    setSeeDelete((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-2 flex items-center justify-center">
      {isTrading && <TradingBox post={post} onClick={() => setIsTrading(false)} />}
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onMouseDown={handleClose} />
      <div className="relative max-h-[83vh] w-1/2 items-center overflow-y-auto rounded-2xl border border-secondary bg-accent p-10 pt-5 text-foreground">
        {!canSeeButton && <Ellipsis className={"absolute top-5 right-5 cursor-pointer"} onClick={handleEllipsisClick} />}
        {seeDelete && <DeletePostButton onClick={handleEllipsisClick} postId={post._id} />}
        <p className="mx-5 mt-0 mb-3 text-center font-bold text-2xl">{post.title}</p>

        <div className={"mb-3 w-full border-secondary border-t"} />
        <div className={"grid grid-cols-1 items-center gap-5 xl:grid-cols-2"}>
          <div className={"relative"} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div
              className="flex max-h-[calc(80vh-80px)] items-center justify-center overflow-y-auto rounded-md border-2 border-secondary"
              ref={imageContainerRef}
            >
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-full animate-pulse bg-muted" />
                  <p className={"absolute"}>Loading...</p>
                </div>
              )}

              <Image
                src={post.images[currentImage] ?? ""}
                width={1200}
                height={1200}
                alt="expanded-image"
                className={`h-full w-full object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoadingComplete={() => setImgLoaded(true)}
                unoptimized
              />
            </div>

            <p className={"absolute bottom-3 left-4 rounded-md bg-black/30 px-2 backdrop-blur-lg"}>
              {currentImage + 1} / {post.images.length}
            </p>
            {isHovered && currentImage < post.images.length - 1 && (
              <ChevronRight
                className="absolute top-1/2 right-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-lg"
                size={12}
                onClick={() => setCurrentImage((prev) => prev + 1)}
              />
            )}
            {isHovered && currentImage > 0 && (
              <ChevronLeft
                className="absolute top-1/2 left-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-lg"
                size={12}
                onClick={() => setCurrentImage((prev) => prev - 1)}
              />
            )}
          </div>

          <div
            className="relative flex max-h-[calc(80vh-80px)] min-h-150 flex-col overflow-auto rounded-md border-2 border-secondary bg-accent p-2"
            ref={textContainerRef}
          >
            {children}
          </div>
        </div>

        <br />
        {canSeeButton && (
          <div className={"flex items-center"}>
            <Button
              className={"w-full bg-foreground text-background hover:cursor-pointer hover:bg-foreground-500"}
              onClick={() => setIsTrading(true)}
              disabled={isTrading}
            >
              {isTrading ? "Trading..." : "Trade"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
