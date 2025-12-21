"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import type { z } from "zod";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";
import ExpandedPost from "./expanded-post";

export function ExpandedPostLayer({ loadedFeedPosts }: { loadedFeedPosts: z.infer<typeof internalPostSchema>[] }) {
  const [selectedPost, setSelectedPost] = useQueryState("post", parseAsString);

  const tryFromFeed = useMemo(() => loadedFeedPosts.find((p) => p._id === selectedPost), [loadedFeedPosts, selectedPost]);

  const {
    data: fetchedPost,
    isError: fetchedError,
    isLoading,
  } = useQuery(
    webClientORPC.posts.getPost.queryOptions({
      input: { _id: selectedPost as string }, // Note: this will always be a defined string, see next line.
      enabled: !!selectedPost && !tryFromFeed,
    })
  );

  const currentSelectedPost = tryFromFeed ?? fetchedPost ?? undefined;

  useEffect(() => {
    if (fetchedError) setSelectedPost(null);
  }, [fetchedError, setSelectedPost]);

  if (!(selectedPost && currentSelectedPost)) return null;

  if (isLoading) return <div className="flex items-center justify-center">Loading...</div>;
  return <ExpandedPost post={currentSelectedPost} />;
}
