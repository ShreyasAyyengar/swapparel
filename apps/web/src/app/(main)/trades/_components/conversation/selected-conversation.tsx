import { Avatar, AvatarFallback, AvatarImage } from "@swapparel/shad-ui/components/avatar";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, MessagesSquare } from "lucide-react";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import { useActiveTradeStore } from "../../_hooks/use-active-trade-store";
import SelectedTrade from "../selected-trade";
import TradeCard, { TradeCardSkeleton } from "../trade-card";

export default function SelectedConversation({ userId }: { userId: string }) {
  const { data: user } = useQuery(
    webClientORPC.users.getUser.queryOptions({
      input: { id: userId },
      enabled: !!userId,
    })
  );
  const { data: transactions, isPending } = useQuery(
    webClientORPC.transaction.getTransactionsByInterlocutor.queryOptions({ input: { interlocutorId: userId } })
  );
  const activeTradeId = useActiveTradeStore((state) => state.activeTradeId);
  const activeTrade = transactions?.find(({ _id }) => _id === activeTradeId);
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-h-0">
        {activeTrade ? (
          <SelectedTrade key={activeTrade._id} interlocutorId={userId} transaction={activeTrade} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <MessagesSquare className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Choose a trade</p>
              <p className="max-w-sm text-muted-foreground text-sm">Select a trade on the right to open its messages and meetup details.</p>
            </div>
          </div>
        )}
      </div>

      <aside className="flex min-h-0 flex-col border-border border-t bg-muted/10 lg:border-t-0 lg:border-l">
        <div className="flex items-center gap-3 border-border border-b px-4 py-4">
          <Avatar className="size-10">
            <AvatarImage src={user?.image} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            {user ? <p className="truncate font-semibold">{user.name}</p> : <Skeleton className="h-5 w-32" />}
            <p className="text-muted-foreground text-xs">
              {transactions?.length ?? 0} active {(transactions?.length ?? 0) === 1 ? "trade" : "trades"}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">Active trades</p>
          <div className="flex flex-col gap-2">
            {isPending ? (
              <>
                <TradeCardSkeleton />
                <TradeCardSkeleton />
                <TradeCardSkeleton />
              </>
            ) : transactions && transactions.length > 0 ? (
              transactions.map((transaction) => <TradeCard key={transaction._id} interlocutorId={userId} transaction={transaction} />)
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                <ArrowLeftRight className="size-6" />
                <p className="text-sm">No active trades with this person.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
