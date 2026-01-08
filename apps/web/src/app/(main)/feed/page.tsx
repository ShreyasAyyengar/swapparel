import { safe } from "@orpc/client";
import { webServerORPC } from "../../../lib/orpc-web-server";
import FilterButton from "./_components/filters/filter-button";
import FilterLayer from "./_components/filters/filter-layer";
import ExpandedPostLayer from "./_components/post/selected/expanded-post-layer";
import CreatePostLayer from "./_create/create-post-layer";

export default async function Page() {
  const { data, isSuccess, error } = await safe(webServerORPC.feed.getFeed({}));

  if (!isSuccess) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center">
        <span className="mt-10 font-bold text-5xl text-foreground">Failed to load feed</span>
        <span className="mt-10 font-bold text-3xl text-foreground">There was a (catastrophic!) problem when fetching the feed</span>
        <span className="mt-10 font-bold text-3xl text-foreground">
          Please report this to our{" "}
          <a href="https://github.com/swapparel/swapparel/issues" className="text-primary underline">
            GitHub Issues
          </a>{" "}
          and include the error details below.
        </span>
        <div className="relative mx-5 mt-10 h-1/3 w-1/2">
          <div className="rounded-tl-md rounded-tr-md bg-background-100/50 p-2 text-left text-white">Error Details</div>
          <div className="h-full overflow-auto rounded-br-md rounded-bl-md bg-foreground p-2 text-left font-mono text-background">
            Error: {JSON.stringify(error, null, 2)}
          </div>
        </div>
      </div>
    );
  }

  // TODO: customize scroll bar
  return (
    <>
      <ExpandedPostLayer loadedFeedPosts={data?.posts ?? []} />
      <CreatePostLayer />
      <div className="absolute z-1 m-3">
        <FilterButton />
      </div>
      {data?.posts && data.posts.length > 0 && isSuccess ? (
        <FilterLayer nextAvailablePost={data.nextAvailablePost} /> // parse the nextAvailablePost to start the inf query
      ) : (
        <div className="flex h-[calc(100vh-131.5px)] items-center justify-center">
          <h1 className="mt-10 font-bold text-2xl text-foreground">No posts found</h1>
        </div>
      )}
    </>
  );
}
