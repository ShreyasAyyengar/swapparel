import type { transactionSchemaWithAvatar } from "@swapparel/contracts";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import type { z } from "zod";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import { useActiveTradeStore } from "../_hooks/use-active-trade-store";

export default function TradeCard({
  type,
  transaction,
}: {
  type: "sent" | "received";
  transaction: z.infer<typeof transactionSchemaWithAvatar>;
}) {
  const { data: postData } = useQuery(
    webClientORPC.posts.getPost.queryOptions({
      input: { _id: transaction.sellerPostID },
    })
  );

  const [, setTransactionIdURL] = useQueryState("trade", parseAsString);

  const { activeTrade } = useActiveTradeStore();

  if (!postData) return <TradeCardSkeleton />; // TODO add more to loading state since we have transactionSchemaWithAvatar

  // TODO do loading skeletons here?

  return (
    <div
      onClick={() => {
        setTransactionIdURL(transaction._id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") setTransactionIdURL(transaction._id);
      }}
      className={cn(
        "cursor-pointer rounded-md border bg-background-50 p-2 shadow-glass ring ring-black/0 backdrop-blur-2xl transition-all",
        activeTrade?.transaction && activeTrade.transaction._id === transaction._id
          ? "border-secondary/50 bg-primary/90"
          : "hover:border-secondary/50 hover:bg-neutral-700/20"
      )}
    >
      <div className="flex items-center">
        <Image src={transaction.avatarURL} alt="Avatar" className="mr-2 rounded-full" width={32} height={32} />
        <div className="flex min-w-0 flex-col">
          <div className="truncate font-bold">{postData?.title}</div>
          <div className="text truncate">{type === "sent" ? `sent to: ${postData?.createdBy}` : `received from ${transaction.buyerEmail}`}</div>
        </div>
      </div>
    </div>
  );
}

export function TradeCardSkeleton() {
  return (
    <div className={cn("rounded-md border bg-neutral-700 p-2 shadow-glass ring ring-black/0 backdrop-blur-2xl", "animate-pulse")}>
      <div className="flex items-center">
        {/* Avatar */}
        <div className="mr-2 h-8 w-8 rounded-full bg-muted/60" />

        <div className="flex flex-col gap-1">
          {/* Title */}
          <div className="h-4 w-40 rounded bg-muted/60" />

          {/* Subtitle */}
          <div className="h-3 w-56 rounded bg-muted/40" />
        </div>
      </div>
    </div>
  );
}
