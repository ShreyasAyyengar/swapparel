import { feedRouter } from "./core/feed/feed-router";
import { postRouter } from "./core/post/post-router";

export const appRouter = {
  posts: postRouter,
  feed: feedRouter,
};
