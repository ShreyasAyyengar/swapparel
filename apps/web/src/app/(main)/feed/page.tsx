import { safe } from "@orpc/client";
import { feedFilterSchema } from "@swapparel/contracts";
import { redirect } from "next/navigation";
import type { inferParserType } from "nuqs";
import { createSearchParamsCache, parseAsBoolean, parseAsNativeArrayOf, parseAsString } from "nuqs/server";
import { webServerORPC } from "../../../lib/orpc-web-server";
import FilterButton from "./_components/filters/filter-button";
import FilterLayer from "./_components/filters/filter-layer";
import { ExpandedPostLayer } from "./_components/post/selected/expanded-post-layer";
import CreatePostLayer from "./_create/create-post-layer";

const feedFilterParser = {
  createdBy: parseAsString,
  createdByDisplayName: parseAsString,

  colour: parseAsNativeArrayOf(parseAsString),
  colourOnly: parseAsBoolean.withDefault(false),

  material: parseAsNativeArrayOf(parseAsString),
  materialOnly: parseAsBoolean.withDefault(false),

  size: parseAsNativeArrayOf(parseAsString),
  sizeOnly: parseAsBoolean.withDefault(false),

  hashtag: parseAsNativeArrayOf(parseAsString),
  hashtagOnly: parseAsBoolean.withDefault(false),
};
type SearchParams = inferParserType<typeof feedFilterParser>;
const feedFilterCache = createSearchParamsCache(feedFilterParser);

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const parsedParams = await feedFilterCache.parse(searchParams); // get search params from URL

  const filters = feedFilterSchema.safeParse({
    colour: parsedParams.colour ? { value: parsedParams.colour, only: parsedParams.colourOnly } : undefined,
    material: parsedParams.material ? { value: parsedParams.material, only: parsedParams.materialOnly } : undefined,
    size: parsedParams.size ? { value: parsedParams.size, only: parsedParams.sizeOnly } : undefined,
    hashtag: parsedParams.hashtag ? { value: parsedParams.hashtag, only: parsedParams.hashtagOnly } : undefined,
  });
  if (!filters.success) redirect("/feed");

  // const { data, isSuccess, error } = await safe(webServerORPC.feed.getFeed({ amount: 100 })); // todo check coerce bug
  const { data, isSuccess, error } = await safe(webServerORPC.feed.getFeed({}));

  if (!isSuccess) return <p>Error loading feed: {JSON.stringify(error, null, 2)}</p>;

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
