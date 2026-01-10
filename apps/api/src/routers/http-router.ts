import { feedRouter } from "../core/feed/feed-router";
import { postRouter } from "../core/post/post-router";
import { transactionRouter } from "../core/swap/transaction-router";

export const httpRouter = {
  posts: postRouter,
  feed: feedRouter,
  transaction: transactionRouter,
};
