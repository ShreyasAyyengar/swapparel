"use client";

import Image from "next/image";
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
    <div className="flex w-full items-center justify-center">
      <div className="mt-10 flex w-3/4 flex-col items-center justify-center gap-5 rounded-md border-2 border-foreground bg-accent">
        <div className="mt-5 flex items-center justify-center gap-20 rounded-full border border-secondary bg-primary p-5 text-foreground">
          <Image src="https://picsum.photos/200" alt="profile picture" width="100" height="100" className={"mr-10 rounded-full"} />
          <div className="flex flex-col gap-2">
            <p className={"font-bold text-2xl"}>Alex Lin</p>
            <p className={"border-2 border-secondary px-2 text-center font-light"}>12 posts</p>
          </div>
        </div>
        <div className={"w-full border border-secondary"} />
        <div>
          <p className={"font-bold text-2xl"}>POSTS</p>
          <div className="w-full border border-foreground" />
        </div>
        <div className={"flex w-full items-center justify-center px-10"}>
          <MasonryLayout>
            <MasonryElement className={"bg-primary"} postData={MOCK_INTERNAL_POST} />
            <MasonryElement postData={MOCK_INTERNAL_POST} />
            <MasonryElement postData={MOCK_INTERNAL_POST} />
          </MasonryLayout>
        </div>
      </div>
    </div>
  );
}
