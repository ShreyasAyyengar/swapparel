import type { internalPostSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import Image from "next/image";
import type z from "zod";
import PostTrigger from "./post-trigger";

export default function Post({ postData }: { postData: z.infer<typeof internalPostSchema> }) {
  return (
    <PostTrigger postId={postData._id}>
      <p className="font-bold">{postData.title}</p>
      <span title={postData.createdBy} className="w-[20ch] truncate text-foreground">
        {postData.createdBy}
      </span>
      <Image src={postData.images[0] ?? ""} alt="thumbnail" width={200} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
      <div className="flex flex-col">
        <p title={postData.size} className="w-[20ch] truncate text-left text-foreground">
          Size: <Badge className="bg-foreground font-bold text-background">{postData.size}</Badge>
        </p>
        <p title={postData.colour.join(", ")} className="w-[20ch] truncate text-left text-foreground">
          {/*Colors: {postData.colour.join(", ")}*/}
          Color:{" "}
          {postData.colour.map((color) => (
            <Badge className="mr-1 bg-foreground font-bold text-background" key={color}>
              {color}
            </Badge>
          ))}
        </p>
        <p title={postData.material.join(", ")} className="w-[20ch] truncate text-left text-foreground">
          {/*Materials: {postData.material}*/}
          Material:{" "}
          {postData.material.map((mats) => (
            <Badge className="mr-1 bg-foreground font-bold text-background" key={mats}>
              {mats}
            </Badge>
          ))}
        </p>
      </div>
    </PostTrigger>
  );
}
