import { z } from "zod";

export const ratingSchema = z.object({
  _id: z.uuidv7(),
  raterEmail: z.email(),
  ratedUserEmail: z.email(),
  transactionId: z.string(),
  value: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
});
