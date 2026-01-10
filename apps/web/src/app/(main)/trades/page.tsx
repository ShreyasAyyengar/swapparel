"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@swapparel/shad-ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
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

  // validate tab
  const [tab, setTab] = useQueryState("tab", parseAsString);
  useEffect(() => {
    if (!tab || (tab !== "sent" && tab !== "received")) setTab("sent");

    return () => {
      setTab(null);
    };
  }, []);

  // fetch all transactions
  const { data, isInitialLoading } = useQuery(
    webClientORPC.transaction.getTransactions.queryOptions({
      enabled: !!authData, // this request is a protectedProcedure, do not enable until auth is confirmed
    })
  );

  // validate URL trans ID
  const [transactionIdURL, setTransactionIdURL] = useQueryState("trade", parseAsString);
  const { activeTrade, setActiveTrade } = useActiveTradeStore();

  useEffect(() => {
    if (!transactionIdURL) {
      setActiveTrade(undefined);
      return;
    }

    return () => setActiveTrade(undefined);
  }, [transactionIdURL, setActiveTrade]);

  useEffect(() => {
    if (!(data && transactionIdURL)) return;

    const find =
      data?.initiatedTransactions.find((t) => t._id === transactionIdURL) ?? data?.receivedTransactions.find((t) => t._id === transactionIdURL);

    // no mapping to actual trade
    if (find) {
      setActiveTrade(find);
    } else setTransactionIdURL(null);
  }, [transactionIdURL, data]);

  const showSkeletons = !authData || isInitialLoading;

  return (
    <div className="align fixed inset-0 mt-[61.5px] flex items-center justify-center">
      {/* Side bar */}
      <div className="ml-80 h-175 w-1/3 rounded-tl-2xl rounded-bl-2xl border-secondary border-t border-b border-l bg-neutral-900 p-2">
        <Tabs defaultValue={tab ?? "sent"} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
          <TabsContent value="sent">
            <div className="flex flex-col gap-2">
              {showSkeletons ? (
                <>
                  {/*<TradeCardSkeleton />*/}
                  {/*<TradeCardSkeleton />*/}
                  {/*<TradeCardSkeleton />*/}
                </>
              ) : (
                data?.initiatedTransactions.map((t) => (
                  <TradeCard
                    key={t._id}
                    type="sent"
                    transaction={{
                      ...t,
                      dateToSwap: new Date(t.dateToSwap),
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="received">
            <div className="flex w-full flex-col gap-2">
              {showSkeletons ? (
                <>
                  {/*<TradeCardSkeleton />*/}
                  {/*<TradeCardSkeleton />*/}
                  {/*<TradeCardSkeleton />*/}
                </>
              ) : (
                data?.receivedTransactions.map((t) => (
                  <TradeCard
                    key={t._id}
                    type="received"
                    transaction={{
                      ...t,
                      dateToSwap: new Date(t.dateToSwap),
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main panel */}
      <div className="mr-80 h-175 w-full rounded-tr-2xl rounded-br-2xl border border-secondary bg-neutral-900">
        {activeTrade ? (
          <SelectedTrade key={activeTrade._id} transaction={activeTrade} />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-2xl">No trade selected</div>
        )}
      </div>
    </div>
  );
}
