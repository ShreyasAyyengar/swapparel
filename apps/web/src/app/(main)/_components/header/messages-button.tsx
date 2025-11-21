"use client";

import { MessageCircleMore } from "lucide-react";
import random from "random";
import { useState } from "react";

export default function MessagesButton() {
  const openMsg = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Messages");
  };

  const [hoverRotate, setHoverRotate] = useState("rotate-10");

  return (
    <MessageCircleMore
      width={37.5}
      height={37.5}
      onClick={openMsg}
      onMouseEnter={() => setHoverRotate(random.boolean() ? "-rotate-10" : "rotate-10")}
      className={`hover:${hoverRotate} duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary`}
    />
  );
}
