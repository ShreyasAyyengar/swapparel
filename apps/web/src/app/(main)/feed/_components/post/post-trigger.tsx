"use client";

import {cn} from "@swapparel/shad-ui/lib/utils";
import {parseAsString, useQueryState} from "nuqs";

export default function PostTrigger({
  postId,
  className = "bg-accent text-foreground border border-secondary w-60",
  children,
}: {
  postId: string;
  className: string;
  children: React.ReactNode;
}) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString.withOptions({ shallow: false }));

  const openPost = () => setSelectedPost(postId);
  return (
    <button type="button" className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-md p-4", className)} onMouseDown={openPost}>
      {children}
    </button>
  );
}
