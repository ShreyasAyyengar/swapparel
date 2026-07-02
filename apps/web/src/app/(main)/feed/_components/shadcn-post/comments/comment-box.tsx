import type z from "zod";
import type { postSchema } from "../../../../../../../../../packages/contracts/src/contracts/http/post/post-schemas";
import CommentInput from "./comment-input";
import CommentList from "./comment-list";

export default function CommentBox({ postId }: { postId: z.infer<typeof postSchema.shape._id> }) {
  return (
    <>
      <CommentInput postId={postId} />
      <CommentList postId={postId} />
    </>
  );
}
