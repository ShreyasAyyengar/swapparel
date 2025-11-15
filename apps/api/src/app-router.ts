import { feedRouter } from "./core/feed/feed-router";
import { postRouter } from "./core/post/post-router";

export const appRouter = {
  // routeURL: route handlers
  posts: postRouter,
  feed: feedRouter,
};
