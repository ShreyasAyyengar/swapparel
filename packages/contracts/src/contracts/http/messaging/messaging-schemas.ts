import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 300;

export const messageSchema = z.object({
  _id: z.uuidv7(),
  authorId: z.string(),
  transactionId: z.uuidv7(),
  createdAt: z.coerce.date(),
  editedAt: z.coerce.date().optional(),
  content: z.array(z.string()).max(MAX_MESSAGE_LENGTH), // queue: 0th index is the latest, all next are most recent edits
});
