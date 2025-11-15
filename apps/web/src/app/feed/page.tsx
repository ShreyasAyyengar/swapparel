"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { webClientORPC } from "../../lib/orpc-web-client";
import Header from "./_components/header";
import Post from "./_components/post";
import Search from "./_components/search-bar";

export default function FeedPage() {
  const [peeking, setPeeking] = useQueryState("peek", { defaultValue: "155" });

  const { data } = useQuery(
    webClientORPC.feed.getFeed.queryOptions({
      input: {},
      retry: false,
    })
  );
  const renderPosts = data?.map((post) => <Post key={post._id} postData={post} />);

  // TODO: customize scroll bar
  return (
    <>
      <Header />
      <div className="flex justify-center">
        <Search />
      </div>
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{renderPosts}</div>
      </div>
    </>
  );
}
