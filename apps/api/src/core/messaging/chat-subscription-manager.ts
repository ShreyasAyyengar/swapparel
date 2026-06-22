import { MemoryPublisher } from "@orpc/experimental-publisher/memory";
import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import type { z } from "zod";

type TransactionId = z.infer<typeof transactionSchema.shape._id>;
type ChatEvent = {
  edited: boolean;
  incomingMessage: z.infer<typeof messageSchema>;
};

// biome-ignore lint/style/noMagicNumbers: publisher retention is intentionally five minutes.
const RESUME_RETENTION_SECONDS = 60 * 5;

export const transactionChatPublisher = new MemoryPublisher<Record<TransactionId, ChatEvent>>({
  resumeRetentionSeconds: RESUME_RETENTION_SECONDS,
});

export const transactionDataPublisher = new MemoryPublisher<Record<TransactionId, { initiatedBy: string }>>({
  resumeRetentionSeconds: RESUME_RETENTION_SECONDS,
});
