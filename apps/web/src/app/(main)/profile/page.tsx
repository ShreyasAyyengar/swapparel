"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { env } from "../../../env";
import { authClient } from "../../../lib/auth-client";
import { webClientORPC } from "../../../lib/orpc-web-client";
import MasonryElement from "../feed/_components/post/masonry-element";
import MasonryLayout from "../feed/_components/post/masonry-layout";
import ExpandedPostLayer from "../feed/_components/post/selected/expanded-post-layer";
import CreatePostLayer from "../feed/_create/create-post-layer";
import LoadingProfile from "./_components/loading-profile";
import NoProfile from "./_components/no-profile";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const { data: authData, isPending } = authClient.useSession();
  const [profileQuery] = useQueryState("email");

  useEffect(() => {
    if (!profileQuery) {
      // user wants to see their own profile, but must be authed
      if (isPending) return;
      if (!authData) {
        authClient.signIn.social({
          provider: "google",
          callbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/profile`,
          errorCallbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/auth/error`,
        });
        return;
      }
    }
  }, [profileQuery, isPending, authData]);

  const { data: profileData, isPending: isProfilePending } = useQuery(
    webClientORPC.users.getUser.queryOptions({
      input: { email: profileQuery ?? authData?.user.email ?? undefined },
      enabled: profileQuery !== null || (!isPending && authData !== null),
      retry: false,
    })
  );

  const { data: posts } = useQuery(
    webClientORPC.posts.getPosts.queryOptions({
      enabled: !isPending,
      input: { createdBy: profileQuery ? profileQuery : authData?.user.email },
    })
  );

  if (isPending || isProfilePending) return <LoadingProfile />;
  if (!profileData) return <NoProfile />;

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {posts && posts.length > 0 && <ExpandedPostLayer loadedFeedPosts={posts} />}
      <CreatePostLayer />
      <div
        className={`mt-5 grid grid-cols-1 justify-items-center overflow-hidden rounded-full border border-secondary bg-primary p-5 px-10 text-foreground transition-[width] duration-700 ease-out ${mounted ? "w-1/2" : "w-0"} md:grid-cols-2 md:justify-between md:justify-items-stretch`}
      >
        {mounted && (
          <>
            <Image
              src={profileData?.image ?? "https://picsum.photos/id/237/200/200"}
              alt="profile picture"
              width="100"
              height="100"
              className="mr-0 mb-5 rounded-full md:mr-10 md:mb-0"
            />
            <div className="flex flex-col items-center gap-2 md:items-end">
              <p className="text-center font-bold text-2xl md:text-end">{profileData?.email ?? profileQuery}</p>
              <p>{posts?.length ?? "No"} posts</p>
            </div>
          </>
        )}
      </div>

      {posts && posts.length > 0 ? (
        //TODO: correct overflow-y-auto hotfix
        <div className="relative mt-10 flex w-3/4 flex-col items-center justify-center gap-5 overflow-y-auto rounded-md border-2 border-foreground bg-accent">
          <div>
            <p className={"mt-5 font-bold text-2xl"}>POSTS</p>
            <div className="w-full border border-foreground" />
          </div>
          <div className={"flex w-full px-10"}>
            <MasonryLayout>
              {posts
                ?.slice()
                .reverse()
                .map((post) => (
                  <MasonryElement key={post._id} className="bg-primary" postData={post} />
                ))}
            </MasonryLayout>
          </div>
        </div>
      ) : (
        <div className="relative mt-10 flex h-[50vh] w-3/4 flex-col items-center justify-center gap-5 rounded-md border-2 border-foreground bg-accent">
          <div>No posts found.</div>
        </div>
      )}
    </div>
  );
}
