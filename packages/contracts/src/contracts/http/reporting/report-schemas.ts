import { z } from "zod";

export const DESCRIPTION_MAX_LENGTH = 500;

export const REPORT_USER_REASONS = [
  "Scam or fraudulent account",
  "Impersonation",
  "Harassment or bullying",
  "Hate speech",
  "Spam or bot account",
  "Posting inappropriate content",
  "Underage user",
  "Something else",
];

export const REPORT_POST_REASONS = [
  "Spam",
  "Nudity or sexual content",
  "Scam or fraud",
  "Item not as described / misleading",
  "Prohibited Item",
  "Harassment or hate speech",
  "Violence or dangerous content",
  "Intellectual property violation",
  "Something else",
];

export const userReportSchema = z.object({
  _id: z.uuidv7(),
  reporterId: z.uuidv7(),
  reportedUserId: z.uuidv7(),
  reason: z.enum(REPORT_USER_REASONS, "A report reason must be selected."),
  description: z.string().max(DESCRIPTION_MAX_LENGTH, `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`).optional(),
  createdAt: z.coerce.date(),
});

export const postReportSchema = z.object({
  _id: z.uuidv7(),
  reporterId: z.uuidv7(),
  reportedUserId: z.uuidv7(),
  reportedPostId: z.uuidv7(),
  reason: z.enum(REPORT_POST_REASONS, "A report reason must be selected."),
  description: z.string().max(DESCRIPTION_MAX_LENGTH, `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`).optional(),
  createdAt: z.coerce.date(),
});
