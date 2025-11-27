"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs/server";
import { useEffect } from "react";
import type z from "zod";
import ExpandedImage from "./expanded-image";

export default function SelectedPostTrigger({ post, children }: { post: z.infer<typeof internalPostSchema>; children: React.ReactNode }) {
  const [_, setSelectedPost] = useQueryState("post", parseAsString.withOptions({ shallow: false }));
  const onClose = async () => {
    await setSelectedPost(null);
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onMouseDown={onClose} />

      <div className="relative z-10 flex h-150 w-200 rounded-2xl border border-secondary bg-accent p-10 text-foreground">
        <ExpandedImage imageSRC={post.images} />
        {children}
      </div>
    </div>
  );
}
