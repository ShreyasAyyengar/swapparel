"use client";

import type { transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@swapparel/shad-ui/components/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle, Undo2 } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";

export default function TradeCompletionButton({
  transaction,
  currentUserId,
  interlocutorId,
}: {
  transaction: z.infer<typeof transactionSchema>;
  currentUserId: string;
  interlocutorId: string;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const isBuyer = transaction.buyer.userId === currentUserId;
  const iConfirmed = isBuyer ? !!transaction.buyerCompletionRequestedAt : !!transaction.sellerCompletionRequestedAt;
  const otherConfirmed = isBuyer ? !!transaction.sellerCompletionRequestedAt : !!transaction.buyerCompletionRequestedAt;

  const toggleMutation = useMutation(
    webClientORPC.transaction.updateTransaction.mutationOptions({
      onSuccess: async () => {
        setError("");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactionsByInterlocutor.queryOptions({
              input: { interlocutorId },
            }).queryKey,
          }),
        ]);
        socketClientORPC.messaging.publishTransactionDataChange({
          transactionId: transaction._id,
        });
      },
      onError: () => {
        setError("Something went wrong. Try again.");
      },
    })
  );

  if (transaction.status !== "ongoing") return null;

  if (iConfirmed && otherConfirmed) return null;

  const handleClick = () => {
    toggleMutation.mutate({
      _id: transaction._id,
      toggleCompletion: true,
    });
  };

  return (
    <>
      {error && <p className="mb-2 text-destructive text-sm">{error}</p>}

      {iConfirmed && !otherConfirmed && (
        <>
          <Button type="button" variant="outline" onClick={() => setConfirmCancelOpen(true)} disabled={toggleMutation.isPending}>
            {toggleMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
            Cancel request
          </Button>

          <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel completion request?</DialogTitle>
                <DialogDescription>The other party will be notified that you have withdrawn your confirmation.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setConfirmCancelOpen(false)}>
                  Go back
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setConfirmCancelOpen(false);
                    handleClick();
                  }}
                >
                  Yes, cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {!iConfirmed && (
        <Button type="button" variant="default" onClick={handleClick} disabled={toggleMutation.isPending}>
          {toggleMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
          Complete trade
        </Button>
      )}

      {!iConfirmed && otherConfirmed && (
        <p className="mt-2 text-center text-muted-foreground text-xs">The other party has confirmed completion.</p>
      )}
    </>
  );
}
