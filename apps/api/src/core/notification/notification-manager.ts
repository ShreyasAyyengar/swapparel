import { MemoryPublisher } from "@orpc/experimental-publisher/memory";
import type { notificationSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { logger } from "../../libs/logger";
import { NotificationService } from "./notification-service";

type NotificationEvent = {
  notification: z.infer<typeof notificationSchema>;
};

// biome-ignore lint/style/noMagicNumbers: publisher retention is intentionally five minutes.
const RESUME_RETENTION_SECONDS = 60 * 5;

export const notificationPublisher = new MemoryPublisher<Record<string, NotificationEvent>>({
  resumeRetentionSeconds: RESUME_RETENTION_SECONDS,
});

type InsertNotificationParams = {
  recipientId: string;
  type: z.infer<typeof notificationSchema.shape.type>;
  transactionId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  messagePreview?: string;
};

export async function insertNotification(params: InsertNotificationParams): Promise<void> {
  const notification: z.infer<typeof notificationSchema> = {
    _id: uuidv7(),
    recipientId: params.recipientId,
    type: params.type,
    transactionId: params.transactionId ?? undefined,
    actorName: params.actorName,
    actorAvatarUrl: params.actorAvatarUrl,
    messagePreview: params.messagePreview,
    read: false,
    createdAt: new Date(),
  };

  try {
    await NotificationService.insertOne(notification);
    await notificationPublisher.publish(params.recipientId, { notification });
  } catch (error) {
    logger.error({ error, recipientId: params.recipientId }, "Failed to insert notification");
  }
}
