import type { internalPostSchema, transactionSchemaWithAvatar } from "@swapparel/contracts";
import type { z } from "zod";

export default function SelectedTrade({
  transaction,
  post,
}: {
  transaction: z.infer<typeof transactionSchemaWithAvatar>;
  post: z.infer<typeof internalPostSchema>;
}) {
  return <div>{post.createdBy}</div>;
}
