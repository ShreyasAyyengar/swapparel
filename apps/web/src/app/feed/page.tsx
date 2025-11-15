"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { webClientORPC } from "../../lib/orpc-web-client";
import ExpandedPost from "./_components/expanded-post";
import Header from "./_components/header";
import Post from "./_components/post";
import Search from "./_components/search-bar";

export default function Page({ searchParams }: { searchParams: { peek?: string } }) {
  const [peeking, setPeeking] = useQueryState("peek", { defaultValue: "" });

  const { data, isLoading } = useQuery(
    webClientORPC.feed.getFeed.queryOptions({
      input: {},
      retry: false,
    })
  );
  const renderPosts = data?.map((post) => <Post key={post._id} postData={post} onClickAction={setPeeking} />);

  useEffect(() => {
    if (peeking) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [peeking]);

  if (!data || isLoading) return <p>Loading...</p>; // TODO loading skeletons

  const expandedPost = () => {
    const selectedPost = data.find((p) => p._id === peeking);
    return selectedPost ? <ExpandedPost postData={selectedPost} onClose={() => setPeeking("")} /> : null;
  };

  // TODO: customize scroll bar
  return (
    <>
      {peeking && expandedPost()}
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
