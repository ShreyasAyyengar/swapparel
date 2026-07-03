"use client";

import type { transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle, Undo2 } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import TradeCompletionDialog from "./dialogs/trade-completion-dialog";

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

  const handleToggleCompletion = () => {
    toggleMutation.mutate({
      _id: transaction._id,
      toggleCompletion: true,
    });
  };

  return (
    <>
      {error && <p className="mb-2 text-destructive text-sm">{error}</p>}

      {iConfirmed && !otherConfirmed && (
        <TradeCompletionDialog onConfirm={handleToggleCompletion}>
          <Button type="button" variant="outline" disabled={toggleMutation.isPending}>
            {toggleMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
            Cancel request
          </Button>
        </TradeCompletionDialog>
      )}

      {!iConfirmed && (
        <Button type="button" variant="default" onClick={handleToggleCompletion} disabled={toggleMutation.isPending}>
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
