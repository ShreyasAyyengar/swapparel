"use client";

import { ImageList, ImageListItem, ImageListItemBar } from "@mui/material";
import { feedFilterSchema, filterPosts, type internalPostSchema } from "@swapparel/contracts";
import Image from "next/image";
import { parseAsBoolean, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import type { z } from "zod";

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
    <div className="mt-15 mr-25 ml-25 flex items-center justify-center">
      {/*<Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={{ xs: 2, sm: 2, md: 2 }} sequential={true}>*/}
      {/*  {filteredPosts.map((post) => (*/}
      {/*    <Post key={post._id} postData={post} />*/}
      {/*    // <Image src={post.images[0] ?? ""} alt="thumbnail" width={200} height={200} className="rounded-md border-2 border-[#6F4D3880]" />*/}
      {/*  ))}*/}
      {/*</Masonry>*/}
      <ImageList variant={"masonry"} cols={5}>
        {filteredPosts.map((post) => (
          // <Post key={post._id} postData={post} />
          <ImageListItem key={post._id}>
            <Image src={post.images[0] ?? ""} alt="thumbnail" width={200} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
            <ImageListItemBar title={"HELLO"} position={"top"} />
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
}
