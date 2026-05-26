"use client";

import type { postSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type z from "zod";
import { authClient } from "../../../../../../lib/auth-client";
import TradingBox from "../trading/trade";
import CommentInput from "./comment-input";
import Comments from "./comments";
import DeletePostButton from "./delete-post-button";

export default function ExpandedPostTrigger({ post, children }: { post: z.infer<typeof postSchema>; children: React.ReactNode }) {
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

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      resizeObserver.disconnect();
    };
  }, []);

  const handleEllipsisClick = () => {
    setSeeDelete((prev) => !prev);
  };

  return (
    <div className="relative text-foreground">
      {isTrading && <TradingBox post={post} onClick={() => setIsTrading(false)} />}
      {!canSeeButton && <Ellipsis className="absolute top-0 right-0 cursor-pointer" onClick={handleEllipsisClick} />}
      {seeDelete && <DeletePostButton onClick={handleEllipsisClick} postId={post._id} />}

      <div className="grid grid-cols-1 items-center gap-5 xl:grid-cols-2">
        <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <div
            className="flex max-h-[calc(80vh-120px)] items-center justify-center overflow-y-auto rounded-md border-2 border-secondary"
            ref={imageContainerRef}
          >
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-full animate-pulse bg-muted" />
                <p className="absolute">Loading...</p>
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

          <p className="absolute bottom-3 left-4 rounded-md bg-black/30 px-2 backdrop-blur-lg">
            {currentImage + 1} / {post.images.length}
          </p>
          {isHovered && currentImage < post.images.length - 1 && (
            <ChevronRight
              className="absolute top-1/2 right-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-lg"
              size={12}
              onClick={() => {
                setImgLoaded(false);
                setCurrentImage((prev) => prev + 1);
              }}
            />
          )}
          {isHovered && currentImage > 0 && (
            <ChevronLeft
              className="absolute top-1/2 left-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-lg"
              size={12}
              onClick={() => {
                setImgLoaded(false);
                setCurrentImage((prev) => prev - 1);
              }}
            />
          )}
        </div>

        <div
          className="relative flex max-h-[calc(80vh-120px)] min-h-150 flex-col overflow-auto rounded-md border-2 border-secondary bg-accent p-2"
          ref={textContainerRef}
        >
          <p title="username" className="cursor-pointer font-bold hover:underline" onClick={onProfileClick} onKeyDown={onProfileClick}>
            {post.createdBy}
          </p>
          <hr className="my-2 border-foreground border-t-2" />

          <p className="font-bold">Description:</p>
          <p className="wrap-break-word max-w-[45ch]">
            {`${post.description.slice(0, MAX_DESCRIPTION)}${post.description.length > MAX_DESCRIPTION ? "..." : ""}`}
          </p>
          <hr className="my-2 border-foreground border-t-2" />

          {post.price && (
            <p>
              Price: <span className="mr-1 rounded-md bg-foreground px-1 font-bold text-background">{post.price}</span>
            </p>
          )}

          <p>
            Garment Type: <span className="mr-1 rounded-md bg-foreground px-1 font-bold text-background">{post.garmentType}</span>
          </p>
          <p>
            Color:{" "}
            {post.colour.map((color) => (
              <span className="mr-1 rounded-md bg-foreground px-1 font-bold text-background" key={color}>
                {color}
              </span>
            ))}
          </p>
          <p>
            Size: <span className="rounded-md bg-foreground px-1 font-bold text-background">{post.size}</span>
          </p>
          <p>
            Material:{" "}
            {post.material.map((mats) => (
              <span className="mr-1 rounded-md bg-foreground px-1 font-bold text-background" key={mats}>
                {mats}
              </span>
            ))}
          </p>
          <p>
            {/*Hashtags: <span className="font-normal">{post.hashtags.join(", ")}</span>*/}
            Hashtags:{" "}
            {post.hashtags.map((hashtag) => (
              <span className="mr-1 rounded-md bg-foreground px-1 font-bold text-background" key={hashtag}>
                {hashtag}
              </span>
            ))}
          </p>
          <hr className="my-2 border-foreground border-t-2" />
          <p className="font-bold">Comments:</p>
          {post.comments.length > 0 && <CommentInput sentence="Add a new comment!" post={post} />}
          {post.comments.length < 1 ? <CommentInput sentence="Be the first to comment!" post={post} /> : <Comments post={post} />}
        </div>
      </div>
      {canSeeButton && (
        <div className="mt-4 flex items-center">
          <Button
            className="w-full bg-foreground text-background hover:cursor-pointer hover:bg-foreground-500"
            onClick={() => setIsTrading(true)}
            disabled={isTrading}
          >
            {isTrading ? "Trading..." : "Trade"}
          </Button>
        </div>
      )}
    </div>
  );
}
