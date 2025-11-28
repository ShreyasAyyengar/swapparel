"use client";

import { useCreateFormOpenStore } from "../_hooks/state/create-form-open-store";
import CreatePostForm from "./create-post-form";

export default function CreatePostLayer() {
  const { isOpen, setIsOpen } = useCreateFormOpenStore();

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 backdrop-blur-md">
      <CreatePostForm closeAction={() => setIsOpen(false)} />
    </div>
  );
}
