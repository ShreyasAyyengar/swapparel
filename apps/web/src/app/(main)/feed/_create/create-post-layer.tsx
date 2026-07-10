"use client";

import { Dialog, DialogContent } from "@swapparel/shad-ui/components/dialog";
import { useQueryState } from "nuqs";
import CreatePostForm from "./create-post-form";

export default function CreatePostLayer() {
  const [isCreating, setIsCreating] = useQueryState("create");

  return (
    <Dialog
      open={isCreating !== null}
      onOpenChange={(open) => {
        if (!open) setIsCreating(null);
      }}
    >
      <DialogContent className="w-[95vw] sm:max-w-[1500px] [&>button]:hidden">
        <CreatePostForm closeAction={() => setIsCreating(null)} />
      </DialogContent>
    </Dialog>
  );
}
