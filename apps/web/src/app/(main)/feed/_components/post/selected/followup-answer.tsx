import {Reply} from "lucide-react";

export default function FollowUpAnswer({ answer }: { answer: string }) {
  return (
    <p className="cursor-pointer rounded-md p-1 font-bold hover:bg-accent-200 hover:backdrop-blur-md">
      A:
      <span className="font-normal"> {answer}</span>
      <p className="ml-1 flex items-center font-normal text-accent-400 text-xs">
        reply <Reply className={"ml-1 flex h-5 w-5 justify-end"} />
      </p>
    </p>
  );
}
