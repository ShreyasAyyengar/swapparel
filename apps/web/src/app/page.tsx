"use client";

import { isDefinedError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { webClientORPC } from "../lib/orpc-web-client";
import Navbar from "./_components/navbar";

export default function Home() {
  const { data, error } = useQuery(
    webClientORPC.posts.deletePost.queryOptions({
      input: { id: "e842525d-fe2d-4003-a88a-8e1c7da5d436" },
      retry: false,
    })
  );
  return (
    <div className={"flex h-[2000px] items-center justify-center p-8 align-middle"}>
      <p className="top-0 font-bold text-xl">Swapparel</p>

      {error && isDefinedError(error)}
      <Navbar />
    </div>
  );
}
