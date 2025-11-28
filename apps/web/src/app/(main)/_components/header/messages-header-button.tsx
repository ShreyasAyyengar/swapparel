"use client";

import { cn } from "@swapparel/shad-ui/lib/utils";
import { MessageCircleMore } from "lucide-react";
import random from "random";
import { useState } from "react";

export default function MessagesHeaderButton() {
  const openMsg = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Messages");
  };

  const [bool, setBool] = useState(false);

  return (
    <MessageCircleMore
      width={37.5}
      height={37.5}
      onClick={openMsg}
      onMouseEnter={() => setBool(random.boolean())}
      className={cn(
        "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary",
        bool ? "hover:-rotate-10" : "hover:rotate-10"
      )}
    />
  );
}
