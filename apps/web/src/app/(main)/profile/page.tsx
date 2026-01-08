"use client";

import Image from "next/image";
import FilterButton from "../feed/_components/filters/filter-button";
import MasonryElement from "../feed/_components/post/masonry-element";
import MasonryLayout from "../feed/_components/post/masonry-layout";

export default function Page() {
  const MOCK_INTERNAL_POST = {
    _id: "0192e45c-8b62-7f63-b9b2-5c52c1b42a71", // valid uuidv7 format
    createdBy: "seller@swapparel.com",

    title: "Vintage Washed Denim Jacket",

    description:
      "Lightly worn oversized denim jacket with a vintage wash. Perfect for layering in fall and spring. No stains, no tears, smoke-free home.",

    garmentType: "Jackets",

    colour: ["Blue"],

    size: "M",

    material: ["Denim", "Cotton"],

    images: ["https://picsum.photos/200"],

    hashtags: ["#vintage", "#denim", "#streetwear", "#oversized"],

    comments: [],

    price: 65,
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mt-5 grid w-1/2 grid-cols-1 justify-items-center rounded-full border border-secondary bg-primary p-5 px-10 text-foreground md:grid-cols-2 md:justify-between md:justify-items-stretch">
        <Image
          src="https://picsum.photos/200"
          alt="profile picture"
          width="100"
          height="100"
          className="mr-0 mb-5 rounded-full md:mr-10 md:mb-0"
        />
        <div className="flex flex-col items-center gap-2 md:items-end">
          <p className="text-center font-bold text-2xl md:text-end">althlin@ucsc.edu</p>
          <div className="flex w-3/4 flex-col rounded-md border-2 border-secondary px-2 py-1 font-light">
            <div className="flex items-center justify-between">
              <p>12 Posts</p>
              <p>Rating: 3/5</p>
            </div>
            <div className="flex items-center justify-between">
              <p>14 Items Traded</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-10 flex w-3/4 flex-col items-center justify-center gap-5 rounded-md border-2 border-foreground bg-accent">
        <FilterButton className={"absolute top-5 left-10 z-1"} />
        <div>
          <p className={"mt-5 font-bold text-2xl"}>POSTS</p>
          <div className="w-full border border-foreground" />
        </div>
        <div className={"flex w-full items-center justify-center px-10"}>
          <MasonryLayout>
            <MasonryElement className={"bg-primary"} postData={MOCK_INTERNAL_POST} />
            <MasonryElement className={"bg-primary"} postData={MOCK_INTERNAL_POST} />
            <MasonryElement className={"bg-primary"} postData={MOCK_INTERNAL_POST} />
          </MasonryLayout>
        </div>
      </div>
    </div>
  );
}
