import type { internalPostSchema } from "@swapparel/contracts";
import type { z } from "zod";
import { create } from "zustand/react";

type FetchedPostsStore = {
  fetchedPosts: z.infer<typeof internalPostSchema>[];
  addPosts: (posts: z.infer<typeof internalPostSchema>[]) => void;
  setPosts: (posts: z.infer<typeof internalPostSchema>[]) => void;
};

export const useFetchedPostsStore = create<FetchedPostsStore>((set) => ({
  fetchedPosts: [],
  addPosts: (newPosts) =>
    set((state) => {
      // map to deduplicate by _id
      const postsMap = new Map(state.fetchedPosts.map((post) => [post._id, post]));

      newPosts.forEach((post) => {
        postsMap.set(post._id, post);
      });

      return { fetchedPosts: Array.from(postsMap.values()) };
    }),
  setPosts: (posts) => set({ fetchedPosts: posts }),
}));
