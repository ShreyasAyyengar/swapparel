import { safe } from "@orpc/client";
import { webServerORPC } from "../../../lib/orpc-web-server";
import FilterButton from "./_components/filters/filter-button";
import FilterLayer from "./_components/filters/filter-layer";
import { SelectedPostLayer } from "./_components/post/selected/selected-post-layer";
import CreatePostLayer from "./_create/create-post-layer";

export default async function Page() {
  const { data, isSuccess } = await safe(webServerORPC.feed.getFeed({})); // fetch feed w/ filter

  // TODO: customize scroll bar
  return (
    <>
      {/*<SelectedPostWrapper loadedFeedPosts={data ?? []} />*/}
      <SelectedPostLayer loadedFeedPosts={data?.posts ?? []} />
      <CreatePostLayer />
      <div className="m-3">
        <FilterButton />
      </div>
      {data?.posts && data.posts.length > 0 && isSuccess ? (
        <FilterLayer data={data} />
      ) : (
        <div className="flex h-[calc(100vh-131.5px)] items-center justify-center">
          <h1 className="mt-10 font-bold text-2xl text-foreground">No posts found</h1>
        </div>
      )}
    </>
  );
}
