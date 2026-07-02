"use client";

import type { postSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@swapparel/shad-ui/components/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@swapparel/shad-ui/components/dialog";
import { cn } from "@swapparel/shad-ui/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import type z from "zod";
import { authClient } from "../../../../../lib/auth-client";
import sendToProfilePage from "../../../profile/_components/helper-functions";
import CommentBox from "./comments/comment-box";
import TradeDialog from "./trade-dialog";

type PostDialogProps = {
  postData: z.infer<typeof postSchema>;
  className?: string;
};

export default function PostDialog({ postData, className }: PostDialogProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postId, setPostId] = useQueryState("id", parseAsString);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [loadedImages, setLoadedImages] = useState(() => new Set<number>());
  const [canSeeButton, setCanSeeButton] = useState(false);
  const { data, isPending } = authClient.useSession();
  const MAX_DESCRIPTION = 1000;

  useEffect(() => {
    if (isPending) return;
    if (data?.user.email !== postData.createdBy) setCanSeeButton(true);
  }, [data, isPending, postData.createdBy]);

  useEffect(() => {
    if (!carouselApi) return;

    const updateIndex = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap() + 1);
    };

    updateIndex();
    carouselApi.on("select", updateIndex);
    carouselApi.on("reInit", updateIndex);

    return () => {
      carouselApi.off("select", updateIndex);
      carouselApi.off("reInit", updateIndex);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (postId === postData._id) {
      setDialogOpen(true);
    }
  }, [postId, postData._id]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (open) {
          setPostId(postData._id);
        } else {
          setPostId(null);
        }
      }}
    >
      <DialogTrigger className={cn("rounded-sm bg-card p-5 text-card-foreground", className)}>
        <p className="font-bold">{postData.title}</p>
        <span title={postData.createdBy} className="w-full truncate">
          {postData.createdBy}
        </span>
        <Image
          src={postData.images[0] ?? ""}
          width={200}
          height={200}
          alt="thumbnail"
          className="w-full rounded-md border-2 border-border"
          loading="eager"
          priority={false}
        />
        <div className="w-full pt-2">
          <p title={postData.size} className="w-full truncate text-left">
            Size: <Badge className="bg-secondary font-bold text-secondary-foreground">{postData.size}</Badge>
          </p>
          <p title={postData.garmentType} className="w-full truncate text-left">
            Garment Type: <Badge className="bg-secondary font-bold text-secondary-foreground">{postData.garmentType}</Badge>
          </p>
          <p title={postData.colour.join(", ")} className="w-full truncate text-left">
            {/*Colors: {postData.colour.join(", ")}*/}
            Color:{" "}
            {postData.colour.map((color) => (
              <Badge className="mr-1 bg-secondary font-bold text-secondary-foreground" key={color}>
                {color}
              </Badge>
            ))}
          </p>
          <p title={postData.material.join(", ")} className="w-full truncate text-left">
            {/*Materials: {postData.material}*/}
            Material:{" "}
            {postData.material.map((mats) => (
              <Badge className="mr-1 bg-secondary font-bold text-secondary-foreground" key={mats}>
                {mats}
              </Badge>
            ))}
          </p>
          {postData.price && (
            <p className="w-full truncate text-left">
              Price: <Badge className="bg-secondary font-bold text-secondary-foreground">{postData.price}</Badge>
            </p>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {postData.title} <span className="font-normal text-sm">- {postData.createdBy}</span>
          </DialogTitle>
          {/* <DialogDescription>{postData.createdBy}</DialogDescription> */}
        </DialogHeader>
        <div className="relative text-foreground">
          <div className="mb-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
            <div>
              <Carousel className="group relative" setApi={setCarouselApi}>
                <CarouselContent>
                  {postData.images.map((image, index) => {
                    const postURL = image ?? "";
                    const isLoaded = loadedImages.has(index);

                    return (
                      <CarouselItem key={`${postURL}-${index}`} className="basis-full">
                        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border">
                          {!isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-full w-full animate-pulse bg-muted" />
                              <p className="absolute">Loading...</p>
                            </div>
                          )}
                          <Image
                            src={postURL}
                            alt={postData.title}
                            fill
                            className={`h-full w-full object-contain transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                            onLoadingComplete={() => {
                              setLoadedImages((prev) => {
                                const next = new Set(prev);
                                next.add(index);
                                return next;
                              });
                            }}
                            unoptimized
                          />
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="left-2 cursor-pointer opacity-0 transition-opacity disabled:opacity-0 group-hover:opacity-100" />
                <CarouselNext className="right-2 cursor-pointer opacity-0 transition-opacity disabled:opacity-0 group-hover:opacity-100" />
                <div className="absolute right-2 bottom-2 rounded-md bg-black/50 px-2 py-0.5 text-white text-xs">
                  {currentImageIndex}/{postData.images.length}
                </div>
              </Carousel>
            </div>
            <div className="relative flex max-h-[calc(90vh-220px)] min-h-0 flex-col overflow-auto rounded-md border-2 border-border bg-accent p-2">
              <button
                type="button"
                className="cursor-pointer text-left font-bold hover:underline"
                onClick={async () => {
                  await setPostId(null);
                  sendToProfilePage(postData.createdBy, router);
                }}
              >
                {postData.createdBy}
              </button>
              <hr className="my-2 border-border border-t-2" />

              <p className="font-bold">Description:</p>
              <p className="wrap-break-word max-w-[45ch]">
                {`${postData.description.slice(0, MAX_DESCRIPTION)}${postData.description.length > MAX_DESCRIPTION ? "..." : ""}`}
              </p>
              <hr className="my-2 border-border border-t-2" />

              {postData.price && (
                <p>
                  Price: <Badge className="mr-1 rounded-md bg-secondary px-1 font-bold text-secondary-foreground">${postData.price}</Badge>
                </p>
              )}

              <p>
                Garment Type:{" "}
                <Badge className="mr-1 rounded-md bg-secondary px-1 font-bold text-secondary-foreground">{postData.garmentType}</Badge>
              </p>
              <p>
                Color:{" "}
                {postData.colour.map((color) => (
                  <Badge className="mr-1 rounded-md bg-secondary px-1 font-bold text-secondary-foreground" key={color}>
                    {color}
                  </Badge>
                ))}
              </p>
              <p>
                Size: <Badge className="rounded-md bg-secondary px-1 font-bold text-secondary-foreground">{postData.size}</Badge>
              </p>
              <p>
                Material:{" "}
                {postData.material.map((mats) => (
                  <Badge className="mr-1 rounded-md bg-secondary px-1 font-bold text-secondary-foreground" key={mats}>
                    {mats}
                  </Badge>
                ))}
              </p>
              <p>
                Hashtags:{" "}
                {postData.hashtags.map((hashtag) => (
                  <Badge className="mr-1 rounded-md bg-secondary px-1 font-bold text-secondary-foreground" key={hashtag}>
                    {hashtag}
                  </Badge>
                ))}
              </p>
              <hr className="my-2 border-border border-t-2" />
              <CommentBox postId={postData._id} />
              {/* <p className="font-bold">Comments:</p>
              {postData.comments.length > 0 && <CommentInput sentence="Add a new comment!" post={postData} />}
              {postData.comments.length < 1 ? (
                <CommentInput sentence="Be the first to comment!" post={postData} />
              ) : (
                <Comments post={postData} />
              )} */}
            </div>
          </div>
          <TradeDialog postData={postData} canSeeButton={canSeeButton} onTradeSuccess={async () => { await setPostId(null); }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
