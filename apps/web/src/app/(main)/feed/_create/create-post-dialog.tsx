"use client";

import { Dialog, DialogContent, DialogTrigger } from "@swapparel/shad-ui/components/dialog";
import { useQueryState } from "nuqs";
import CreatePostHeaderButton from "../../_components/header/create-post-header-button";
import CreatePostForm from "./create-post-form";

export default function CreatePostDialog() {
  const [isCreating, setIsCreating] = useQueryState("create");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <CreatePostHeaderButton />
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[1500px] [&>button]:hidden">
        <CreatePostForm closeAction={() => setIsCreating(null)} />
      </DialogContent>
    </Dialog>
  );
}
