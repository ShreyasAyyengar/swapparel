import type { transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, RefreshCwOff } from "lucide-react";
import type { z } from "zod";
import { authClient } from "../../../../../lib/auth-client";
import { socketClientORPC } from "../../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import TradeCancelConfirmationDialog from "../dialogs/delete-confirmation-dialogs";

export default function TradeCancelButton({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
  const { data: authData } = authClient.useSession();
  const queryClient = useQueryClient();
  const interlocutorId = transaction.buyer.userId === authData?.user.id ? transaction.seller.userId : transaction.buyer.userId;

  const cancelMutation = useMutation(
    webClientORPC.transaction.cancelTransaction.mutationOptions({
      onSuccess: async () => {
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
    })
  );
  if (transaction && transaction.status !== "ongoing") return null;
  return (
    <TradeCancelConfirmationDialog
      onConfirm={() => {
        cancelMutation.mutate({ _id: transaction._id });
      }}
    >
      <Button type="button" variant="destructive" disabled={cancelMutation.isPending} className="hover:bg-destructive/50!">
        {cancelMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCwOff className="size-4" />}
        Cancel Trade
      </Button>
    </TradeCancelConfirmationDialog>
  );
}
