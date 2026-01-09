import { feedContract } from "./feed-contract";
import { postContract } from "./post-contract";
import { transactionContract } from "./transaction-contract";
import { userContract } from "./user-contract";

export const contract = {
  // route URL: contract handler
  posts: postContract,
  feed: feedContract,
  transaction: transactionContract,
  users: userContract,
};
