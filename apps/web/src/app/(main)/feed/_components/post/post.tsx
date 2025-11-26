import type { internalPostSchema } from "@swapparel/contracts";
import Image from "next/image";
import type z from "zod";
import PostTrigger from "./post-trigger";

export default function Post({ postData }: { postData: z.infer<typeof internalPostSchema> }) {
  const MAX_STRING_LEN = 10;

  return (
    <PostTrigger postId={postData._id}>
      <p className="font-bold">{postData.title}</p>
      <span title={postData.createdBy} className="w-[20ch] truncate text-foreground">
        {postData.createdBy}
      </span>
      <Image src={postData.images[0] ?? ""} alt="thumbnail" width={200} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
      <div className="flex flex-col border border-lime-300">
        {/* Row 1 */}
        <p title={postData.size} className="w-[20ch] truncate text-foreground">
          {postData.size}
        </p>
        <p title={postData.colour.join(", ")} className="w-[20ch] justify-start truncate text-foreground">
          {postData.colour.join(", ")}
        </p>
        {/* Row 2 */}
        <p title={postData.material.join(", ")} className="w-[20ch] truncate text-foreground">
          {postData.material}
        </p>
      </div>
    </PostTrigger>
  );
}
