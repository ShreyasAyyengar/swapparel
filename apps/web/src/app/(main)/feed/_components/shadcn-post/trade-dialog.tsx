"use client";

import { MAX_MESSAGE_LENGTH, type postSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Calendar } from "@swapparel/shad-ui/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@swapparel/shad-ui/components/dialog";
import { Input } from "@swapparel/shad-ui/components/input";
import { Label } from "@swapparel/shad-ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { Textarea } from "@swapparel/shad-ui/components/textarea";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDownIcon, Clock3, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type z from "zod";
import { authClient } from "../../../../../lib/auth-client";
import { socketClientORPC } from "../../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../../lib/orpc-web-client";

type TradeDialogProps = {
  postData: z.infer<typeof postSchema>;
  canSeeButton: boolean;
  onTradeSuccess?: () => Promise<void>;
};

const DEFAULT_TRADE_HOUR = 12;
const DEFAULT_TRADE_MINUTE = 0;
const DEFAULT_TRADE_TIME = "12:00";

export default function TradeDialog({ postData, canSeeButton, onTradeSuccess }: TradeDialogProps) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const [isTrading, setIsTrading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<z.infer<typeof postSchema>[]>([]);
  const [calenderOpen, setCalenderOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeValue, setTimeValue] = useState(DEFAULT_TRADE_TIME);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authData = data;
  const email = authData?.user.email;

  const { data: postsByUser } = useQuery(
    webClientORPC.posts.getPosts.queryOptions({
      input: { createdBy: email ?? "" },
      enabled: !!email,
    })
  );

  const applyTimeToDate = (selectedDate: Date, time: string) => {
    const [hoursText = String(DEFAULT_TRADE_HOUR), minutesText = String(DEFAULT_TRADE_MINUTE).padStart(2, "0")] = time.split(":");
    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    const nextDate = new Date(selectedDate);
    nextDate.setHours(
      Number.isNaN(hours) ? DEFAULT_TRADE_HOUR : hours,
      Number.isNaN(minutes) ? DEFAULT_TRADE_MINUTE : minutes,
      DEFAULT_TRADE_MINUTE,
      DEFAULT_TRADE_MINUTE
    );
    return nextDate;
  };

  const handleTradeSelection = (newPost: z.infer<typeof postSchema>) => {
    setSelectedPosts((prev) => {
      if (prev.some((p) => p._id === newPost._id)) {
        return prev.filter((p) => p._id !== newPost._id);
      }
      return [...prev, newPost];
    });
  };

  const resetTradeForm = () => {
    setSelectedPosts([]);
    setCalenderOpen(false);
    setDate(undefined);
    setTimeValue(DEFAULT_TRADE_TIME);
    setMessage("");
    setErrorMessage("");
  };

  const queryClient = useQueryClient();

  const createTradeMutation = useMutation(
    // TODO look at fetchOnRemount for trade query to prevent doing all this
    webClientORPC.transaction.createTransaction.mutationOptions({
      onSuccess: async ({ _id }) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getInterlocutors.queryOptions().queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: [["transaction", "getTransactionsByInterlocutor"]],
          }),
        ]);
        socketClientORPC.messaging.publishTransactionDataChange({ transactionId: _id });
        await onTradeSuccess?.();
        router.push(`/trades?trade=${_id}`);
      },
    })
  );

  const handleSubmit = async () => {
    if (!email) return;
    if (!date) {
      setErrorMessage("Choose a meetup date and time before sending.");
      return;
    }
    if (date.getTime() <= Date.now()) {
      setErrorMessage("Choose a future meetup time.");
      return;
    }

    try {
      await createTradeMutation.mutateAsync({
        sellerPostId: postData._id,
        buyerPostIds: selectedPosts.map((p) => p._id),
        scheduledFor: date,
        initialMessage: message.trim() || undefined,
      });
    } catch {
      setErrorMessage("The trade request could not be sent. Please try again.");
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      if (createTradeMutation.isPending) return;
      resetTradeForm();
    }
    setIsTrading(open);
  };

  if (!canSeeButton) return null;

  return (
    <Dialog open={isTrading} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/85">Trade</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[95vw] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Request a trade</DialogTitle>
          <DialogDescription>Choose what to offer and suggest a meetup time before sending.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
          <div className="min-w-0 space-y-5">
            <section>
              <p className="mb-2 font-semibold text-sm">Trading for</p>
              <div className="flex min-w-0 gap-3 rounded-md border border-border bg-muted/30 p-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                  <Image src={postData.images[0] ?? ""} alt={postData.title} fill className="object-cover" sizes="80px" unoptimized />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{postData.title}</p>
                  <p className="truncate text-muted-foreground text-sm">{postData.createdBy}</p>
                  <p className="mt-2 text-muted-foreground text-xs">
                    {postData.garmentType} · {postData.size}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-semibold text-sm">Your items to offer (optional)</p>
                <p className="text-muted-foreground text-xs">{selectedPosts.length} selected</p>
              </div>
              <div className="max-h-[360px] overflow-auto rounded-md border border-border bg-card p-3">
                {postsByUser && postsByUser.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {postsByUser.map((post) => {
                      const isSelected = selectedPosts.some((p) => p._id === post._id);
                      return (
                        <button
                          key={post._id}
                          type="button"
                          aria-pressed={isSelected}
                          className={cn(
                            "group relative aspect-square overflow-hidden rounded-md border-2 text-left transition-all",
                            isSelected ? "border-success" : "border-transparent hover:border-muted-foreground"
                          )}
                          onClick={() => handleTradeSelection(post)}
                        >
                          <Image src={post.images[0] ?? ""} alt={post.title} fill className="object-cover" sizes="160px" unoptimized />
                          <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-black/60 px-2 py-1 font-medium text-[11px] text-white leading-tight">
                            {post.title}
                          </span>
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                              <span className="rounded-full bg-background p-1">
                                <Check className="size-5 text-success" />
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-36 items-center justify-center">
                    <p className="text-muted-foreground text-sm">You don't have any posts to offer yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="space-y-4 rounded-md border border-border bg-card p-4">
            <div>
              <p className="font-semibold text-sm">Meetup details</p>
              <p className="text-muted-foreground text-xs">The seller can update these details later in the trade chat.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date-picker">Date</Label>
                <Popover open={calenderOpen} onOpenChange={setCalenderOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" id="date-picker" className="justify-between border-border font-mono text-foreground">
                      {date ? date.toLocaleDateString() : "Select date"}
                      <ChevronDownIcon className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      hidden={{ before: new Date() }}
                      onSelect={(selectedDate) => {
                        if (!selectedDate) return;
                        setDate(applyTimeToDate(selectedDate, timeValue));
                        setCalenderOpen(false);
                        setErrorMessage("");
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="time-picker">Time</Label>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    id="time-picker"
                    autoComplete="off"
                    step="300"
                    value={timeValue}
                    className="border-border bg-background pl-9 font-mono text-foreground"
                    onChange={(event) => {
                      const nextTime = event.currentTarget.value;
                      setTimeValue(nextTime);
                      setDate((prev) => (prev ? applyTimeToDate(prev, nextTime) : prev));
                      setErrorMessage("");
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label htmlFor="message">Initial message</Label>
                <span className="text-muted-foreground text-xs">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
              <Textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setErrorMessage("");
                }}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="I'd like to trade these items for your post."
                id="message"
                className="min-h-28"
              />
            </div>

            {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
          </section>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => handleDialogOpenChange(false)} disabled={createTradeMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/85"
            onClick={handleSubmit}
            disabled={createTradeMutation.isPending || !date}
          >
            {createTradeMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
            Send trade request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
