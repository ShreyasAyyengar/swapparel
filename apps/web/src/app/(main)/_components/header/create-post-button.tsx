"use client";

import { CopyPlus } from "lucide-react";
import random from "random";
import { useState } from "react";

export default function CreatePostButton() {
  const openCreatePost = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Create Post");
  };

  const [hoverRotate, setHoverRotate] = useState("rotate-10");

  return (
    <CopyPlus
      width={37.5}
      height={37.5}
      onClick={openCreatePost}
      onMouseEnter={() => setHoverRotate(random.boolean() ? "-rotate-10" : "rotate-10")}
      className={`hover:${hoverRotate} duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary`}
    />
  );
}
