import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 300;

export const messageContent = z.string().trim().min(1).max(MAX_MESSAGE_LENGTH);

export const messageSchema = z.object({
  _id: z.uuidv7(),
  authorId: z.string(),
  transactionId: z.uuidv7(),
  createdAt: z.coerce.date(),
  editedAt: z.coerce.date().optional(),
  content: z.array(messageContent), // queue: 0th index is the latest, all next are most recent edits
});
