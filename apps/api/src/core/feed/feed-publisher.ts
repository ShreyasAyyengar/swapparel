import { MemoryPublisher } from "@orpc/experimental-publisher/memory";
import type { feedSubscriptionPayload } from "@swapparel/contracts";
import type { z } from "zod";

type FeedEvents = Record<string, z.infer<typeof feedSubscriptionPayload>>;

export const feedPublisher = new MemoryPublisher<FeedEvents>({
  resumeRetentionSeconds: 60 * 5, // Keep events for 5 minutes to support reconnection
});
