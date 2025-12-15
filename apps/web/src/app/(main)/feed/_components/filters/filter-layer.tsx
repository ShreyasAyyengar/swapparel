"use client";

import { feedFilterSchema, filterPosts, type internalPostSchema } from "@swapparel/contracts";
import { parseAsBoolean, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
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

  const filter = feedFilterSchema.parse({
    colour: { value: selectedColor, only: selectedColourOnly ?? false },
    material: { value: selectedMaterial, only: selectedMaterialOnly ?? false },
    size: { value: selectedSize, only: selectedSizeOnly ?? false },
    hashtag: { value: selectedHashtag, only: selectedHashtagOnly ?? false },
  });

  const filteredPosts = filterPosts(data.posts, filter);

  useEffect(() => {
    console.log(`parsed ${data.posts.length} of posts, returned ${filteredPosts.length}`);
  }, [data.posts, filteredPosts]);

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
