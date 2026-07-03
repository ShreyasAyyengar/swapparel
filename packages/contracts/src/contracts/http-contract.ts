import { commentContract } from "./http/comments/comment-contract";
import { feedContract } from "./http/feed/feed-contract";
import { notificationContract } from "./http/notification/notification-contract";
import { postContract } from "./http/post/post-contract";
import { ratingContract } from "./http/rating/rating-contract";
import { postReportContract, userReportContract } from "./http/reporting/report-contract";
import { s3Contract } from "./http/s3/s3-contract";
import { transactionContract } from "./http/transaction/transaction-contract";
import { userContract } from "./http/user/user-contract";

export const httpContract = {
  // route URL: contract handler
  posts: postContract,
  comments: commentContract,
  feed: feedContract,
  ratings: ratingContract,
  userReport: userReportContract,
  postReport: postReportContract,
  transaction: transactionContract,
  users: userContract,
  s3: s3Contract,
  notifications: notificationContract,
};
