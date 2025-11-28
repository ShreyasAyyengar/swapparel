import { safe } from "@orpc/client";
import { feedFilterSchema } from "@swapparel/contracts";
import type { inferParserType } from "nuqs";
import { createSearchParamsCache, parseAsBoolean, parseAsNativeArrayOf, parseAsString } from "nuqs/server";
import type { z } from "zod";
import { webServerORPC } from "../../../lib/orpc-web-server";
import FilterButton from "./_components/filters/filter-button";
import Post from "./_components/post/post";
import { SelectedPostLayer } from "./_components/post/selected/selected-post-layer";

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

export type SearchParams = inferParserType<typeof feedFilterParser>;

const feedFilterCache = createSearchParamsCache(feedFilterParser);

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const parsedParams = await feedFilterCache.parse(searchParams); // get search params from URL
  let filters: z.infer<typeof feedFilterSchema>;

  try {
    filters = feedFilterSchema.parse({
      // ...(parsedParams.createdBy !== null && { createdBy: parsedParams.createdBy }),
      ...(parsedParams.createdByDisplayName !== null && { createdByDisplayName: parsedParams.createdByDisplayName }),
      ...(parsedParams.colour.length > 0 && {
        colour: {
          value: parsedParams.colour,
          only: parsedParams.colourOnly ?? false,
        },
      }),
      ...(parsedParams.material.length > 0 && {
        material: {
          value: parsedParams.material,
          only: parsedParams.materialOnly ?? false,
        },
      }),
      ...(parsedParams.size.length > 0 && {
        size: {
          value: parsedParams.size,
          only: parsedParams.sizeOnly ?? false,
        },
      }),
      ...(parsedParams.hashtag.length > 0 && {
        hashtag: {
          value: parsedParams.hashtag,
          only: parsedParams.hashtagOnly ?? false,
        },
      }),
    }); // create a type-safe post-filter
  } catch (_unused) {
    // if any parsing error, the user injected an invalid URL filter state, default to empty filter
    filters = feedFilterSchema.parse({});
  }

  const { data, isSuccess } = await safe(webServerORPC.feed.getFeed({ filters })); // fetch feed w/ filter

  // TODO: customize scroll bar
  return (
    <>
      {/*<SelectedPostWrapper loadedFeedPosts={data ?? []} />*/}
      <SelectedPostLayer loadedFeedPosts={data ?? []} />
      <div className="m-3">
        <FilterButton />
      </div>
      {data && data.length > 0 && isSuccess ? (
        <div className="mt-15 flex items-center justify-center">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {/*TODO: fix multirendering*/}
            {data?.map((post) => (
              <Post key={post._id} postData={post} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-131.5px)] items-center justify-center">
          <h1 className="mt-10 font-bold text-2xl text-foreground">No posts found</h1>
        </div>
      )}
    </>
  );
}
