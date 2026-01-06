import type { singleCommentSchema } from "@swapparel/contracts";
import { Reply } from "lucide-react";
import type { z } from "zod";

export default function Comment({ comment }: { comment: z.infer<typeof singleCommentSchema> }) {
  return (
    <p className="rounded-md p-1">
      <span className="">{comment.author}</span>
      <br />
      <div className={"ml-5 cursor-pointer hover:bg-accent-200 hover:backdrop-blur-md"}>
        <span className="font-normal"> {comment.comment}</span>
        <span className="flex items-center font-normal text-accent-400 text-xs">
          reply <Reply className={"ml-1 flex h-5 w-5 justify-end"} />
        </span>
      </div>
    </p>
  );
}
