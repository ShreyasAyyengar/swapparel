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

// TODO fix post loading, and going from fully loaded state to filtered state.
export default function FilterLayer({ initialPosts }: { initialPosts: { posts: z.infer<typeof internalPostSchema>[] } }) {
  const [selectedColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [selectedColourOnly] = useQueryState("colourOnly", parseAsBoolean);
  const [selectedSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [selectedSizeOnly] = useQueryState("sizeOnly", parseAsBoolean);
  const [selectedMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [selectedMaterialOnly] = useQueryState("materialOnly", parseAsBoolean);
  const [selectedHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [selectedHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean);

  const filters = useMemo(() => {
    const f: z.infer<typeof feedFilterSchema> = {};

    if (selectedColor.length) f.colour = selectedColourOnly ? { value: selectedColor, only: true } : { value: selectedColor };
    if (selectedMaterial.length) f.material = selectedMaterialOnly ? { value: selectedMaterial, only: true } : { value: selectedMaterial };
    if (selectedSize.length) f.size = selectedSizeOnly ? { value: selectedSize, only: true } : { value: selectedSize };
    if (selectedHashtag.length) f.hashtag = selectedHashtagOnly ? { value: selectedHashtag, only: true } : { value: selectedHashtag };

    // if no filters active, return undefined (so nothing is sent)
    return Object.keys(f).length ? feedFilterSchema.parse(f) : undefined;
  }, [
    selectedColor,
    selectedColourOnly,
    selectedMaterial,
    selectedMaterialOnly,
    selectedSize,
    selectedSizeOnly,
    selectedHashtag,
    selectedHashtagOnly,
  ]);

  let allPosts = [...initialPosts.posts];

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
    webClientORPC.feed.getFeed.infiniteOptions({
      initialPageParam: allPosts.at(-1)?._id ?? null,
      getNextPageParam: (lastPage) => lastPage.cursor ?? null,
      input: (pageParam: string | null) => ({
        filters,
        cursor: pageParam ?? undefined,
      }),
      enabled: false,
    })
  );

  useEffect(() => {
    const lastPage = data?.pages.at(-1);
    // if there was no data, fetch again
    if (lastPage?.posts?.length === 0) {
      fetchNextPage();
      return;
    }
  }, [data, fetchNextPage]);

  allPosts = [...initialPosts.posts, ...(data?.pages.flatMap((p) => p.posts) ?? [])];

  const { ref, inView } = useInView();

  const filteredPosts = useMemo(() => filterPosts(allPosts, filters), [allPosts, filters]);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="mt-20 mr-25 ml-25 flex items-center justify-center">
      <MasonryLayout>
        {filteredPosts.map((post) => (
          <MasonryPost key={post._id} postData={post} />
        ))}
      </MasonryLayout>
      <div ref={ref} />
    </div>
  );
}
