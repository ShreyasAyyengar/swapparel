"use client";

import { useQueryState } from "nuqs";
import CreatePostForm from "./create-post-form";

export default function CreatePostLayer() {
  const [isCreating, setIsCreating] = useQueryState("create");

  if (isCreating === null) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 backdrop-blur-md">
      <CreatePostForm closeAction={() => setIsCreating(null)} />
    </div>
  );
}
