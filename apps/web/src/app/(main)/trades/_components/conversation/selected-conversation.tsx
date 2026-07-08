import { Avatar, AvatarFallback, AvatarImage } from "@swapparel/shad-ui/components/avatar";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@swapparel/shad-ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, MessagesSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../../../lib/auth-client";
import sendToProfilePage from "../../../profile/_components/helper-functions";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import { useActiveTradeStore } from "../../_hooks/use-active-trade-store";
import TradeCancelButton from "../buttons/trade-cancel-button";
import SelectedTrade from "../selected-trade";
import TradeCard, { TradeCardSkeleton } from "../trade-card";
import TradeCompletionButton from "../trade-completion-button";

export default function SelectedConversation({ userId, selectedTradeId }: { userId: string; selectedTradeId?: string }) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id;
  const router = useRouter();

  const { data: user } = useQuery(
    webClientORPC.users.getUser.queryOptions({
      input: { id: userId },
      enabled: !!userId,
    })
  );
  const { data: transactions, isPending } = useQuery(
    webClientORPC.transaction.getTransactionsByInterlocutor.queryOptions({ input: { interlocutorId: userId } })
  );
  const activeTransactions = transactions?.filter(({ status }) => status === "ongoing");
  const archivedTransactions = transactions?.filter(({ status }) => status !== "ongoing");
  const activeTradeId = useActiveTradeStore((state) => state.activeTradeId);
  const selectedTrade = transactions?.find(({ _id }) => _id === selectedTradeId) ?? transactions?.find(({ _id }) => _id === activeTradeId);
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
        {selectedTrade ? (
          <SelectedTrade key={selectedTrade._id} interlocutorId={userId} transaction={selectedTrade} />
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
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 border-border border-b px-4 py-4 text-left hover:bg-muted/30"
          onClick={() => user?.email && sendToProfilePage(user.email, router)}
        >
          <Avatar className="size-10">
            <AvatarImage src={user?.image} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            {user ? <p className="truncate font-semibold">{user.name}</p> : <Skeleton className="h-5 w-32" />}
            <p className="text-muted-foreground text-xs">
              {activeTransactions?.length ?? 0} active {(activeTransactions?.length ?? 0) === 1 ? "trade" : "trades"}
            </p>
          </div>
        </button>

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <Tabs defaultValue="active" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="active" className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Active trades
              </TabsTrigger>
              <TabsTrigger value="archived" className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Archived trades
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {isPending ? (
                  <>
                    <TradeCardSkeleton />
                    <TradeCardSkeleton />
                    <TradeCardSkeleton />
                  </>
                ) : activeTransactions && activeTransactions.length > 0 ? (
                  activeTransactions.map((transaction) => <TradeCard key={transaction._id} interlocutorId={userId} transaction={transaction} />)
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                    <ArrowLeftRight className="size-6" />
                    <p className="text-sm">No active trades with this person.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="archived" className="min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {isPending ? (
                  <>
                    <TradeCardSkeleton />
                    <TradeCardSkeleton />
                    <TradeCardSkeleton />
                  </>
                ) : archivedTransactions && archivedTransactions.length > 0 ? (
                  archivedTransactions.map((transaction) => (
                    <TradeCard key={transaction._id} interlocutorId={userId} transaction={transaction} />
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                    <ArrowLeftRight className="size-6" />
                    <p className="text-sm">No archived trades with this person.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {selectedTrade && currentUserId && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <TradeCompletionButton transaction={selectedTrade} currentUserId={currentUserId} interlocutorId={userId} />
                <TradeCancelButton transaction={selectedTrade} />
              </div>
              {(() => {
                const isBuyer = selectedTrade.buyer.userId === currentUserId;
                const otherConfirmed = isBuyer ? !!selectedTrade.sellerCompletionRequestedAt : !!selectedTrade.buyerCompletionRequestedAt;
                return selectedTrade.status === "ongoing" && otherConfirmed ? (
                  <p className="text-center text-muted-foreground text-xs">The other party has confirmed completion.</p>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
