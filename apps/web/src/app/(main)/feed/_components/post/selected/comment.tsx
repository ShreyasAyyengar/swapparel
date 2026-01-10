import type {singleCommentSchema} from "@swapparel/contracts";
import {Badge} from "@swapparel/shad-ui/components/badge";
import {Reply} from "lucide-react";
import {useRouter} from "next/navigation";
import {parseAsString, useQueryState} from "nuqs";
import type {z} from "zod";

type SingleCommentProps = {
  comment: z.infer<typeof singleCommentSchema>;
  index: number;
  onClick: (author: string, index: number) => void;
};

export default function Comment({ comment, index, onClick }: SingleCommentProps) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString);
  const router = useRouter();

  const sendToProfile = async () => {
    await setSelectedPost(null);
    const email = comment.author;
    router.push(`/profile?profile=${encodeURIComponent(email)}`);
  };
  return (
    <div className="rounded-md p-1">
      <Badge className="mr-2 cursor-pointer bg-black/60 hover:underline" onClick={sendToProfile}>
        {comment.author}
      </Badge>
      <br />
      <div
        className={"cursor-pointer rounded-md p-1 hover:bg-accent-200 hover:backdrop-blur-md"}
        onClick={() => {
          onClick(comment.author, index);
        }}
        onKeyDown={() => onClick(comment.author, index)}
      >
        <span className="font-normal"> {comment.comment}</span>
        <span className="flex items-center font-normal text-accent-400 text-xs">
          reply <Reply className={"ml-1 flex h-5 w-5 justify-end"} />
        </span>
      </div>
    </div>
  );
}
