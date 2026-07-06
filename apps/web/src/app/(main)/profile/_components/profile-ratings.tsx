"use client";

import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import sendToProfilePage from "./helper-functions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@swapparel/shad-ui/components/drawer";
import { Button } from "@swapparel/shad-ui/components/button";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { webClientORPC } from "../../../../lib/orpc-web-client";

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "xs" }) {
  const sizeClass = size === "xs" ? "size-3" : "size-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

export default function ProfileRatings({ userEmail }: { userEmail: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const { data: ratingsData } = useQuery(
    webClientORPC.ratings.getRatingsForUser.queryOptions({
      input: { ratedUserEmail: userEmail },
      enabled: !!userEmail,
    })
  );

  if (!ratingsData || ratingsData.totalRatings === 0) return null;

  const average = ratingsData.averageRating!;

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="flex items-center gap-1.5 text-sm hover:underline"
      >
        <Stars value={average} />
        <span className="font-medium">{average.toFixed(1)}</span>
        <span className="text-muted-foreground">({ratingsData.totalRatings})</span>
      </button>

      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-full">
          <DrawerHeader>
            <DrawerTitle>Ratings</DrawerTitle>
            <DrawerDescription>
              {average.toFixed(1)} average — {ratingsData.totalRatings} rating
              {ratingsData.totalRatings !== 1 ? "s" : ""}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 divide-y overflow-y-auto px-4 pb-4">
            {ratingsData.ratings.map((rating) => (
              <div key={rating._id} className="py-3">
                <div className="flex items-center justify-between">
                  <Stars value={rating.value} size="xs" />
                  <button
                    type="button"
                    className="cursor-pointer text-xs text-muted-foreground hover:underline"
                    onClick={() => sendToProfilePage(rating.raterEmail, router)}
                  >
                    {rating.raterEmail}
                  </button>
                </div>
                {rating.comment && <p className="mt-1 text-sm">{rating.comment}</p>}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
