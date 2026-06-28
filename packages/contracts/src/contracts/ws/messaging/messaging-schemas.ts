import { z } from "zod";

export const ATTACHMENT_MAX_IMAGE_SIZE_MB = 5;
export const BYTES_PER_KIB = 1024;
export const BYTES_PER_MB = BYTES_PER_KIB * BYTES_PER_KIB;

export const MAX_MESSAGE_LENGTH = 300;

export const messageContent = z.string().trim().min(1).max(MAX_MESSAGE_LENGTH);

export const messageSchema = z.object({
  _id: z.uuidv7(),
  authorId: z.string(),
  transactionId: z.uuidv7(),
  createdAt: z.coerce.date(),
  editedAt: z.coerce.date().optional(),
  content: z.array(messageContent), // queue: 0th index is the latest, all next are most recent edits
  attachments: z.array(z.string()).optional(), // either an S3 key (write) or a hydrated URL (read)
});
