import type { internalPostSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import Image from "next/image";
import { memo } from "react";
import type z from "zod";
import PostTrigger from "./post-trigger";

function MasonryElement({ postData }: { postData: z.infer<typeof internalPostSchema> }) {
  return (
    <PostTrigger postId={postData._id}>
      <p className="font-bold">{postData.title}</p>
      <span title={postData.createdBy} className="w-full truncate text-foreground">
        {postData.createdBy}
      </span>
      <Image
        src={postData.images[0] ?? ""}
        width={200}
        height={200}
        alt="thumbnail"
        className="w-full rounded-md border-2 border-[#6F4D3880]"
        loading="eager"
        priority={false}
      />
      <div className="w-full pt-2">
        <p title={postData.size} className="w-full truncate text-left text-foreground">
          Size: <Badge className="bg-foreground font-bold text-background">{postData.size}</Badge>
        </p>
        <p title={postData.garmentType} className="w-full truncate text-left text-foreground">
          Garment Type: <Badge className="bg-foreground font-bold text-background">{postData.garmentType}</Badge>
        </p>
        <p title={postData.colour.join(", ")} className="w-full truncate text-left text-foreground">
          {/*Colors: {postData.colour.join(", ")}*/}
          Color:{" "}
          {postData.colour.map((color) => (
            <Badge className="mr-1 bg-foreground font-bold text-background" key={color}>
              {color}
            </Badge>
          ))}
        </p>
        <p title={postData.material.join(", ")} className="w-full truncate text-left text-foreground">
          {/*Materials: {postData.material}*/}
          Material:{" "}
          {postData.material.map((mats) => (
            <Badge className="mr-1 bg-foreground font-bold text-background" key={mats}>
              {mats}
            </Badge>
          ))}
        </p>
        {postData.price && (
          <p className="w-full truncate text-left text-foreground">
            Price: <Badge className="bg-foreground font-bold text-background">{postData.price}</Badge>
          </p>
        )}
      </div>
    </PostTrigger>
  );
}
export default memo(MasonryElement);
