import { feedContract } from "./feed-contract";
import { postContract } from "./post-contract";
import { uploadUrlContract } from "./r2-contract";

export const contract = {
  // route URL: contract handler
  posts: postContract,
  feed: feedContract,
  uploadPhoto: uploadUrlContract,
};
