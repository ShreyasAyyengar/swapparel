import { feedContract } from "./feed-contract";
import { postContract } from "./post-contract";
import { transactionContract } from "./transaction-contract";

export const contract = {
  // route URL: contract handler
  posts: postContract,
  feed: feedContract,
  transaction: transactionContract,
};
