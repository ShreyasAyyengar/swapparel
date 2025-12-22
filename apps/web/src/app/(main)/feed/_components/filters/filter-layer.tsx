"use client";

import { feedFilterSchema, filterPosts } from "@swapparel/contracts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { parseAsBoolean, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import type { z } from "zod";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import { useFetchedPostsStore } from "../../_hooks/state/fetched-posts-store";
import MasonryElement from "../post/masonry-element";
import MasonryLayout from "../post/masonry-layout";

// TODO fix post loading, and going from fully loaded state to filtered state.
export default function FilterLayer({ nextAvailablePost }: { nextAvailablePost: string | undefined }) {
  const [selectedColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [selectedColourOnly] = useQueryState("colourOnly", parseAsBoolean);
  const [selectedSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [selectedSizeOnly] = useQueryState("sizeOnly", parseAsBoolean);
  const [selectedMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [selectedMaterialOnly] = useQueryState("materialOnly", parseAsBoolean);
  const [selectedHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [selectedHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean);

  const { fetchedPosts, addPosts } = useFetchedPostsStore();

  const filters = useMemo(() => {
    const f: Partial<z.input<typeof feedFilterSchema>> = {};

    if (selectedColor?.length) {
      f.colour = (selectedColourOnly ? { value: selectedColor, only: true } : { value: selectedColor }) as z.infer<
        typeof feedFilterSchema
      >["colour"];
    }
    if (selectedMaterial?.length) {
      f.material = (selectedMaterialOnly ? { value: selectedMaterial, only: true } : { value: selectedMaterial }) as z.infer<
        typeof feedFilterSchema
      >["material"];
    }
    if (selectedSize?.length) {
      f.size = (selectedSizeOnly ? { value: selectedSize, only: true } : { value: selectedSize }) as z.infer<typeof feedFilterSchema>["size"];
    }
    if (selectedHashtag?.length) {
      f.hashtag = (selectedHashtagOnly ? { value: selectedHashtag, only: true } : { value: selectedHashtag }) as z.infer<
        typeof feedFilterSchema
      >["colour"];
    }

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

  const { ref: optimisticRef, inView: optimisticInView } = useInView();
  const { ref: bottomRef, inView: bottomInView } = useInView();

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery(
    webClientORPC.feed.getFeed.infiniteOptions({
      initialData: {
        pages: [{ posts: fetchedPosts, nextAvailablePost }],
        pageParams: [undefined], // First page has no pageParam (it's the initial load)
      },
      initialPageParam: undefined, // on first render, we didn't have a nextAvailablePost
      getNextPageParam: (lastPage) => lastPage.nextAvailablePost,
      input: (pageParam: string | undefined) => ({
        filters,
        nextAvailablePost: pageParam ?? undefined,
      }),
      enabled: false,
    })
  );

  useEffect(() => {
    if (!data) return;

    const lastPage = data?.pages.at(-1);

    // Skip the initial data (first page)
    if (data.pages.length === 1) {
      return; // Don't process or fetch for initial data
    }

    // if there was no data, fetch again
    if (lastPage?.posts?.length === 0 && hasNextPage) {
      fetchNextPage();
      return;
    }

    addPosts(lastPage?.posts ?? []);
  }, [data, fetchNextPage, hasNextPage]);

  const filteredPosts = useMemo(() => filterPosts(fetchedPosts, filters), [fetchedPosts, filters]);

  useEffect(() => {
    if (optimisticInView || bottomInView) {
      fetchNextPage();
    }
  }, [optimisticInView, bottomInView, fetchNextPage]);

  return (
    <div>
      <div className="mt-20 mr-25 ml-25 flex items-center justify-center">
        <MasonryLayout>
          {filteredPosts.map((post) => (
            <MasonryElement key={post._id} postData={post} />
          ))}
        </MasonryLayout>
        {!isFetchingNextPage && <div ref={optimisticRef} />}
      </div>
      {!isFetchingNextPage && <div ref={bottomRef} />}
      {isFetchingNextPage && (
        <div className="mb-20 gap-4 text-center">
          {"Fetching Swag...".split("").map((letter, i) => (
            <span key={i} className="inline-block animate-bounce font-bold text-3xl" style={{ animationDelay: `${i * 0.1}s` }}>
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>
      )}

      {!hasNextPage && (
        <div>
          <div className="flex items-center justify-center">
            <div className="m-8 flex w-full max-w-3/4 flex-col items-center gap-6 border border-secondary text-center" />
          </div>
          <div className="mb-10 text-center font-bold text-3xl">Could not load any more Swag...</div>
        </div>
      )}
    </div>
  );
}
