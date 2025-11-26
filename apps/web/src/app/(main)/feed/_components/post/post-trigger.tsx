"use client";

import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs/server";

export default function PostTrigger({ postId, children }: { postId: string; children: React.ReactNode }) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString.withOptions({ shallow: false }));

  const openPost = () => setSelectedPost(postId);
  return (
    <button
      type="button"
      className="m-4 flex aspect-square w-60 cursor-pointer flex-col items-center gap-4 rounded-md border border-secondary bg-accent p-4 pt-6 text-foreground"
      onMouseDown={openPost}
    >
      {children}
    </button>
  );
}
