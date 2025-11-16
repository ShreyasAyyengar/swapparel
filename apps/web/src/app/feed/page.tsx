import { safe } from "@orpc/client";
import { feedFilterSchema } from "@swapparel/contracts";
import type { inferParserType } from "nuqs";
import { createSearchParamsCache, parseAsBoolean, parseAsNativeArrayOf, parseAsString } from "nuqs/server";
import type { z } from "zod";
import { webServerORPC } from "../../lib/orpc-web-server";

export const feedFilterParser = {
  peek: parseAsString,
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
  // const [peeking, setPeeking] = useQueryState("peek", { defaultValue: "" });
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
    }); // create type-safe post filter
  } catch (_unused) {
    // if any parsing error, the user injected an invalid URL filter state, default to empty filter
    filters = feedFilterSchema.parse({});
  }

  const { data, isSuccess, error } = await safe(webServerORPC.feed.getFeed({ filters })); // fetch feed w/ filter

  // const renderPosts = data?.map((post) => <Post key={post._id} postData={post} onClickAction={setPeeking} />);

  // useEffect(() => {
  //   if (peeking) {
  //     // Disable scrolling
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     // Re-enable scrolling
  //     document.body.style.overflow = "";
  //   }
  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, [peeking]);

  // const expandedPost = () => {
  //   const selectedPost = data.find((p) => p._id === peeking);
  //   return selectedPost ? <ExpandedPost postData={selectedPost} onClose={() => setPeeking("")} /> : null;
  // };

  // TODO: customize scroll bar
  return (
    <>
      {/*{peeking && expandedPost()}*/}
      {/*<Header />*/}
      {/*<div className="flex justify-center">*/}
      {/*  <Search />*/}
      {/*</div>*/}
      {/*<div className="flex items-center justify-center">*/}
      {/*  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{renderPosts}</div>*/}
      {/*</div>*/}
    </>
  );
}
