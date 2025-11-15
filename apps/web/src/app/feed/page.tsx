"use client";

import { useQuery } from "@tanstack/react-query";
import { webClientORPC } from "../../lib/orpc-web-client";
import Post from "./_components/post";

export default function FeedPage() {
  const { data } = useQuery(
    webClientORPC.feed.getFeed.queryOptions({
      input: {},
      retry: false,
    })
  );

  return (
    <>
      {data?.map((post) => (
        <Post key={post._id} postData={post} />
      ))}
    </>
  );
}
