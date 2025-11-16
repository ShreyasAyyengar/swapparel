import { implement } from "@orpc/server";
import { feedRouter } from "./core/feed/feed-router";
import { postRouter } from "./core/post/post-router";
import type { AuthContext } from "./libs/http-context";
import { contract } from "@swapparel/contracts";

export const appRouter = implement(contract).$context<AuthContext>().router({
  posts: postRouter,
  feed: feedRouter,
});
