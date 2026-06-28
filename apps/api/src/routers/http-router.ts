import { commentRouter } from "../core/comments/comment-router";
import { feedRouter } from "../core/feed/feed-router";
import { postRouter } from "../core/post/post-router";
import { ratingRouter } from "../core/rating/rating-router";
import { s3Router } from "../core/s3/s3-router";
import { transactionRouter } from "../core/swap/transaction-router";
import { userRouter } from "../core/users/user-router";

export const httpRouter = {
  posts: postRouter,
  comments: commentRouter,
  feed: feedRouter,
  ratings: ratingRouter,
  transaction: transactionRouter,
  users: userRouter,
  s3: s3Router,
};
