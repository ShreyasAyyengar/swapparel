import type {internalPostSchema} from "@swapparel/contracts";
import {Badge} from "@swapparel/shad-ui/components/badge";
import type {z} from "zod";
import CommentInput from "./comment-input";
import Comments from "./comments";
import ExpandedPostTrigger from "./expanded-post-trigger";

export default function ExpandedPost({ post }: { post: z.infer<typeof internalPostSchema> }) {
  const MAX_DESCRIPTION = 1000;

  return (
    <ExpandedPostTrigger post={post}>
      <p title="username" className="font-bold">
        {post.createdBy}
      </p>
      <hr className="my-2 border-foreground border-t-2" />

      <p className="font-bold">Description:</p>
      <p className="wrap-break-word max-w-[45ch]">
        {`${post.description.slice(0, MAX_DESCRIPTION)}${post.description.length > MAX_DESCRIPTION ? "..." : ""}`}
      </p>
      <hr className="my-2 border-foreground border-t-2" />

      {post.price && (
        <p>
          Price: <Badge className="mr-1 bg-foreground font-bold text-background">{post.price}</Badge>
        </p>
      )}

      <p>
        Garment Type: <Badge className="mr-1 bg-foreground font-bold text-background">{post.garmentType}</Badge>
      </p>
      <p>
        Color:{" "}
        {post.colour.map((color) => (
          <Badge className="mr-1 bg-foreground font-bold text-background" key={color}>
            {color}
          </Badge>
        ))}
      </p>
      <p>
        Size: <Badge className="bg-foreground font-bold text-background">{post.size}</Badge>
      </p>
      <p>
        Material:{" "}
        {post.material.map((mats) => (
          <Badge className="mr-1 bg-foreground font-bold text-background" key={mats}>
            {mats}
          </Badge>
        ))}
      </p>
      <p>
        {/*Hashtags: <span className="font-normal">{post.hashtags.join(", ")}</span>*/}
        Hashtags:{" "}
        {post.hashtags.map((hashtag) => (
          <Badge className="mr-1 bg-foreground font-bold text-background" key={hashtag}>
            {hashtag}
          </Badge>
        ))}
      </p>
      <hr className="my-2 border-foreground border-t-2" />
      <p className="font-bold">Comments:</p>
      {post.comments.length > 0 && <CommentInput sentence={"Add a new comment!"} post={post} />}
      {post.comments.length < 1 ? <CommentInput sentence={"Be the first to comment!"} post={post} /> : <Comments post={post} />}
    </ExpandedPostTrigger>
  );
}
