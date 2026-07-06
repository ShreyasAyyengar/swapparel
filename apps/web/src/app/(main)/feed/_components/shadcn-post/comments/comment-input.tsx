"use client";

import type { postSchema } from "@swapparel/contracts";
import { Avatar, AvatarFallback, AvatarImage } from "@swapparel/shad-ui/components/avatar";
import { Button } from "@swapparel/shad-ui/components/button";
import { Input } from "@swapparel/shad-ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { authClient } from "../../../../../../lib/auth-client";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";
import { useCommentContext } from "./comment-context";

export default function CommentInput({
  parentCommentId,
  autoFocus,
  onSuccess,
}: {
  parentCommentId?: z.infer<typeof postSchema.shape._id>;
  autoFocus?: boolean;
  onSuccess?: () => void;
}) {
  const { post } = useCommentContext();
  const { data } = authClient.useSession();
  const [text, setText] = useState("");
  const queryClient = useQueryClient();

  // TODO: after adding comment, send a notification to post author and parent comment author (if applicable) that a new comment has been added
  const addCommentMutation = useMutation(
    webClientORPC.comments.addComment.mutationOptions({
      onSuccess: () => {
        setText("");
        queryClient.invalidateQueries({ queryKey: [["comments", "getComments"]] });
        queryClient.invalidateQueries({ queryKey: [["comments", "getReplies"]] });
        onSuccess?.();
      },
    })
  );

  const initials =
    data?.user.name
      ?.split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || addCommentMutation.isPending) return;
    addCommentMutation.mutate({ parentPostId: post._id, content: text.trim(), parentCommentId });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Avatar className="size-8">
        <AvatarImage src={data?.user.image ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <Input placeholder="Add a comment..." value={text} onChange={(e) => setText(e.target.value)} autoFocus={autoFocus} />
      <Button
        type="submit"
        size="icon"
        className="size-8 shrink-0 cursor-pointer rounded-lg"
        aria-label="Send comment"
        disabled={!text.trim() || addCommentMutation.isPending}
      >
        <MessageSquarePlus className="size-4" />
      </Button>
    </form>
  );
}
