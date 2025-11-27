"use client";

import { cn } from "@swapparel/shad-ui/lib/utils";
import { CopyPlus } from "lucide-react";
import random from "random";
import { useState } from "react";
import CreatePostForm from "../../feed/_create/create-post-form";

export default function CreatePostButton() {
  const [createOpen, setCreateOpen] = useState(false);
  const [hoverRotate, setHoverRotate] = useState("rotate-10");

  const closeAction = () => setCreateOpen(false);

  return (
    <>
      {createOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xl">
          <CreatePostForm closeAction={closeAction} />
        </div>
      )}
      <CopyPlus
        width={37.5}
        height={37.5}
        onClick={() => setCreateOpen(true)}
        onMouseEnter={() => setHoverRotate(random.boolean() ? "-rotate-10" : "rotate-10")}
        className={cn(
          "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary",
          `hover:${hoverRotate}`
        )}
      />
    </>
  );
}
