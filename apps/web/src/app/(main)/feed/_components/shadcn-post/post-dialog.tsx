"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@swapparel/shad-ui/components/dialog";
import Image from "next/image";
import type { ReactNode } from "react";
import type z from "zod";

export default function PostDialog({
  open,
  onOpenChange,
  postData,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postData: z.infer<typeof internalPostSchema>;
  children?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{postData.title}</DialogTitle>
          <DialogDescription className="space-y-4 text-left">
            {children}
            <span title={postData.createdBy} className="block w-full truncate text-foreground">
              {postData.createdBy}
            </span>
            <Image
              src={postData.images[0] ?? ""}
              width={200}
              height={200}
              alt="thumbnail"
              className="w-full rounded-md border-2 border-[#6F4D3880]"
              loading="eager"
              priority={false}
            />
            <div className="w-full pt-2">
              <p title={postData.size} className="w-full truncate text-left text-foreground">
                Size: <Badge className="bg-foreground font-bold text-background">{postData.size}</Badge>
              </p>
              <p title={postData.garmentType} className="w-full truncate text-left text-foreground">
                Garment Type: <Badge className="bg-foreground font-bold text-background">{postData.garmentType}</Badge>
              </p>
              <p title={postData.colour.join(", ")} className="w-full truncate text-left text-foreground">
                Color:{" "}
                {postData.colour.map((color) => (
                  <Badge className="mr-1 bg-foreground font-bold text-background" key={color}>
                    {color}
                  </Badge>
                ))}
              </p>
              <p title={postData.material.join(", ")} className="w-full truncate text-left text-foreground">
                Material:{" "}
                {postData.material.map((mats) => (
                  <Badge className="mr-1 bg-foreground font-bold text-background" key={mats}>
                    {mats}
                  </Badge>
                ))}
              </p>
              {postData.price && (
                <p className="w-full truncate text-left text-foreground">
                  Price: <Badge className="bg-foreground font-bold text-background">{postData.price}</Badge>
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
