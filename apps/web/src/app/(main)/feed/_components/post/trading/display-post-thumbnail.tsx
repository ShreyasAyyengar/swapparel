import type { internalPostSchema } from "@swapparel/contracts";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { z } from "zod";

export default function DisplayPostThumbnail({
  post,
  handleTradeSelection,
}: {
  post: z.infer<typeof internalPostSchema>;
  handleTradeSelection: (post: z.infer<typeof internalPostSchema>) => void;
}) {
  const [selected, setSelected] = useState(false);

  const onClick = () => {
    setSelected((prev) => !prev);
    handleTradeSelection(post);
  };

  return (
    <div
      className={cn(
        "relative flex aspect-square w-20 cursor-pointer items-center justify-center rounded-2xl text-sm transition-all duration-50",
        selected && "border-3 border-success"
      )}
      onClick={onClick}
      onKeyDown={onClick}
    >
      <div className={cn("group relative h-full w-full rounded-2xl", !selected && "border border-foreground")}>
        {/** biome-ignore lint/style/noNonNullAssertion: every post has at least one image */}
        <Image src={post.images[0]!} alt={post.title} fill className="rounded-2xl object-cover" />
        {selected && (
          <Check size={50} className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 rounded-full text-success transition-all" />
        )}
      </div>
    </div>
  );
}
