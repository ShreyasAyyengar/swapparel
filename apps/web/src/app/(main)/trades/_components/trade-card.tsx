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
  type: "requested" | "received";
  transaction: z.infer<typeof transactionSchemaWithAvatar>;
}) {
  const { data: postData } = useQuery(
    webClientORPC.posts.getPost.queryOptions({
      input: { _id: transaction.sellerPostID },
    })
  );

  const [, setTransactionIdURL] = useQueryState("trade", parseAsString);

  const { activeTrade, setActiveTrade } = useActiveTradeStore();

  if (!postData) return <div>Loading...</div>;

  // TODO do loading skeletons here?

  return (
    <div
      onClick={() => setTransactionIdURL(transaction._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") setTransactionIdURL(transaction._id);
      }}
      className={cn(
        "rounded-md border bg-primary/60 p-2 shadow-glass ring ring-black/0 backdrop-blur-2xl transition-all hover:border-secondary/50 hover:bg-primary/90",
        activeTrade?.transaction && activeTrade.transaction._id === transaction._id && "border-secondary/50 bg-primary/90"
      )}
    >
      <div className="flex items-center">
        <Image src={transaction.avatarURL} alt="Avatar" className="mr-2 rounded-full" width={32} height={32} />
        <div className="flex flex-col">
          <div className="font-bold">{postData?.title}</div>
          <div className="text-xs">{type === "requested" ? `sent to: ${postData?.createdBy}` : `received from ${transaction.buyerEmail}`}</div>
        </div>
      </div>
    </div>
  );
}
