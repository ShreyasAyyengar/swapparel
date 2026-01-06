import type { internalPostSchema } from "@swapparel/contracts";
import { cn } from "@swapparel/shad-ui/lib/utils";
import type { z } from "zod";
import DisplayPostThumbnail from "./display-post-thumbnail";

export default function ChoosePostGrid({
  postsByUser,
  onBackgroundClick,
  handleTradeSelection,
}: {
  postsByUser: z.infer<typeof internalPostSchema>[] | undefined;
  onBackgroundClick?: () => void;
  handleTradeSelection: (post: z.infer<typeof internalPostSchema>) => void;
}) {
  const hasPosts = postsByUser && (postsByUser?.length ?? 0) > 0;

  // TODO fix resizing:
  return (
    <div
      className={cn(
        "@container mx-4 flex h-full items-center justify-center rounded-2xl border border-ring bg-popover [transition:border_0.3s]",
        !hasPosts && "cursor-pointer border-dashed hover:border-foreground"
      )}
      onClick={hasPosts ? undefined : onBackgroundClick}
      onKeyDown={hasPosts ? undefined : onBackgroundClick}
      role={hasPosts ? undefined : "button"}
      tabIndex={hasPosts ? undefined : 0}
    >
      {hasPosts ? (
        <div className="m-4 grid w-full @2xs:grid-cols-1 @lg:grid-cols-6 @md:grid-cols-5 @sm:grid-cols-3 @xs:grid-cols-2 place-items-center gap-x-8 gap-y-5 text-center">
          {postsByUser.map((postByUser) => (
            <DisplayPostThumbnail key={postByUser._id} post={postByUser} handleTradeSelection={handleTradeSelection} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <p className="p-5 text-foreground text-sm">Empty State</p>
        </div>
      )}
    </div>
  );
}
