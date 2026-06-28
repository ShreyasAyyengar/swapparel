import type { transactionSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ImageIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import type { z } from "zod";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import { useActiveTradeStore } from "../_hooks/use-active-trade-store";

export default function TradeCard({ interlocutorId, transaction }: { interlocutorId: string; transaction: z.infer<typeof transactionSchema> }) {
  const [, setTransactionIdURL] = useQueryState("trade", parseAsString);
  const activeTradeId = useActiveTradeStore((state) => state.activeTradeId);
  const setActiveTradeId = useActiveTradeStore((state) => state.setActiveTradeId);
  const interlocutorPosts = transaction.seller.userId === interlocutorId ? transaction.sellerPosts : transaction.buyerPosts;
  // Every trade has a seller item. A buyer may not have offered an item, so fall back to the seller's post.
  const firstItem = interlocutorPosts[0] ?? transaction.sellerPosts[0];
  const { data: post, isPending } = useQuery(
    webClientORPC.posts.getPost.queryOptions({
      input: { _id: firstItem?.postId ?? transaction._id },
      enabled: !!firstItem,
    })
  );
  const isActive = activeTradeId === transaction._id;
  const scheduledFor = new Date(transaction.scheduledFor);

  return (
    <button
      type="button"
      onClick={() => {
        setActiveTradeId(transaction._id);
        setTransactionIdURL(transaction._id);
      }}
      className={cn(
        "group flex w-full gap-3 rounded-xl border p-2.5 text-left transition-colors",
        isActive ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
      )}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {isPending ? (
          <Skeleton className="size-full" />
        ) : post?.images[0] ? (
          <Image src={post.images[0]} alt={firstItem?.titleSnapshot ?? "Trade item"} fill className="object-cover" sizes="80px" unoptimized />
        ) : (
          <ImageIcon className="absolute inset-0 m-auto size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 font-semibold text-sm leading-tight">{firstItem?.titleSnapshot ?? "Trade item"}</p>
          <Badge variant="default" className="shrink-0 font-bold text-[10px]">
            {transaction.status}
          </Badge>
        </div>
        <div className="mt-2 space-y-1 text-muted-foreground text-xs">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" />
            <span className="truncate">
              {scheduledFor.toLocaleDateString([], { month: "short", day: "numeric" })} ·{" "}
              {scheduledFor.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{transaction.location || "Location not set"}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function TradeCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border p-2.5">
      <Skeleton className="size-20 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
