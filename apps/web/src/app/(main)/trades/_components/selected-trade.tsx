import type { internalPostSchema, transactionSchemaWithAvatar } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Calendar } from "@swapparel/shad-ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import { webClientORPC } from "../../../../lib/orpc-web-client";

export default function SelectedTrade({
  transaction,
  post,
}: {
  transaction: z.infer<typeof transactionSchemaWithAvatar>;
  post: z.infer<typeof internalPostSchema>;
}) {
  const [changeableDate, setChangeableDate] = useState<Date>(new Date(transaction.dateToSwap));
  const router = useRouter();
  const queryClient = useQueryClient();

  // Create mutation for updating transaction
  const updateTransactionMutation = useMutation(
    webClientORPC.transaction.updateTransaction.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch the transactions query
        queryClient.invalidateQueries({
          queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
        });
      },
      onError: (error) => {
        console.error("Failed to update transaction:", error);
        // Optionally: show error toast/notification
        // Revert to original date on error
        setChangeableDate(new Date(transaction.dateToSwap));
      },
    })
  );

  return (
        <div className="w-fit rounded-md border border-secondary/50 bg-accent p-2 text-center font-bold text-bold text-foreground">
          <Popover
            onOpenChange={(open) => {
              // When popover closes, save the date if it changed
              if (!open && changeableDate.getTime() !== new Date(transaction.dateToSwap).getTime()) {
                updateTransactionMutation.mutate({
                  _id: transaction._id,
                  dateToSwap: changeableDate,
                });
              }
            }}
          >
            <div className="flex items-center gap-2">
              <div>{updateTransactionMutation.isPending ? "Updating..." : "Date To Swap: "}</div>
              <PopoverTrigger asChild>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="justify-between border-secondary font-mono text-foreground-950"
                    disabled={updateTransactionMutation.isPending}
                  >
                    {updateTransactionMutation.isPending ? <LoaderCircle className="animate-spin" /> : <CalendarIcon />}

                    {changeableDate.toLocaleDateString()}
                    <ChevronDownIcon />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="center">
                <Calendar
                  mode="single"
                  selected={changeableDate}
                  captionLayout="dropdown"
                  hidden={{ before: new Date() }}
                  onSelect={(selectedDate) => {
                    if (selectedDate) setChangeableDate(selectedDate);
                  }}
                />
              </PopoverContent>
            </div>
          </Popover>
        </div>

        {/* Location To Swap */}
        <div className="w-fit rounded-md border border-secondary/50 bg-accent p-2 text-center font-bold text-bold text-foreground">
          <div>{updateTransactionMutation.isPending ? "Updating..." : "Location To Swap: "}</div>
        </div>
      </div>
    </div>
  );
}
