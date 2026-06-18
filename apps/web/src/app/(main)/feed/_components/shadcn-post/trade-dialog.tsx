"use client";

import type { postSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Calendar } from "@swapparel/shad-ui/components/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@swapparel/shad-ui/components/dialog";
import { Input } from "@swapparel/shad-ui/components/input";
import { Label } from "@swapparel/shad-ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { Textarea } from "@swapparel/shad-ui/components/textarea";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "src/lib/auth-client";
import { webClientORPC } from "src/lib/orpc-web-client";
import type z from "zod";
import ChoosePostGrid from "../post/trading/choose-post-grid";
import TradingImage from "../post/trading/trade-image";

type TradeDialogProps = {
  postData: z.infer<typeof postSchema>;
  canSeeButton: boolean;
};

export default function TradeDialog({ postData, canSeeButton }: TradeDialogProps) {
  const { data } = authClient.useSession();
  const authData = data!;
  const router = useRouter();
  const [isTrading, setIsTrading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<z.infer<typeof postSchema>[]>([]);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calenderOpen, setCalenderOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [apiSubmitting, setApiSubmitting] = useState(false);

  const handleTradeSelection = (newPost: z.infer<typeof postSchema>) => {
    setSelectedPosts((prev) => {
      if (prev.some((p) => p._id === newPost._id)) return prev.filter((p) => p._id !== newPost._id);
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
    setApiSubmitting(true);
    await createTradeMutation.mutateAsync({
      sellerEmail: authData.user.email,
      sellerPost: { id: postData._id, title: postData.title, createdBy: authData.user.email },
      buyerEmail: authData.user.email,
      buyerPosts: selectedPosts.map((p) => ({ id: p._id, title: p.title, createdBy: authData.user.email })),
      dateToSwap: date,
      initialMessage: message,
    });
  };

  const { data: postsByUser } = useQuery(
    webClientORPC.posts.getPosts.queryOptions({
      input: { createdBy: authData.user.email },
    })
  );

  if (!canSeeButton) return null;

  return (
    <Dialog open={isTrading} onOpenChange={setIsTrading}>
      <DialogTrigger asChild>
        <Button className="w-full bg-foreground text-background hover:cursor-pointer hover:bg-foreground-500">Trade</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center font-light text-2xl">TRADING POST</DialogTitle>
        </DialogHeader>
        <div className="grid w-full grid-cols-1 items-center gap-5 md:grid-cols-2">
          <TradingImage images={postData.images} />
          <div className="flex min-h-0 flex-col rounded-md border-2 border-secondary">
            <p className="my-3 flex justify-center font-bold">Choose your post</p>
            <div className="min-h-0 flex-1">
              <ChoosePostGrid postsByUser={postsByUser ?? undefined} onBackgroundClick={() => {}} handleTradeSelection={handleTradeSelection} />
            </div>
            <p className="mt-2 mr-2 flex justify-end">{selectedPosts.length} selected</p>
          </div>
        </div>
        <Button
          className={cn("mt-5 flex w-full cursor-pointer items-center justify-center bg-foreground text-background hover:bg-foreground-500")}
          onClick={() => {
            if (selectedPosts.length === 0) setShowEmptyWarning(true);
            else setSubmitting(true);
          }}
        >
          SUBMIT
        </Button>
        <Dialog
          open={showEmptyWarning}
          onOpenChange={(open) => {
            if (!open) setShowEmptyWarning(false);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Empty Trade Request?</DialogTitle>
              <DialogDescription>
                <span>You have not selected any posts to trade with. Are you sure you want to submit an empty trade request?</span>
                <div className="flex justify-center">
                  <Button
                    variant="destructive"
                    className="mt-5 mr-5 flex w-1/3 cursor-pointer items-center justify-center bg-foreground text-white hover:bg-foreground-500"
                    onClick={() => setShowEmptyWarning(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="mt-5 ml-5 flex w-1/3 cursor-pointer items-center justify-center bg-foreground text-background hover:bg-foreground-500"
                    onClick={() => {
                      setShowEmptyWarning(false);
                      setSubmitting(true);
                    }}
                  >
                    Continue Trade
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
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
                        <Button variant="outline" id="date-picker" className="justify-between border-secondary font-mono text-foreground-950">
                          {date ? date.toLocaleDateString() : "Select date"}
                          <ChevronDownIcon className="" />
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
                      className="appearance-none border-secondary bg-background font-mono text-foreground-950 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      onBlur={(e) => {
                        e.preventDefault();
                        const time = e.currentTarget.value;
                        const [hours, minutes] = time.split(":").map(Number);
                        setDate((prev) => new Date(prev!.setHours(hours!, minutes)));
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
                  placeholder="I put two shirts in exchange for your jacket."
                  id="message"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  className={cn(
                    "flex w-1/3 cursor-pointer items-center justify-center bg-foreground text-background hover:bg-foreground-500",
                    `${apiSubmitting ? "cursor-wait" : "cursor-default"}`
                  )}
                  onClick={() => {
                    handleSubmit();
                    setSubmitting(false);
                    setDate(undefined);
                    setMessage(undefined);
                  }}
                  disabled={!date || apiSubmitting}
                >
                  {apiSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
