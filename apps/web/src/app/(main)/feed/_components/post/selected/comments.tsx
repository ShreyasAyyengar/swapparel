import type {commentsSchema} from "@swapparel/contracts";
import {X} from "lucide-react";
import {useState} from "react";
import type {z} from "zod";
import Comment from "./comment";

export default function Comments({ comments }: { comments?: z.infer<typeof commentsSchema>[] }) {
  const [replying, setReplying] = useState<boolean>(false);
  const [replyAuthor, setReplyAuthor] = useState<string>("");

  const handleReply = (author: string) => {
    setReplying(true);
    setReplyAuthor(author);
    console.log("Replying:", author);
  };
  return (
    <>
      {comments?.map((entry, index) => (
        <div key={index} className="m-1 mt-2 mb-2 rounded-md bg-black/40">
          <Comment comment={entry.rootComment} index={index} onClick={handleReply} />

          <div className="pl-7">
            {entry.childReplies?.map((reply, indexReply) => (
              <Comment key={indexReply} comment={reply} index={indexReply} onClick={handleReply} />
            ))}
          </div>
        </div>
      ))}

      {replying && (
        <div className={"sticky bottom-0 w-full rounded-md bg-accent-200 px-2 py-1"}>
          <p>Reply to: {replyAuthor}</p>
          <textarea
            className="mt-2 min-h-[8rem] w-full resize-none rounded-md border-2 border-accent px-3 py-2 align-top leading-relaxed transition-colors focus:border-secondary"
            placeholder="Type here..."
          />
          <X className={"absolute top-1 right-1 cursor-pointer"} onClick={() => setReplying(false)} />
        </div>
      )}
    </>
  );
}
