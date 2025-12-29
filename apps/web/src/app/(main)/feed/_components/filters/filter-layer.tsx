"use client";

import { COLOURS, feedFilterSchema, filterPosts, MATERIALS, SIZES } from "@swapparel/contracts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { parseAsBoolean, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import type { z } from "zod";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import { useFetchedPostsStore } from "../../_hooks/use-posts-store";
import { useStickyTrue } from "../../_hooks/use-sticky-state";
import MasonryElement from "../post/masonry-element";
import MasonryLayout from "../post/masonry-layout";

export default function FilterLayer({ nextAvailablePost }: { nextAvailablePost: string | undefined }) {
  const [selectedColor, setSelectedColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [selectedColourOnly] = useQueryState("colourOnly", parseAsBoolean);
  const [selectedSize, setSelectedSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [selectedSizeOnly] = useQueryState("sizeOnly", parseAsBoolean);
  const [selectedMaterial, setSelectedMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [selectedMaterialOnly] = useQueryState("materialOnly", parseAsBoolean);
  const [selectedHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [selectedHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean);
  // TODO filter by garment type and price

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
    return Object.keys(f).length ? feedFilterSchema.safeParse(f) : undefined;
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

  useEffect(() => {
    if (filters?.error) {
      selectedColor.forEach((color) => {
        // biome-ignore lint/suspicious/noExplicitAny: color could be any string, not just valid COLOUR enum const
        if (!COLOURS?.includes(color as any)) {
          setSelectedColor((prev) => prev?.filter((c) => c !== color));
        }
      });

      selectedMaterial.forEach((mat) => {
        // biome-ignore lint/suspicious/noExplicitAny: mat could be any string, not just valid MATERIAL enum const
        if (!MATERIALS?.includes(mat as any)) {
          setSelectedMaterial((prev) => prev?.filter((m) => m !== mat));
        }
      });

      selectedSize.forEach((size) => {
        // biome-ignore lint/suspicious/noExplicitAny: size could be any string, not just valid SIZE enum const
        if (!SIZES?.includes(size as any)) {
          setSelectedSize((prev) => prev?.filter((s) => s !== size));
        }
      });
    }
  }, []);

  const { ref: optimisticRef, inView: optimisticInView } = useInView();
  const { ref: bottomRef, inView: bottomInView } = useInView();

  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery(
    webClientORPC.feed.getFeed.infiniteOptions({
      initialData: {
        pages: [{ posts: fetchedPosts, nextAvailablePost }],
        pageParams: [undefined], // First page has no pageParam (it's the initial load)
      },
      initialPageParam: undefined, // on first render, we didn't have a nextAvailablePost
      getNextPageParam: (lastPage) => lastPage.nextAvailablePost,
      input: (pageParam: string | undefined) => ({
        filters: filters?.success ? filters.data : undefined,
        nextAvailablePost: pageParam ?? undefined,
      }),
      enabled: false,
    })
  );
  const fetchingSticky = useStickyTrue(isFetching, 200);

  useEffect(() => {
    if (!data) return;

    const lastPage = data?.pages.at(-1);

    if (data.pages.length === 1) return; // Don't process or fetch for initial data

    // if there was no data, fetch again
    if (lastPage?.posts?.length === 0 && hasNextPage) {
      fetchNextPage();
      return;
    }

    addPosts(lastPage?.posts ?? []);
  }, [data, hasNextPage]);

  const filteredPosts = useMemo(() => filterPosts(fetchedPosts, filters?.data), [fetchedPosts, filters?.data]);

  useEffect(() => {
    if (optimisticInView || bottomInView) fetchNextPage();
  }, [optimisticInView, bottomInView]);

  return (
    <div>
      <div className="mt-20 mr-25 ml-25 flex items-center justify-center">
        <MasonryLayout>
          {filteredPosts.map((post) => (
            <MasonryElement key={post._id} postData={post} />
          ))}
        </MasonryLayout>
        {!isFetching && <div ref={optimisticRef} />}
      </div>
      {!isFetching && <div ref={bottomRef} />}
      {fetchingSticky && (
        <div className="mb-20 gap-4 text-center">
          {"Fetching Swag...".split("").map((letter, i) => (
            <span key={i} className="inline-block animate-bounce font-bold text-3xl" style={{ animationDelay: `${i * 0.1}s` }}>
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>
      )}

      {!(hasNextPage || fetchingSticky) && (
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
