import { postRouter } from "./core/post/post-router.ts";

export const appRouter = {
  // routeURL: route handlers
  posts: postRouter,
};
