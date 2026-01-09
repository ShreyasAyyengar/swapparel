"use client";

import type { internalPostSchema } from "@swapparel/contracts";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { env } from "../../../env";
import { authClient } from "../../../lib/auth-client";
import { webClientORPC } from "../../../lib/orpc-web-client";
import FilterButton from "../feed/_components/filters/filter-button";
import MasonryElement from "../feed/_components/post/masonry-element";
import MasonryLayout from "../feed/_components/post/masonry-layout";

export default function Page() {
  const [profileEmail] = useQueryState("profile");
  const { data: authData, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const { data: posts } = useQuery(
    webClientORPC.posts.getPosts.queryOptions({
      input: { createdBy: profileEmail ?? "template@ucsc.edu" },
    })
  );

  const { data: profileData } = useQuery(
    webClientORPC.users.getUser.queryOptions({
      // biome-ignore lint/style/noNonNullAssertion: this will always be a defined string, see next line.
      input: { email: profileEmail! },
      enabled: !!profileEmail,
    })
  );

  if (!(profileEmail || isPending || authData)) {
    authClient.signIn.social({
      provider: "google",
      callbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/trades`,
      errorCallbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/auth/error`,
    });
    return null; // TODO: show loading skeleton
  }

  if (!profileData) return <div> Profile not found </div>;

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div
        className={`mt-5 grid grid-cols-1 justify-items-center overflow-hidden rounded-full border border-secondary bg-primary p-5 px-10 text-foreground transition-[width] duration-700 ease-out ${mounted ? "w-1/2" : "w-0"} md:grid-cols-2 md:justify-between md:justify-items-stretch`}
      >
        {mounted && (
          <>
            <Image src={profileData.image} alt="profile picture" width="100" height="100" className="mr-0 mb-5 rounded-full md:mr-10 md:mb-0" />
            <div className="flex flex-col items-center gap-2 md:items-end">
              <p className="text-center font-bold text-2xl md:text-end">{profileEmail}</p>
              <div className="flex w-3/4 flex-col rounded-md border-2 border-secondary px-2 py-1 font-light">
                <div className="flex items-center justify-between">
                  <p>12 Posts</p>
                  <p>Rating: 3/5</p>
                </div>
                <div className="flex items-center justify-between">
                  <p>14 Items Traded</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative mt-10 flex w-3/4 flex-col items-center justify-center gap-5 rounded-md border-2 border-foreground bg-accent">
        <FilterButton className={"absolute top-5 left-10 z-1"} />
        <div>
          <p className={"mt-5 font-bold text-2xl"}>POSTS</p>
          <div className="w-full border border-foreground" />
        </div>
        <div className={"flex w-full items-center justify-center px-10"}>
          <MasonryLayout>
            {posts?.map((post: z.infer<typeof internalPostSchema>) => (
              <MasonryElement key={post._id} className={"bg-primary"} postData={post} />
            ))}
          </MasonryLayout>
        </div>
      </div>
    </div>
  );
}
