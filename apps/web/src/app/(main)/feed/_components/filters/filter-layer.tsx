"use client";

import { feedFilterSchema, filterPosts, type internalPostSchema } from "@swapparel/contracts";
import { parseAsBoolean, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import type { z } from "zod";
import MasonryLayout from "../post/masonry-layout";
import Post from "../post/post";

export default function FilterLayer({ data }: { data: { posts: z.infer<typeof internalPostSchema>[] } }) {
  const [selectedColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [selectedColourOnly] = useQueryState("colourOnly", parseAsBoolean);
  const [selectedSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [selectedSizeOnly] = useQueryState("sizeOnly", parseAsBoolean);
  const [selectedMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [selectedMaterialOnly] = useQueryState("materialOnly", parseAsBoolean);
  const [selectedHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [selectedHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean);

  // TODO: Explain memoization of filters and filteredPosts @Shreyas

  useEffect(() => {
    console.log("[FILTER LAYER LAST] selectedColor from URL state: ", selectedColor);
    console.log("---------------------");
  }, [selectedColor]);

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

  const filteredPosts = useMemo(() => filterPosts(data.posts, filters), [data.posts, filters]);

  return (
    <div className="mt-15 flex items-center justify-center">
      <MasonryLayout postCount={filteredPosts.length}>
        {filteredPosts.map((post) => (
          <Post key={post._id} postData={post} />
        ))}
      </MasonryLayout>
    </div>
  );
}
