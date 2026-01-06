import type { singleCommentSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { Reply } from "lucide-react";
import type { z } from "zod";

export default function Comment({ comment }: { comment: z.infer<typeof singleCommentSchema> }) {
  return (
    <p className="rounded-md p-1">
      <Badge className="mr-2 bg-black/60">{comment.author}</Badge>
      <br />
      <div className={"cursor-pointer rounded-md p-1 hover:bg-accent-200 hover:backdrop-blur-md"}>
        <span className="font-normal"> {comment.comment}</span>
        <span className="flex items-center font-normal text-accent-400 text-xs">
          reply <Reply className={"ml-1 flex h-5 w-5 justify-end"} />
        </span>
      </div>
    </p>
  );
}
