"use client";

import { cn } from "@swapparel/shad-ui/lib/utils";
import { Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import random from "random";
import { useState } from "react";

export default function SwapsHeaderButton() {
  const router = useRouter();
  const [, setTransactionIdURL] = useQueryState("trade", parseAsString);

  const openTrades = async () => {
    await setTransactionIdURL(null); // dumbahh nuqs doesn't wanna listen to router changes.
    router.push("/trades");
  };

  const [bool, setBool] = useState(false);

  return (
    <Repeat
      width={37.5}
      height={37.5}
      onClick={openTrades}
      onMouseEnter={() => setBool(random.boolean())}
      className={cn(
        "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary",
        bool ? "hover:-rotate-10" : "hover:rotate-10"
      )}
    />
  );
}
