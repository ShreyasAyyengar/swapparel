"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import Image from "next/image";
import type z from "zod";

export default function Post({
  postData,
  onClickAction,
}: {
  postData: z.infer<typeof internalPostSchema>;
  onClickAction: (id: string) => void;
}) {
  // use effect
  const MAX_STRING_LEN = 10;

  const openPost = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("you opened a post");
    onClickAction(postData._id);
  };

  return (
    <button
      type="button"
      className="m-4 flex aspect-square w-60 cursor-pointer flex-col items-center gap-4 rounded-md border border-gray-300 bg-accent p-4 pt-6"
      onClick={openPost}
    >
      <Image src={postData.images[0] ?? ""} alt="thumbnail" width={200} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col justify-between text-sm">
          {/* Row 1 */}
          <div className="flex w-full justify-between text-sm">
            <span title={postData.size} className="w-[20ch] truncate text-foreground">
              {postData.size.length > MAX_STRING_LEN ? `${postData.size.slice(0, MAX_STRING_LEN)}…` : postData.size}
            </span>
            <span className="mx-2">|</span> {/* separator */}
            <span title={postData.colour.join(", ")} className="w-[20ch] truncate text-foreground">
              {postData.colour.length > MAX_STRING_LEN ? `${postData.colour.slice(0, MAX_STRING_LEN)}…` : postData.colour}
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex w-full justify-between text-sm">
            <span title={postData.material.join(", ")} className="w-[20ch] truncate text-foreground">
              {postData.material.length > MAX_STRING_LEN ? `${postData.material.slice(0, MAX_STRING_LEN)}…` : postData.material}
            </span>
            <span className="mx-2">|</span> {/* separator */}
            <span title={postData.createdBy} className="w-[20ch] truncate text-foreground">
              {postData.createdBy.length > MAX_STRING_LEN ? `${postData.createdBy.slice(0, MAX_STRING_LEN)}…` : postData.createdBy}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
