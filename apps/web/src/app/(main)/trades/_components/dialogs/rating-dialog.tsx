"use client";

import type { transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@swapparel/shad-ui/components/dialog";
import { Textarea } from "@swapparel/shad-ui/components/textarea";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Star } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { authClient } from "../../../../../lib/auth-client";
import { webClientORPC } from "../../../../../lib/orpc-web-client";

function StarRating({ value, onChange, readOnly }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={cn("transition-colors", readOnly ? "cursor-default" : "cursor-pointer hover:scale-110")}
          onClick={() => onChange?.(star)}
        >
          <Star className={cn("size-7", star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

export default function RatingDialog({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const { data: authData } = authClient.useSession();

  const myEmail = authData?.user.email;
  const ratedUserEmail = myEmail === transaction.seller.emailSnapshot ? transaction.buyer.emailSnapshot : transaction.seller.emailSnapshot;

  const { data: existingRating, isLoading: isCheckingRating } = useQuery(
    webClientORPC.ratings.getMyRatingForTransaction.queryOptions({
      input: { transactionId: transaction._id },
      enabled: open && !!myEmail,
    })
  );

  const submitMutation = useMutation(
    webClientORPC.ratings.submitRating.mutationOptions({
      onSuccess: () => {
        setErrorMessage("");
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: webClientORPC.ratings.getMyRatingForTransaction.queryOptions({
            input: { transactionId: transaction._id },
          }).queryKey,
        });
      },
      onError: (err) => {
        setErrorMessage(
          err && typeof err === "object" && "code" in err && err.code === "CONFLICT"
            ? "You have already rated this trade."
            : "The rating could not be submitted. Please try again."
        );
      },
    })
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !submitMutation.isPending) {
      setRating(0);
      setComment("");
      setErrorMessage("");
    }
    setOpen(nextOpen);
  };

  const handleSubmit = () => {
    if (!myEmail || !ratedUserEmail) return;
    submitMutation.mutate({
      ratedUserEmail,
      transactionId: transaction._id,
      value: rating,
      comment: comment.trim() || undefined,
    });
  };

  const isAlreadyRated = !!existingRating;
  const canSubmit = rating > 0 && !isAlreadyRated;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Star />
          Rate trade
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate your trade</DialogTitle>
          <DialogDescription>Share your experience trading with the other party.</DialogDescription>
        </DialogHeader>

        {isCheckingRating ? (
          <div className="flex justify-center py-8">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="font-medium text-sm">Rating</p>
              <StarRating
                value={isAlreadyRated ? existingRating.value : rating}
                onChange={isAlreadyRated ? undefined : setRating}
                readOnly={isAlreadyRated}
              />
              {isAlreadyRated && <p className="text-muted-foreground text-xs">You already rated this trade.</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="rating-comment" className="font-medium text-sm">
                Comment <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="rating-comment"
                placeholder="Tell others about your experience..."
                maxLength={500}
                value={isAlreadyRated ? (existingRating.comment ?? "") : comment}
                onChange={(e) => setComment(e.target.value)}
                readOnly={isAlreadyRated}
                disabled={isAlreadyRated}
              />
              <p className="text-right text-muted-foreground text-xs">{comment.length}/500</p>
            </div>

            {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
          </div>
        )}

        <DialogFooter>
          <DialogClose>
            <Button type="button" variant="outline" disabled={submitMutation.isPending}>
              {isAlreadyRated ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          {!isAlreadyRated && (
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit || submitMutation.isPending}>
              {submitMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Star />}
              Submit rating
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
