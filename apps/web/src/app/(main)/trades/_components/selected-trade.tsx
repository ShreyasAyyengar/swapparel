import type { transactionSchema } from "@swapparel/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import Chat from "./chat";
import MutationBar from "./mutation-bar";

export default function SelectedTrade({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
  const [changeableDate, setChangeableDate] = useState<Date>(new Date(transaction.dateToSwap));
  const [changeableLocation, setChangeableLocation] = useState<string>(transaction.locationToSwap ?? "");
  const queryClient = useQueryClient();

  useEffect(() => {
    setChangeableDate(new Date(transaction.dateToSwap));
    setChangeableLocation(transaction.locationToSwap ?? "");
  }, [transaction.dateToSwap, transaction.locationToSwap]);

  useEffect(() => {
    let cancelled = false;

    const watchUpdates = async () => {
      try {
        for await (const _ of await socketClientORPC.subscribeToDataChange({ transactionId: transaction._id })) {
          await queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
          });

          if (cancelled) break;
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error watching transaction:", error);
        }
      }
    };

    watchUpdates();

    return () => {
      cancelled = true;
    };
  }, [transaction._id]);

  // Create mutation for updating transaction
  const updateTransactionMutation = useMutation(
    webClientORPC.transaction.updateTransaction.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch the transactions query
        queryClient.invalidateQueries({
          queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
        });

        socketClientORPC.publishDataChange({ transactionId: transaction._id });
      },
      onError: (error) => {
        console.error("Failed to update transaction:", error);
        // todo: show error toast/notification
        setChangeableDate(new Date(transaction.dateToSwap));
      },
    })
  );

  return (
    <div className={"flex h-full border border-red-500"}>
      <Chat transaction={transaction} />
      <div className="w-1/5">
        <MutationBar transaction={transaction} />
      </div>
    </div>
  );
}
