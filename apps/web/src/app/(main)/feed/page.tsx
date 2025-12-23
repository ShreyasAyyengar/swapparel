import { safe } from "@orpc/client";
import { webServerORPC } from "../../../lib/orpc-web-server";
import FilterButton from "./_components/filters/filter-button";
import FilterLayer from "./_components/filters/filter-layer";
import ExpandedPostLayer from "./_components/post/selected/expanded-post-layer";
import CreatePostLayer from "./_create/create-post-layer";

export default async function Page() {
  // const { data, isSuccess, error } = await safe(webServerORPC.feed.getFeed({ amount: 100 })); // todo check coerce bug
  const { data, isSuccess, error } = await safe(webServerORPC.feed.getFeed({}));

  if (!isSuccess) return <p>Error loading feed: {JSON.stringify(error, null, 2)}</p>; // TODO beautify this

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
