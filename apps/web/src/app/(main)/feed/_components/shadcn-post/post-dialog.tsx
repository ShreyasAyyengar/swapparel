"use client";

import type { postSchema } from "@swapparel/contracts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@swapparel/shad-ui/components/alert-dialog";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { Button } from "@swapparel/shad-ui/components/button";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import type z from "zod";
import { authClient } from "../../../../../lib/auth-client";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import sendToProfilePage from "../../../profile/_components/helper-functions";
import { useFetchedPostsStore } from "../../_hooks/use-posts-store";
import ReportForm from "../../_report/report-form";
import CommentBox from "./comments/comment-box";
import { CommentContext } from "./comments/comment-context";
import TradeDialog from "./trade-dialog";

type PostDialogProps = {
  postData: z.infer<typeof postSchema>;
  className?: string;
};

export default function PostDialog({ postData, className }: PostDialogProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postId, setPostId] = useQueryState("id", parseAsString);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [loadedImages, setLoadedImages] = useState(() => new Set<number>());
  const [canSeeButton, setCanSeeButton] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isPending } = authClient.useSession();
  const [descriptionHeight, setDescriptionHeight] = useState<number | undefined>(undefined);
  const observerRef = useRef<ResizeObserver | null>(null);
  const imageCallbackRef = (el: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        setDescriptionHeight(h);
      }
    });
    observer.observe(el);
    observerRef.current = observer;
  };
  const MAX_DESCRIPTION = 1000;

  useEffect(() => {
    if (isPending) return;
    if (data?.user.email !== postData.createdBy) setCanSeeButton(true);
  }, [data, isPending, postData.createdBy]);

  const canSeeDeleteButton = data?.user.email === postData.createdBy;

  const deletePostMutation = useMutation(
    webClientORPC.posts.deletePost.mutationOptions({
      onSuccess: async () => {
        useFetchedPostsStore.setState((state) => ({
          fetchedPosts: state.fetchedPosts.filter((p) => p._id !== postData._id),
        }));
        queryClient.removeQueries({ queryKey: [["feed", "getFeed"]] });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [["posts", "getPosts"]] }),
          queryClient.invalidateQueries({ queryKey: [["transaction", "getTransactions"]] }),
          queryClient.invalidateQueries({ queryKey: [["transaction", "getInterlocutors"]] }),
          queryClient.invalidateQueries({ queryKey: [["transaction", "getTransactionsByInterlocutor"]] }),
        ]);
        await setPostId(null);
        setDialogOpen(false);
        setDeleteDialogOpen(false);
      },
    })
  );

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
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>
              {postData.title} <span className="font-normal text-sm">- {postData.createdBy}</span>
            </DialogTitle>

            {canSeeButton && (
              <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground">
                    Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Report this post</DialogTitle>
                  </DialogHeader>
                  <ReportForm reportedPostId={postData._id} closeAction={() => setReportDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>
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
                        <div
                          ref={index === 0 ? imageCallbackRef : undefined}
                          className="relative aspect-square w-full overflow-hidden rounded-md border border-border"
                        >
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
            <div
              className="relative flex min-h-0 flex-col overflow-auto rounded-md border-2 border-border bg-accent p-2"
              style={{ height: descriptionHeight, maxHeight: "calc(90vh - 220px)" }}
            >
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
              <CommentContext.Provider value={{ post: postData }}>
                <CommentBox />
              </CommentContext.Provider>
            </div>
          </div>
          {canSeeDeleteButton && (
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full cursor-pointer font-bold">
                  Delete post
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this post, its comments, and cancel any ongoing trades. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={deletePostMutation.isPending}
                    className="cursor-pointer bg-destructive text-destructive-foreground"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deletePostMutation.isPending}
                    onClick={() => deletePostMutation.mutate({ id: postData._id })}
                    className="cursor-pointer bg-destructive text-destructive-foreground"
                  >
                    {deletePostMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <TradeDialog
            postData={postData}
            canSeeButton={canSeeButton}
            onTradeSuccess={async () => {
              await setPostId(null);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
