"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@swapparel/shad-ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { env } from "../../../env";
import { authClient } from "../../../lib/auth-client";
import { webClientORPC } from "../../../lib/orpc-web-client";
import SelectedTrade from "./_components/selected-trade";
import TradeCard from "./_components/trade-card";
import { useActiveTradeStore } from "./_hooks/use-active-trade-store";

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

  // predefined trade ID in URL:
  const [transactionIdURL, setTransactionIdURL] = useQueryState("trade", parseAsString);
  const { data, isFetching } = useQuery(
    webClientORPC.transaction.getTransactions.queryOptions({
      enabled: !!authData, // this request is a protectedProcedure, do not enable until auth is confirmed
    })
  );

  // validate the URL id
  const [checkedTransactionId, setCheckedTransactionId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!(data && transactionIdURL)) return;

    const find = data?.initiatedTransactions.find((t) => t._id === transactionIdURL);

    if (find) setCheckedTransactionId(find.sellerPostID);
    else setTransactionIdURL(null);
  }, [transactionIdURL, data?.initiatedTransactions.find]);

  const { data: postFromTransactionId } = useQuery(
    webClientORPC.posts.getPost.queryOptions({
      // biome-ignore lint/style/noNonNullAssertion: this will always be a defined string, see next line.
      input: { _id: checkedTransactionId! },
      enabled: !!checkedTransactionId,
    })
  );
  useEffect(() => {
    if (!postFromTransactionId) return;
    if (!checkedTransactionId) return;
    useActiveTradeStore.getState().setActiveTrade({
      post: postFromTransactionId,
      // biome-ignore lint/style/noNonNullAssertion: only runs if checkedTransactionId is defined
      transaction: data!.initiatedTransactions.find((t) => t._id === checkedTransactionId),
    });
  }, [postFromTransactionId, checkedTransactionId, data]);

  const { activeTrade, setActiveTrade } = useActiveTradeStore();

  // todo put loading skeletons here
  if (!authData || isFetching) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="align absolute inset-0 mt-[61.5px] flex items-center justify-center border border-red-500">
      {/* Side bar */}
      <div className="ml-80 h-175 w-1/3 rounded-tl-2xl rounded-bl-2xl border-secondary border-t border-b border-l bg-neutral-900 p-2">
        <Tabs defaultValue="requested">
          <TabsList>
            <TabsTrigger value="requested">Requested</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
          <TabsContent value="requested">
            <div className="flex flex-col gap-2">
              {data?.initiatedTransactions.map((t) => (
                <TradeCard
                  key={t._id}
                  type="requested"
                  transaction={{
                    ...t,
                    dateToSwap: new Date(t.dateToSwap),
                  }}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="received">
            <div>Received Trades here</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main panel */}
      <div className="mr-80 h-175 w-full border border-orange-500 bg-neutral-900">
        {activeTrade ? (
          <SelectedTrade transaction={activeTrade.transaction} post={activeTrade.post} />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-2xl">No trade selected</div>
        )}
      </div>
    </div>
  );
}
