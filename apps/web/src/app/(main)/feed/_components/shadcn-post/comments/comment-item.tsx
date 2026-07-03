"use client";

import type { commentSchema } from "@swapparel/contracts";
import { Avatar, AvatarFallback, AvatarImage } from "@swapparel/shad-ui/components/avatar";
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
            <button type="button" className="cursor-pointer font-medium hover:underline" onClick={onToggleReplyInput}>
              Reply
            </button>
          )}
          {replies.length > 0 && !isReply && (
            <button type="button" className="cursor-pointer font-medium hover:underline" onClick={onToggleReplies}>
              {isRepliesExpanded ? "Hide replies" : `Show ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>
        {isReplyInputActive && !isReply && (
          <div className="mt-2">
            <CommentInput postId={postId} parentCommentId={comment._id} autoFocus />
          </div>
        )}
        {isRepliesExpanded && replies.length > 0 && (
          <div className="mt-2 ml-8 flex flex-col gap-3 border-l-2 pl-4">
            {replies.map((reply) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
