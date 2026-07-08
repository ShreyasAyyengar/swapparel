"use client";

import type { transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
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
import { LoaderCircle, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
    webClientORPC.ratings.getRatingForTransaction.queryOptions({
      input: { transactionId: transaction._id },
      enabled: !!myEmail,
    })
  );

  const isAlreadyRated = !!existingRating;

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.value);
      setComment(existingRating.comment ?? "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingRating]);

  const invalidateRatingQueries = () => {
    const queryKey = webClientORPC.ratings.getRatingForTransaction.queryOptions({
      input: { transactionId: transaction._id },
    }).queryKey;
    queryClient.invalidateQueries({ queryKey });
    if (ratedUserEmail) {
      const userRatingsKey = webClientORPC.ratings.getRatingsForUser.queryOptions({
        input: { ratedUserEmail },
      }).queryKey;
      queryClient.invalidateQueries({ queryKey: userRatingsKey });
    }
  };

  const submitMutation = useMutation(
    webClientORPC.ratings.submitRating.mutationOptions({
      onSuccess: () => {
        setErrorMessage("");
        setOpen(false);
        invalidateRatingQueries();
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

  const editMutation = useMutation(
    webClientORPC.ratings.editRating.mutationOptions({
      onSuccess: () => {
        setErrorMessage("");
        setOpen(false);
        invalidateRatingQueries();
      },
      onError: () => {
        setErrorMessage("The rating could not be saved. Please try again.");
      },
    })
  );

  const deleteMutation = useMutation(
    webClientORPC.ratings.deleteRating.mutationOptions({
      onSuccess: () => {
        setErrorMessage("");
        setOpen(false);
        invalidateRatingQueries();
      },
      onError: () => {
        setErrorMessage("The rating could not be deleted. Please try again.");
      },
    })
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !submitMutation.isPending && !editMutation.isPending && !deleteMutation.isPending) {
      if (existingRating) {
        setRating(existingRating.value);
        setComment(existingRating.comment ?? "");
      } else {
        setRating(0);
        setComment("");
      }
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

  const handleSave = () => {
    if (!existingRating) return;
    editMutation.mutate({
      _id: existingRating._id,
      value: rating,
      comment: comment.trim() || null,
    });
  };

  const handleDelete = () => {
    if (!existingRating) return;
    deleteMutation.mutate({ id: existingRating._id });
  };

  const canSubmit = rating > 0 && !isAlreadyRated;
  const isPending = submitMutation.isPending || editMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Star />
          {isAlreadyRated ? "Edit rating" : "Rate trade"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAlreadyRated ? "Edit your rating" : "Rate your trade"}</DialogTitle>
          <DialogDescription>
            {isAlreadyRated ? "Update your rating and feedback." : "Share your experience trading with the other party."}
          </DialogDescription>
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
                value={rating}
                onChange={setRating}
                readOnly={false}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rating-comment" className="font-medium text-sm">
                Comment <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="rating-comment"
                placeholder="Tell others about your experience..."
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="text-right text-muted-foreground text-xs">{comment.length}/500</p>
            </div>

            {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Close
            </Button>
          </DialogClose>
          <div className="flex gap-2">
            {isAlreadyRated && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={isPending}>
                    <Trash2 />
                    Delete rating
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete rating</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your rating? This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      {deleteMutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isAlreadyRated ? (
              <Button type="button" onClick={handleSave} disabled={isPending || !rating}>
                {editMutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
                Save
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isPending}>
                {submitMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Star />}
                Submit rating
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
