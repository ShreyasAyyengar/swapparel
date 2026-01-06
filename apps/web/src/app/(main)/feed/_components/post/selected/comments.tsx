import type { commentsSchema } from "@swapparel/contracts";
import type { z } from "zod";
import Comment from "./root-comment";

export default function Comments({ comments }: { comments?: z.infer<typeof commentsSchema>[] }) {
  return comments?.map((entry, index) => (
    <div key={index} className="m-1 mt-2 mb-2 rounded-md bg-black/40">
      <Comment comment={entry.rootComment} />

      <div className="pl-7">
        {entry.childReplies?.map((reply, indexReply) => (
          <Comment key={indexReply} comment={reply} />
        ))}
      </div>
    </div>
  ));
}
