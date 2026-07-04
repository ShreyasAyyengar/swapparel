"use client";

import type { postSchema } from "@swapparel/contracts";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { MessageCircle } from "lucide-react";
import { useEffect } from "react";
import type z from "zod";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";
import CommentItem from "./comment-item";

export default function CommentList({ postId }: { postId: z.infer<typeof postSchema.shape._id> }) {
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...webClientORPC.comments.getComments.infiniteOptions({
      input: (pageParam) => ({ postId, limit: 25, cursor: pageParam ?? undefined }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: undefined as string | undefined,
    }),
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <div className="mt-3 flex flex-col gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-12 w-5/6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-3 flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-muted p-3">
          <MessageCircle className="size-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">Failed to load comments.</p>
      </div>
    );
  }

  const comments = data?.pages.flatMap((p) => p.comments) ?? [];

  if (comments.length === 0) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          postId={postId}
        />
      ))}
      {isFetchingNextPage && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      )}
      <div ref={ref} />
    </div>
  );
}
