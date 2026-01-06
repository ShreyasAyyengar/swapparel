"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authClient } from "../../../lib/auth-client";
import { webClientORPC } from "../../../lib/orpc-web-client";

export default function Page() {
  const { data: authData, isPending } = authClient.useSession();

  useEffect(() => {
    console.log("current auth data: ", authData);
  }, [authData]);

  // Always call hooks. Gate side effects inside them.
  // useEffect(() => {
  //   if (isPending) return;
  //   if (authData) return;
  //
  //   authClient.signIn.social(
  //     {
  //       provider: "google",
  //       callbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/feed?create`,
  //       errorCallbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/auth/error`,
  //     },
  //     {}
  //   );
  // }, [authData, isPending]);

  const transactionsQuery = useQuery(
    webClientORPC.transaction.getTransactions.queryOptions({
      input: {},
      enabled: !!authData,
    })
  );

  // Render gating (this is fine)
  if (!authData) {
    return <div>Redirecting...</div>;
  }

  return <div>Trades Overview / Listing page</div>;
}
