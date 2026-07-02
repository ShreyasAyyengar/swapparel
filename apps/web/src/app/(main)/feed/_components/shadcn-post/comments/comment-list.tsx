import type { postSchema } from "@swapparel/contracts";
import type z from "zod";

export default function CommentList({ postId }: { postId: z.infer<typeof postSchema.shape._id> }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">No comments yet.</p>
    </div>
  );
}
