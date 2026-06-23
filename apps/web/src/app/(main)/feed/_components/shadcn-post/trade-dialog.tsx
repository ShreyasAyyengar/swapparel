"use client";

import type { postSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Calendar } from "@swapparel/shad-ui/components/calendar";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@swapparel/shad-ui/components/carousel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@swapparel/shad-ui/components/dialog";
import { Input } from "@swapparel/shad-ui/components/input";
import { Label } from "@swapparel/shad-ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { Textarea } from "@swapparel/shad-ui/components/textarea";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "src/lib/auth-client";
import { webClientORPC } from "src/lib/orpc-web-client";
import type z from "zod";

type TradeDialogProps = {
  postData: z.infer<typeof postSchema>;
  canSeeButton: boolean;
};

export default function TradeDialog({ postData, canSeeButton }: TradeDialogProps) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const [isTrading, setIsTrading] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [loadedImages, setLoadedImages] = useState(() => new Set<number>());
  const [selectedPosts, setSelectedPosts] = useState<z.infer<typeof postSchema>[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [calenderOpen, setCalenderOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const authData = data;
  const email = authData?.user.email;

  const { data: postsByUser } = useQuery(
    webClientORPC.posts.getPosts.queryOptions({
      input: { createdBy: email ?? "" },
      enabled: !!email,
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

  const handleTradeSelection = (newPost: z.infer<typeof postSchema>) => {
    setSelectedPosts((prev) => {
      if (prev.some((p) => p._id === newPost._id)) {
        return prev.filter((p) => p._id !== newPost._id);
      }
      return [...prev, newPost];
    });
  };

  const createTradeMutation = useMutation(
    webClientORPC.transaction.createTransaction.mutationOptions({
      onSuccess: ({ _id }) => {
        router.push(`/trades?trade=${_id}`);
      },
    })
  );

  const handleSubmit = async () => {
    if (!email) return;

    await createTradeMutation.mutateAsync({
      sellerEmail: postData.createdBy,
      sellerPost: {
        id: postData._id,
        title: postData.title,
        createdBy: postData.createdBy,
      },
      buyerEmail: email,
      buyerPosts: selectedPosts.map((p) => ({
        id: p._id,
        title: p.title,
        createdBy: p.createdBy,
      })),
      dateToSwap: date ?? new Date(),
      initialMessage: message,
    });
  };

  if (!canSeeButton) return null;

  return (
    <>
      <Dialog open={isTrading} onOpenChange={setIsTrading}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/85">Trade</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Trade: {postData.title} <span className="font-normal text-sm">- {postData.createdBy}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-foreground">
            <div className="mb-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
              <div>
                <p className="mb-2 font-semibold">Item to Trade For</p>
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
              <div>
                <p className="mb-2 font-semibold">Your Posts to Offer (optional)</p>
                <div className="flex max-h-[calc(90vh-250px)] min-h-0 flex-col overflow-auto rounded-md border-2 border-border bg-card p-4">
                  {postsByUser && postsByUser.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
                      {postsByUser.map((post) => {
                        const isSelected = selectedPosts.some((p) => p._id === post._id);
                        return (
                          <div
                            key={post._id}
                            className={cn(
                              "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 transition-all",
                              isSelected ? "border-success" : "border-transparent hover:border-muted-foreground"
                            )}
                            onClick={() => handleTradeSelection(post)}
                            onKeyDown={() => handleTradeSelection(post)}
                            role="button"
                            tabIndex={0}
                          >
                            <Image src={post.images[0] ?? ""} alt={post.title} fill className="object-cover" unoptimized />
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Check size={40} className="text-success" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      {/* TODO: add a redirect to "create post" */}
                      <p className="text-sm">You don't have any posts to offer yet.</p>
                    </div>
                  )}
                  <p className="mt-2 text-right text-sm">{selectedPosts.length} selected</p>
                </div>
              </div>
            </div>
            <Button
              className="flex w-full cursor-pointer items-center justify-center bg-primary text-primary-foreground hover:bg-primary/85"
              onClick={() => setSubmitting(true)}
            >
              Submit Trade Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={submitting}
        onOpenChange={(open) => {
          if (!open) {
            setSubmitting(false);
            setDate(undefined);
            setMessage(undefined);
          }
        }}
      >
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Trade Request with {postData.createdBy}</DialogTitle>
            <DialogDescription>
              <span>Select a Date & Time, with an optional message to complete the trade request.</span>

              <div className="mt-5 flex justify-center gap-10">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="date-picker" className="px-1">
                    Date
                  </Label>
                  <Popover
                    open={calenderOpen}
                    onOpenChange={(open) => {
                      setCalenderOpen(open);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" id="date-picker" className="justify-between border-border font-mono text-foreground">
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        hidden={{ before: new Date() }}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          setCalenderOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="time-picker" className="px-1">
                    Time
                  </Label>
                  <Input
                    type="time"
                    id="time-picker"
                    autoComplete="off"
                    step="60"
                    defaultValue="00:00"
                    className="appearance-none border-border bg-background font-mono text-foreground [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    onBlur={(e) => {
                      e.preventDefault();
                      const time = e.currentTarget.value;
                      const [hours, minutes] = time.split(":").map(Number);
                      setDate((prev) => {
                        if (!prev) return prev;
                        const d = new Date(prev);
                        d.setHours(hours ?? 0, minutes ?? 0);
                        return d;
                      });
                    }}
                    disabled={!date}
                  />
                </div>
              </div>
            </DialogDescription>
            <div className="mt-5">
              <Label htmlFor="message" className="px-1">
                Initial Trade Message
              </Label>

              <Textarea
                className="mt-2"
                value={message ?? ""}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'd like to trade these items for your post."
                id="message"
              />
            </div>

            <div className="mt-2 flex justify-end">
              <Button
                variant="outline"
                className={cn(
                  "flex w-1/3 cursor-pointer items-center justify-center bg-primary text-primary-foreground hover:bg-primary/85",
                  createTradeMutation.isPending && "cursor-wait"
                )}
                onClick={() => {
                  handleSubmit();
                  setSubmitting(false);
                  setDate(undefined);
                  setMessage(undefined);
                }}
                disabled={createTradeMutation.isPending}
              >
                {createTradeMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
