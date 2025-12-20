"use client";

import { feedFilterSchema, filterPosts, type internalPostSchema } from "@swapparel/contracts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { parseAsBoolean, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import type { z } from "zod";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import MasonryLayout from "../post/masonry-layout";
import MasonryPost from "../post/masonry-post";

export default function FilterLayer({ initialPosts }: { initialPosts: { posts: z.infer<typeof internalPostSchema>[] } }) {
  const [selectedColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [selectedColourOnly] = useQueryState("colourOnly", parseAsBoolean);
  const [selectedSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [selectedSizeOnly] = useQueryState("sizeOnly", parseAsBoolean);
  const [selectedMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [selectedMaterialOnly] = useQueryState("materialOnly", parseAsBoolean);
  const [selectedHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [selectedHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean);

  // TODO: Explain memoization of filters and filteredPosts @Shreyas
  const filters = useMemo(
    () =>
      feedFilterSchema.parse({
        colour: { value: selectedColor, only: selectedColourOnly ?? false },
        material: { value: selectedMaterial, only: selectedMaterialOnly ?? false },
        size: { value: selectedSize, only: selectedSizeOnly ?? false },
        hashtag: { value: selectedHashtag, only: selectedHashtagOnly ?? false },
      }),
    [
      selectedColor,
      selectedColourOnly,
      selectedMaterial,
      selectedMaterialOnly,
      selectedSize,
      selectedSizeOnly,
      selectedHashtag,
      selectedHashtagOnly,
    ]
  );

  const { ref, inView } = useInView();

  const { data, fetchNextPage } = useInfiniteQuery(
    webClientORPC.feed.getFeed.infiniteOptions({
      initialPageParam: initialPosts.posts.at(-1)?._id ?? null,
      getNextPageParam: (lastPage) => lastPage.cursor ?? null,
      input: (pageParam: string | null) => ({
        filter: filters,
        cursor: pageParam ?? undefined,
      }),
    })
  );

  const filteredPosts = useMemo(
    () => filterPosts([...initialPosts.posts, ...(data?.pages.flatMap((p) => p.posts) ?? [])], filters),
    [initialPosts.posts, filters, data?.pages]
  );

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [inView, fetchNextPage]);

  return (
    <div className="mt-15 mr-25 ml-25 flex items-center justify-center">
      {/* TODO: render masonry layout like pintrest */}
      <MasonryLayout>
        {filteredPosts.map((post) => (
          <MasonryPost key={post._id} postData={post} />
        ))}
      </MasonryLayout>
      <div ref={ref} />
      {/* TODO: opening a new post from a scroll render takes more time*/}
    </div>
  );
}
