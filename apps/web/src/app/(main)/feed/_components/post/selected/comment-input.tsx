import type { postSchema } from "@swapparel/contracts";
import { useState } from "react";
import type { z } from "zod";

export default function CommentInput({ post, sentence }: { post: z.infer<typeof postSchema>; sentence: string }) {
  const [writingComment, setWritingComment] = useState(false);

  const addCommentMutation = () => {
    console.log("addCommentMutation"); // TODO
  };

  const submitComment = (comment: string) => {
    console.log("submitComment", comment); // TODO
  };

  return (
    <form
      action={(e) => {
        const comment = e.get("comment-input") as string;
        if (!comment) return;
        submitComment(comment);
      }}
    >
      <p
        className="cursor-pointer text-xs underline"
        onClick={() => setWritingComment(true)}
        onKeyDown={(e) => e.key === "Enter" && setWritingComment(true)}
      >
        {sentence}
      </p>
      {writingComment && (
        <input
          autoComplete="off"
          name="comment-input"
          className="mt-2 w-full resize-none rounded-md border-2 border-secondary px-3 py-2 align-top leading-relaxed transition-colors focus:border-secondary"
          placeholder="Is this washer safe?"
        />
      )}
    </form>
  );
}
