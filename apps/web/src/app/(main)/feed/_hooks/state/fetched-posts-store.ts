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
  addPosts: (newPosts) => set((state) => ({ fetchedPosts: [...state.fetchedPosts, ...newPosts] })),
  setPosts: (posts) => set({ posts }),
}));
