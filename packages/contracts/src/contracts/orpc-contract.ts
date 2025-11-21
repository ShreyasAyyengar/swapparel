import { feedContract } from "./feed-contract";
import { postContract } from "./post-contract";
import { r2WriteContract } from "./r2-write-contract";
import { r2ReadContract } from "./r2-read-contract";
//import {} from "./r2-read-contract";

export const contract = {
  // route URL: contract handler
  posts: postContract,
  feed: feedContract,
  r2Write: r2WriteContract,
  r2Read: r2ReadContract,
};
