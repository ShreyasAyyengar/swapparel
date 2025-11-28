"use client";

import { cn } from "@swapparel/shad-ui/lib/utils";
import { CopyPlus } from "lucide-react";
import random from "random";
import { useState } from "react";
import { useCreateFormOpenStore } from "../../feed/_hooks/state/create-form-open-store";

export default function CreatePostHeaderButton() {
  const [bool, setBool] = useState(false);
  const { setIsOpen } = useCreateFormOpenStore();

  return (
    <>
      {/*{createOpen && (*/}
      {/*  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xl">*/}
      {/*    <CreatePostForm closeAction={closeAction} />*/}
      {/*  </div>*/}
      {/*)}*/}
      <CopyPlus
        width={37.5}
        height={37.5}
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setBool(random.boolean())}
        className={cn(
          "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary",
          bool ? "hover:-rotate-10" : "hover:rotate-10"
        )}
      />
    </>
  );
}
