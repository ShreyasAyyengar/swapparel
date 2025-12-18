import { cndContract } from "./cdn-contract";
import { feedContract } from "./feed-contract";
import { postContract } from "./post-contract";
import { swapContract } from "./swap-contract";

export const contract = {
  // route URL: contract handler
  posts: postContract,
  feed: feedContract,
  cdn: cndContract,
  swap: swapContract,
};
