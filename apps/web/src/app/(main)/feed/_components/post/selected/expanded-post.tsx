import type { internalPostSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import type { z } from "zod";
import ExpandedPostTrigger from "./expanded-post-trigger";
// TODO: add Min width for description
export default function ExpandedPost({ post }: { post: z.infer<typeof internalPostSchema> }) {
  const MAX_DESCRIPTION = 1000;

  const entries = post.qaEntries.map((entry, index) => (
    <div key={index}>
      <p className="mb-2 font-bold">
        Q:
        <span className="font-normal"> {entry.question}</span>
      </p>
      <div className="pl-7">
        <p className="mb-2 font-bold">
          A:
          <span className="font-normal"> {entry.answer}</span>
        </p>
        {entry.followUps?.map((followUp, indexFollowUp) => (
          <div key={indexFollowUp}>
            <p className="mb-2 font-bold">
              Q:
              <span className="font-normal"> {followUp.question}</span>
            </p>
            <p className="mb-2 font-bold">
              A:
              <span className="font-normal"> {followUp.answer}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  ));

  return (
    <ExpandedPostTrigger post={post}>
      {/*<div className="ml-8 flex w-1/2 flex-col overflow-auto border-2 border-foreground p-2">*/}
      <p title="username" className="font-bold">
        {post.createdBy}
      </p>
      <hr className="my-2 border-foreground border-t-2" />

      <p className="font-bold">Description:</p>
      <p className="wrap-break-word max-w-[45ch]">
        {`${post.description.slice(0, MAX_DESCRIPTION)}${post.description.length > MAX_DESCRIPTION ? "..." : ""}`}
      </p>
      <hr className="my-2 border-foreground border-t-2" />
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
      <p className="font-bold">Q&A:</p>
      {post.qaEntries.length < 1 ? "No Q&A Entries" : entries}
      {/*</div>*/}
    </ExpandedPostTrigger>
  );
}
