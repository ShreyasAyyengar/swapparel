import { Reply } from "lucide-react";

export default function RootQuestion({ question }: { question: string }) {
  return (
    <p className="cursor-pointer rounded-md p-1 font-bold hover:bg-accent-200 hover:backdrop-blur-md">
      Q:
      <span className="font-normal"> {question}</span>
      <span className="flex items-center font-normal text-accent-400 text-xs">
        reply <Reply className={"ml-1 flex h-5 w-5 justify-end"} />
      </span>
    </p>
  );
}
