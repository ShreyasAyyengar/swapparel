import { MemoryPublisher } from "@orpc/experimental-publisher/memory";
import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import type { z } from "zod";

type TransactionEvents = Record<z.infer<typeof transactionSchema.shape._id>, { incomingMessage: z.infer<typeof messageSchema> }>;

export const transactionPublisher = new MemoryPublisher<TransactionEvents>({
  resumeRetentionSeconds: 60 * 5, // Keep events for 5 minutes to support reconnection
});

export const transactionDataPublisher = new MemoryPublisher<Record<string, { initiatedBy: string }>>({
  resumeRetentionSeconds: 60 * 5, // Keep events for 5 minutes to support reconnection
});
