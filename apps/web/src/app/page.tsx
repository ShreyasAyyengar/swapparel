"use client";

import { useQuery } from "@tanstack/react-query";
import { webClientORPC } from "../lib/orpc-web-client";
import SignInOutButton from "./_components/sign-in-out-button";

export default function Home() {
  const { data: testResult, isLoading, error } = useQuery(webClientORPC.posts.test.queryOptions({ retry: true }));

  return (
    <div className="min-h-screen p-8">
      <p>{isLoading ? "Loading..." : (testResult ?? (error ? `Error: ${error.message}` : "No test result yet"))}</p>
      <SignInOutButton />
    </div>
  );
}
