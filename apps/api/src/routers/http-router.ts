import { commentRouter } from "../core/comments/comment-router";
import { feedRouter } from "../core/feed/feed-router";
import { postRouter } from "../core/post/post-router";
import { transactionRouter } from "../core/swap/transaction-router";
import { userRouter } from "../core/users/user-router";

export const httpRouter = {
  posts: postRouter,
  comments: commentRouter,
  feed: feedRouter,
  transaction: transactionRouter,
  users: userRouter,
};
