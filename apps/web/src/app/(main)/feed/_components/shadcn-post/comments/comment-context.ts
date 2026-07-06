import type { postSchema } from "@swapparel/contracts";
import { createContext, useContext } from "react";
import type { z } from "zod";

export const CommentContext = createContext<{ post: z.infer<typeof postSchema> } | null>(null);

export function useCommentContext() {
  const value = useContext(CommentContext);
  if (!value) throw new Error("useCommentContext must be used within a CommentContext.Provider");
  return value;
}
