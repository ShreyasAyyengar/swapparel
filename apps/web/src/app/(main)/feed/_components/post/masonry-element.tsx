import { memo } from "react";
import PostDialog from "../shadcn-post/post-dialog";
import type { postSchema } from "@swapparel/contracts";
import type z from "zod";

function MasonryElement({ className, postData }: { className: string; postData: z.infer<typeof postSchema> }) {
  return <PostDialog postData={postData} className={className} />;
}
export default memo(MasonryElement);
