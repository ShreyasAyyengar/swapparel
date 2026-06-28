import { commentContract } from "./http/comments/comment-contract";
import { feedContract } from "./http/feed/feed-contract";
import { postContract } from "./http/post/post-contract";
import { ratingContract } from "./http/rating/rating-contract";
import { transactionContract } from "./http/transaction/transaction-contract";
import { userContract } from "./http/user/user-contract";
import { s3Contract } from "./http/s3/s3-contract";

export const httpContract = {
  // route URL: contract handler
  posts: postContract,
  comments: commentContract,
  feed: feedContract,
  ratings: ratingContract,
  transaction: transactionContract,
  users: userContract,
  s3: s3Contract,
};
