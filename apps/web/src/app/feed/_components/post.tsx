"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import Image from "next/image";
import type z from "zod";

export default function Post({ postData }: { postData: z.infer<typeof internalPostSchema> }) {
  // use effect
  function openPost() {
    // biome-ignore lint/suspicious/noAlert: <test>
    alert("you opened a post");
  }

  return (
    <button type="button" className="m-4 flex cursor-pointer flex-col items-center gap-4" onClick={openPost}>
      <Image src={postData.images[0] ?? ""} alt="thumbnail" width={200} height={200} />
      <p>Hello</p>
    </button>
  );
}
