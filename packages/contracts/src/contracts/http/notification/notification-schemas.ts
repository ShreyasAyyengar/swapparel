import { z } from "zod";

export const notificationTypeSchema = z.enum(["trade_request", "trade_completed", "new_message"]);

export const notificationSchema = z.object({
  _id: z.uuidv7(),
  recipientId: z.uuidv7(),
  type: notificationTypeSchema,
  transactionId: z.uuidv7().optional(),
  actorName: z.string().optional(),
  actorAvatarUrl: z.string().optional(),
  messagePreview: z.string().optional(),
  read: z.boolean().default(false),
  createdAt: z.date(),
});
