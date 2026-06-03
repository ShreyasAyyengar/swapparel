import type { postSchema } from "@swapparel/contracts";
import { X } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";

export default function Comments({ post }: { post: z.infer<typeof postSchema> }) {
  // const comments = post.comments; // TODO
  const comments: string[] = [];

  const [replying, setReplying] = useState<boolean>(false);
  const [replyAuthor, setReplyAuthor] = useState<string>("");
  const [replyIndex, setReplyIndex] = useState<number>(-1);

  const doReply = (author: string, commentIndex: number) => {
    setReplying(true);
    setReplyIndex(commentIndex);
    setReplyAuthor(author);
  };

  const addReplyMutation = () => {
    console.log("addReplyMutation"); // TODO
  };

  const submitReply = (reply: string, commentIndex: number) => {
    console.log("submitReply", reply, commentIndex); // TODO
  };

  return (
    <>
      {/*{comments?.map((entry, index) => (*/}
      {/*  <div*/}
      {/*    key={index}*/}
      {/*    className={cn("m-1 mt-2 mb-2 rounded-md border-2 border-black/0 bg-black/40", replyIndex === index && "border-2 border-neutral-300")}*/}
      {/*  >*/}
      {/*    <Comment comment={entry.rootComment} index={index} onClick={(author) => doReply(author, index)} />*/}

      {/*    <div className="pl-7">*/}
      {/*      {entry.childReplies?.map((reply, indexReply) => (*/}
      {/*        <Comment key={indexReply} comment={reply} index={index} onClick={(author) => doReply(author, index)} />*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*))}*/}

      {replying && (
        <div className={"sticky bottom-0 w-full rounded-md bg-accent-200 px-2 py-1"}>
          <p>Reply to: {replyAuthor}</p>
          <form
            action={(e) => {
              const reply = e.get("reply-input") as string;
              submitReply(reply, replyIndex);
              setReplying(false);
            }}
          >
            <input
              name="reply-input"
              autoComplete="off"
              className="mt-2 w-full resize-none rounded-md border-2 border-accent px-3 py-2 align-top leading-relaxed transition-colors focus:border-secondary"
              placeholder="Type here..."
            />
          </form>
          <X
            className={"absolute top-1 right-1 cursor-pointer"}
            onClick={() => {
              setReplying(false);
              setReplyIndex(-1);
            }}
          />
        </div>
      )}
    </>
  );
}
