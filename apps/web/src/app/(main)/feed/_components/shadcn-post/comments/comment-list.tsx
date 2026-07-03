"use client";

import type { commentSchema, postSchema } from "@swapparel/contracts";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";
import CommentItem from "./comment-item";

type Comment = z.infer<typeof commentSchema>;

export default function CommentList({ postId }: { postId: z.infer<typeof postSchema.shape._id> }) {
  const { data, isPending, isError } = useQuery(
    webClientORPC.comments.getComments.queryOptions({
      input: { postId, limit: 25 },
    })
  );

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [activeReplyInput, setActiveReplyInput] = useState<string | null>(null);

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

  const allComments = data?.comments ?? [];
  const topLevelComments = allComments.filter((c) => !c.parentCommentId);
  const replyMap = new Map<string, Comment[]>();
  for (const c of allComments) {
    if (c.parentCommentId) {
      const existing = replyMap.get(c.parentCommentId) ?? [];
      existing.push(c);
      replyMap.set(c.parentCommentId, existing);
    }
  }

  if (topLevelComments.length === 0) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-4">
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          replies={replyMap.get(comment._id) ?? []}
          isRepliesExpanded={expandedReplies.has(comment._id)}
          onToggleReplies={() =>
            setExpandedReplies((prev) => {
              const next = new Set(prev);
              if (next.has(comment._id)) next.delete(comment._id);
              else next.add(comment._id);
              return next;
            })
          }
          isReplyInputActive={activeReplyInput === comment._id}
          onToggleReplyInput={() => setActiveReplyInput((prev) => (prev === comment._id ? null : comment._id))}
          postId={postId}
        />
      ))}
    </div>
  );
}
