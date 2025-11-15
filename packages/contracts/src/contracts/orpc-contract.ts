import { feedContract } from "./feed-contract";
import { postContract } from "./post-contract";

export const contract = {
  // route URL: contract handler
  posts: postContract,
  feed: feedContract,
};
