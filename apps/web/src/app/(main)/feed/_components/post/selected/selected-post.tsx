import type { internalPostSchema } from "@swapparel/contracts";
import type { z } from "zod";
import SelectedPostTrigger from "./selected-post-trigger";

export default function SelectedPost({ post }: { post: z.infer<typeof internalPostSchema> }) {
  const MAX_DESCRIPTION = 1000;

  const entries = post.qaEntries.map((entry, index) => (
    <>
      <p key={index} className="mb-2 font-bold">
        Q:
        <span className="font-normal"> {entry.question}</span>
      </p>
      <div className="pl-7">
        <p className="mb-2 font-bold">
          A:
          <span className="font-normal"> {entry.answer}</span>
        </p>
        {entry.followUps?.map((followUp, indexFollowUp) => (
          <>
            <p key={indexFollowUp} className="mb-2 font-bold">
              Q:
              <span className="font-normal"> {followUp.question}</span>
            </p>
            <p className="mb-2 font-bold">
              A:
              <span className="font-normal"> {followUp.answer}</span>
            </p>
          </>
        ))}
      </div>
    </>
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <SelectedPostTrigger post={post}>
        <div className="ml-8 flex h-130 w-90 flex-col overflow-auto border-2 border-primary p-2">
          <p title="username">{post.createdBy}</p>
          <hr className="my-2 border-foreground border-t-2" />

          <div className="mt-2">
            <p className="font-bold">Description:</p>
            <p className="wrap-break-word max-w-[45ch]">
              {`${post.description.slice(0, MAX_DESCRIPTION)}${post.description.length > MAX_DESCRIPTION ? "..." : ""}`}
            </p>
            <hr className="my-2 border-foreground border-t-2" />
            <p className="font-bold">
              Color: <span className="font-normal">{post.colour.join(", ")}</span>
            </p>
            <p className="font-bold">
              Size: <span className="font-normal">{post.size}</span>
            </p>
            <p className="font-bold">
              Material: <span className="font-normal">{post.material.join(", ")}</span>
            </p>
            <p className="font-bold">
              Hashtags: <span className="font-normal">{post.hashtags.join(", ")}</span>
            </p>
            <hr className="my-2 border-foreground border-t-2" />
            <p className="font-bold">Q&A:</p>
            {post.qaEntries.length < 1 ? "No Q&A Entries" : entries}
          </div>
        </div>
      </SelectedPostTrigger>
    </div>
  );
}
