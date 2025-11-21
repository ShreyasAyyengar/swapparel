import type { internalPostSchema } from "@swapparel/contracts";
import Image from "next/image";
import type z from "zod";
import PostTrigger from "./post-trigger";

export default function Post({ postData }: { postData: z.infer<typeof internalPostSchema> }) {
  const MAX_STRING_LEN = 10;

  return (
    <PostTrigger postId={postData._id}>
      <Image src={postData.images[0] ?? ""} alt="thumbnail" width={200} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
      <div className="flex w-full flex-col gap-2">
        <p>{postData.title}</p>
        <div className="flex w-full flex-col justify-between text-sm">
          {/* Row 1 */}
          <div className="flex w-full justify-between text-sm">
            <span title={postData.size} className="w-[20ch] truncate text-foreground">
              {postData.size.length > MAX_STRING_LEN ? `${postData.size.slice(0, MAX_STRING_LEN)}…` : postData.size}
            </span>
            <span className="mx-2">|</span> {/* separator */}
            <span title={postData.colour.join(", ")} className="w-[20ch] truncate text-foreground">
              {postData.colour.join(", ").length > MAX_STRING_LEN
                ? `${postData.colour.join(", ").slice(0, MAX_STRING_LEN)}…`
                : postData.colour.join(", ")}
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex w-full justify-between text-sm">
            <span title={postData.material.join(", ")} className="w-[20ch] truncate text-foreground">
              {postData.material.join(", ").length > MAX_STRING_LEN
                ? `${postData.material.join(", ").slice(0, MAX_STRING_LEN)}…`
                : postData.material}
            </span>
            <span className="mx-2">|</span> {/* separator */}
            <span title={postData.createdBy} className="w-[20ch] truncate text-foreground">
              {postData.createdBy.length > MAX_STRING_LEN ? `${postData.createdBy.slice(0, MAX_STRING_LEN)}…` : postData.createdBy}
            </span>
          </div>
        </div>
      </div>
    </PostTrigger>
  );
}
