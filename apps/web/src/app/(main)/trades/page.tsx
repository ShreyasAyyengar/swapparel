"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageCircleMore } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { env } from "../../../env";
import { authClient } from "../../../lib/auth-client";
import { webClientORPC } from "../../../lib/orpc-web-client";
import ConversationCard, { ConversationCardSkeleton } from "./_components/conversation/conversation-card";
import SelectedConversation from "./_components/conversation/selected-conversation";
import { useActiveConversationStore } from "./_hooks/use-active-conversation-store";
import { useActiveTradeStore } from "./_hooks/use-active-trade-store";

const conversationSkeletonIds = ["conversation-1", "conversation-2", "conversation-3", "conversation-4", "conversation-5"];

export default function Page() {
  // auth state
  const { data: authData, isPending } = authClient.useSession();
  useEffect(() => {
    if (isPending) return;
    if (authData) return;

    authClient.signIn.social({
      provider: "google",
      callbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/trades`,
      errorCallbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/auth/error`,
    });
  }, [authData, isPending]);

  const { data: interlocutors, isLoading } = useQuery(
    webClientORPC.transaction.getInterlocutors.queryOptions({
      enabled: !!authData,
    })
  );

  // A direct trade URL restores both the interlocutor and the selected trade.
  const [transactionIdURL, setTransactionIdURL] = useQueryState("trade", parseAsString);
  const activeTradeId = useActiveTradeStore((state) => state.activeTradeId);
  const setActiveTradeId = useActiveTradeStore((state) => state.setActiveTradeId);
  const activeConversation = useActiveConversationStore((state) => state.activeConversation);
  const setActiveConversation = useActiveConversationStore((state) => state.setActiveConversation);
  const { data: transactionData } = useQuery(
    webClientORPC.transaction.getTransactions.queryOptions({
      enabled: !!authData && !!transactionIdURL,
    })
  );

  useEffect(() => {
    if (!transactionIdURL) {
      if (activeTradeId) setActiveTradeId(undefined);
      return;
    }

    if (!(transactionData && authData)) return;

    const transaction = transactionData.transactions.find(({ _id }) => _id === transactionIdURL);
    if (!transaction) {
      setTransactionIdURL(null);
      return;
    }

    const currentUserId = authData.user.id;
    const interlocutorId = transaction.buyer.userId === currentUserId ? transaction.seller.userId : transaction.buyer.userId;
    if (activeConversation !== interlocutorId) setActiveConversation(interlocutorId);
    if (activeTradeId !== transaction._id) setActiveTradeId(transaction._id);
  }, [
    activeConversation,
    activeTradeId,
    authData,
    setActiveConversation,
    setActiveTradeId,
    setTransactionIdURL,
    transactionData,
    transactionIdURL,
  ]);

  const showSkeletons = !authData || isLoading;

  return (
    <main className="mx-auto max-w-[1600px] py-2">
      <div className="grid h-[calc(100dvh-85px)] min-h-[620px] overflow-hidden rounded-2xl border border-border bg-background shadow-xl lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-h-0 border-border border-b bg-muted/30 lg:border-r lg:border-b-0">
          <div className="border-border border-b px-4 py-4">
            <p className="font-semibold text-lg">Trades</p>
            <p className="text-muted-foreground text-sm">Choose someone to view your active swaps.</p>
          </div>
          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto p-2 lg:max-h-none">
            {!showSkeletons ? (
              interlocutors && interlocutors.length > 0 ? (
                interlocutors.map(({ interlocutorId, count }) => (
                  <ConversationCard key={interlocutorId} userId={interlocutorId} transactionCount={count} />
                ))
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center text-muted-foreground">
                  <MessageCircleMore className="size-8" />
                  <p className="text-sm">Your trading conversations will appear here.</p>
                </div>
              )
            ) : (
              conversationSkeletonIds.map((id) => <ConversationCardSkeleton key={id} />)
            )}
          </div>
        </aside>

        <section className="min-h-0 bg-background">
          {activeConversation ? (
            <SelectedConversation key={activeConversation} userId={activeConversation} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-full bg-muted p-4">
                <MessageCircleMore className="size-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">Select a trading partner</p>
                <p className="text-muted-foreground text-sm">Their active trades and messages will open here.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
