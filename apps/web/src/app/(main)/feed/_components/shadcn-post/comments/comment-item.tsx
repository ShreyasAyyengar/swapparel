"use client";

import type { commentSchema } from "@swapparel/contracts";
import { Avatar, AvatarFallback, AvatarImage } from "@swapparel/shad-ui/components/avatar";
import { Button } from "@swapparel/shad-ui/components/button";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Trash2Icon } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { authClient } from "../../../../../../lib/auth-client";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";
import CommentDeleteDialog from "./comment-delete-dialog";
import CommentInput from "./comment-input";

type Comment = z.infer<typeof commentSchema>;

function relativeTime(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommentItem({
  comment,
  postId,
  isReply = false,
}: {
  comment: Comment;
  postId: string;
  isReply?: boolean;
}) {
  const initials = comment.authorSnapshot.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [isReplyInputActive, setIsReplyInputActive] = useState(false);

  const { data: authData } = authClient.useSession();
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation(
    webClientORPC.comments.deleteComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["comments", "getComments"]] });
        queryClient.invalidateQueries({ queryKey: [["comments", "getReplies"]] });
      },
    })
  );

  const repliesQuery = useInfiniteQuery({
    ...webClientORPC.comments.getReplies.infiniteOptions({
      input: (pageParam) => ({ commentId: comment._id, limit: 5, cursor: pageParam ?? undefined }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: undefined as string | undefined,
    }),
    enabled: isRepliesExpanded,
  });

  const replies = repliesQuery.data?.pages.flatMap((p) => p.replies) ?? [];

  return (
    <div className="flex gap-2">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={comment.authorSnapshot.image} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-sm">{comment.authorSnapshot.name}</p>
            <p className="text-sm">{comment.content}</p>
          </div>

          {comment.authorId === authData?.user.id && (
            <CommentDeleteDialog onConfirm={() => deleteCommentMutation.mutate({ id: comment._id })}>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="size-7 shrink-0 cursor-pointer self-center"
                disabled={deleteCommentMutation.isPending}
              >
                {deleteCommentMutation.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2Icon className="size-3.5" />}
              </Button>
            </CommentDeleteDialog>
          )}
        </div>
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          <span>{relativeTime(comment.createdAt)}</span>
          {!isReply && (
            <Button type="button" variant="link" onClick={() => setIsReplyInputActive((v) => !v)} className="h-auto cursor-pointer p-0 font-medium">
              Reply
            </Button>
          )}
          {comment.replyCount > 0 && !isReply && (
            <Button type="button" variant="link" onClick={() => setIsRepliesExpanded((v) => !v)} className="h-auto cursor-pointer p-0 font-medium">
              {isRepliesExpanded ? "Hide replies" : `Show ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
            </Button>
          )}
        </div>
        {isReplyInputActive && !isReply && (
          <div className="mt-2">
            <CommentInput
              postId={postId}
              parentCommentId={comment._id}
              autoFocus
              onSuccess={() => {
                if (!isRepliesExpanded) setIsRepliesExpanded(true);
                setIsReplyInputActive(false);
              }}
            />
          </div>
        )}
        {isRepliesExpanded && (
          <div className="mt-2 ml-8 flex flex-col gap-3 border-l-2 pl-4">
            {repliesQuery.isPending && (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            )}
            {replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                postId={postId}
                isReply
              />
            ))}
            {repliesQuery.hasNextPage && (
              <Button
                type="button"
                variant="link"
                className="h-auto cursor-pointer p-0 font-medium text-muted-foreground text-xs"
                onClick={() => repliesQuery.fetchNextPage()}
                disabled={repliesQuery.isFetchingNextPage}
              >
                {repliesQuery.isFetchingNextPage ? "Loading..." : "Load more replies..."}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
