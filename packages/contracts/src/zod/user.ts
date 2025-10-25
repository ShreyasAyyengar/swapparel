import { z } from "zod";

export const user = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export type UserType = z.infer<typeof user>;