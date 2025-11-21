"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import type { z } from "zod";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";
import SelectedPost from "./selected-post";

type Post = z.infer<typeof internalPostSchema>;

export function SelectedPostLayer({ initialSelectedPost, loadedFeedPosts }: { initialSelectedPost: string | null; loadedFeedPosts: Post[] }) {
  const [selectedPost, setSelectedPost] = useQueryState("post", parseAsString.withDefault(initialSelectedPost ?? ""));

  const postFromFeed = useMemo(() => loadedFeedPosts.find((p) => p._id === selectedPost), [loadedFeedPosts, selectedPost]);

  const {
    data: fetchedPost,
    isError: fetchedError,
    isLoading,
  } = useQuery(
    webClientORPC.posts.getPost.queryOptions({
      input: { _id: selectedPost },
      enabled: !!selectedPost && !postFromFeed,
    })
  );

  const currentSelectedPost = postFromFeed ?? fetchedPost ?? undefined;

  useEffect(() => {
    if (fetchedError) setSelectedPost(null);
  }, [fetchedError, setSelectedPost]);

  if (!(selectedPost && currentSelectedPost)) return null;

  if (isLoading) return <div className="flex items-center justify-center">Loading...</div>;
  return <SelectedPost post={currentSelectedPost} />;
}
