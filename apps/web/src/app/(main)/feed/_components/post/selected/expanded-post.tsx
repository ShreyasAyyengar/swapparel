import type { postSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import type { z } from "zod";
import CommentInput from "./comment-input";
import Comments from "./comments";
import ExpandedPostTrigger from "./expanded-post-trigger";

export default function ExpandedPost({ post }: { post: z.infer<typeof postSchema> }) {
  const MAX_DESCRIPTION = 1000;
  const [_, setSelectedPost] = useQueryState("post", parseAsString);
  const router = useRouter();

  const sendToProfile = () => {
    onOpenChange(false);
    const email = post.createdBy;
    router.push(`/profile?profile=${encodeURIComponent(email)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{post.title}</DialogTitle>
        </DialogHeader>
        <ExpandedPostTrigger post={post} onProfileClick={sendToProfile} />
      </DialogContent>
    </Dialog>
  );
}
