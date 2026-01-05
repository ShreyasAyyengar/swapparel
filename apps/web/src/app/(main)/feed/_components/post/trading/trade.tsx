import type { internalPostSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { z } from "zod";
import { authClient } from "../../../../../../lib/auth-client";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";
import ChoosePostGrid from "./choose-post-grid";
import TradingImage from "./trade-image";

export default function TradingBox({ post, onClick }: { post: z.infer<typeof internalPostSchema>; onClick: () => void }) {
  const { data } = authClient.useSession();
  const [selectedPosts, setSelectedPosts] = useState<z.infer<typeof internalPostSchema>[]>([]);

  const handleTradeSelection = (newPost: z.infer<typeof internalPostSchema>) => {
    setSelectedPosts((prev) => {
      if (prev.some((p) => p._id === newPost._id)) return prev.filter((p) => p._id !== newPost._id);
      return [...prev, newPost];
    });
  };

  const handleSubmit = () => {
    // TODO: submit selectedPosts to API
  };

  const { data: postsByUser } = useQuery(
    webClientORPC.posts.getPosts.queryOptions({
      // biome-ignore lint/style/noNonNullAssertion: TODO the user must be logged in to see this page
      input: { createdBy: data!.user.email },
    })
  );

  return (
    <div className="fixed inset-0 z-2 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onMouseDown={onClick} />
      <div className="relative max-h-[90vh] w-1/2 items-center overflow-y-auto rounded-2xl border border-secondary bg-accent p-10 pt-5 text-foreground">
        <p className={"mb-5 flex justify-center font-light text-2xl"}>TRADING POST</p>
        <div className={"grid w-full grid-cols-1 items-center gap-5 xl:grid-cols-2"}>
          {/* TRADING IMAGE */}
          <TradingImage images={post.images} />

          {/* YOUR SECTION */}
          <div className="flex min-h-0 flex-col rounded-md border-2 border-secondary">
            <p className="my-3 flex justify-center font-bold">Choose your post</p>

            <div className="min-h-0 flex-1">
              <ChoosePostGrid
                postsByUser={postsByUser ?? undefined}
                onBackgroundClick={onClick}
                handleTradeSelection={handleTradeSelection}
                // optionally: selectedPostId, onSelect, etc.
              />
            </div>
            <p className="mt-2 mr-2 flex justify-end">{selectedPosts.length} selected</p>
          </div>
        </div>
        <Button
          className={cn(
            "mt-5 flex w-full cursor-pointer items-center justify-center",
            selectedPosts.length > 0 && "bg-foreground text-background hover:bg-foreground-500",
            !selectedPosts.length && "cursor-not-allowed"
          )}
          disabled={selectedPosts.length === 0}
        >
          SUBMIT
        </Button>
      </div>
    </div>
  );
}
