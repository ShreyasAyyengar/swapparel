"use client";

import type { commentSchema } from "@swapparel/contracts";
import { Avatar, AvatarFallback, AvatarImage } from "@swapparel/shad-ui/components/avatar";
import { Button } from "@swapparel/shad-ui/components/button";
import { useEffect, useState } from "react";
import type z from "zod";
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
  replies,
  isRepliesExpanded,
  onToggleReplies,
  isReplyInputActive,
  onToggleReplyInput,
  postId,
  isReply = false,
}: {
  comment: Comment;
  replies: Comment[];
  isRepliesExpanded: boolean;
  onToggleReplies: () => void;
  isReplyInputActive: boolean;
  onToggleReplyInput: () => void;
  postId: string;
  isReply?: boolean;
}) {
  const initials = comment.authorSnapshot.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [visibleReplyCount, setVisibleReplyCount] = useState(5);

  useEffect(() => {
    if (!isRepliesExpanded) {
      setVisibleReplyCount(5);
    }
  }, [isRepliesExpanded]);

  return (
    <div className="flex gap-2">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={comment.authorSnapshot.image} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-semibold text-sm">{comment.authorSnapshot.name}</p>
        <p className="text-sm">{comment.content}</p>
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          <span>{relativeTime(comment.createdAt)}</span>
          {!isReply && (
            <Button type="button" variant="link" onClick={onToggleReplyInput} className="h-auto cursor-pointer p-0 font-medium">
              Reply
            </Button>
          )}
          {replies.length > 0 && !isReply && (
            <Button type="button" variant="link" onClick={onToggleReplies} className="h-auto cursor-pointer p-0 font-medium">
              {isRepliesExpanded ? "Hide replies" : `Show ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
            </Button>
          )}
        </div>
        {isReplyInputActive && !isReply && (
          <div className="mt-2">
            <CommentInput postId={postId} parentCommentId={comment._id} autoFocus />
          </div>
        )}
        {isRepliesExpanded && replies.length > 0 && (
          <div className="mt-2 ml-8 flex flex-col gap-3 border-l-2 pl-4">
            {replies.slice(0, visibleReplyCount).map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                replies={[]}
                isRepliesExpanded={false}
                onToggleReplies={() => {}}
                isReplyInputActive={false}
                onToggleReplyInput={() => {}}
                postId={postId}
                isReply
              />
            ))}
            {replies.length > visibleReplyCount && (
              <Button
                type="button"
                variant="link"
                className="h-auto cursor-pointer p-0 font-medium text-muted-foreground text-xs"
                onClick={() => setVisibleReplyCount((prev) => prev + 5)}
              >
                Load more replies...
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
