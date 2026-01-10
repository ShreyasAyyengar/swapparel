import type { transactionSchema } from "@swapparel/contracts";
import { cn } from "@swapparel/shad-ui/lib/utils";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import type { z } from "zod";
import { useActiveTradeStore } from "../_hooks/use-active-trade-store";

export default function TradeCard({
  type,
  transaction,
}: {
  type: "sent" | "received";
  transaction: z.infer<typeof transactionSchema>; // No more "WithAvatar"!
}) {
  const [, setTransactionIdURL] = useQueryState("trade", parseAsString);
  const { activeTrade } = useActiveTradeStore();

  const displayUser = type === "sent" ? transaction.seller : transaction.buyer;
  const displayPost = transaction.sellerPost;

  return (
    <div
      onClick={() => setTransactionIdURL(transaction._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") setTransactionIdURL(transaction._id);
      }}
      className={cn(
        "cursor-pointer rounded-md border bg-background-50 p-2 shadow-glass ring ring-black/0 backdrop-blur-2xl transition-all",
        activeTrade && activeTrade._id === transaction._id
          ? "border-secondary/50 bg-primary/90"
          : "hover:border-secondary/50 hover:bg-neutral-700/20"
      )}
    >
      <div className="flex items-center">
        <Image src={displayUser.avatarURL || "/default-avatar.png"} alt="Avatar" className="mr-2 rounded-full" width={32} height={32} />
        <div className="flex min-w-0 flex-col">
          <div className="truncate font-bold">{displayPost.title}</div>
          <div className="truncate">{type === "sent" ? `sent to: ${transaction.seller.email}` : `received from ${transaction.buyer.email}`}</div>
        </div>
      </div>
    </div>
  );
}

// No more skeleton needed!
