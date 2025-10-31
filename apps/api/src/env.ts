import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    // MongoDB connection string
    DATABASE_URL: z.string(),
    // BetterAuth secret
    BETTER_AUTH_SECRET: z.string(),
    // Google OAuth credentials
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    // Cloudflare R2 credentials
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
    CLOUDFLARE_R2_TOKEN_VALUE: z.string(),
    CLOUDFLARE_R2_BUCKET_NAME: z.string(),
  },

  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_PROJECT_NAME: z.string().min(1),
    NEXT_PUBLIC_API_URL: z.string().min(1),
    NEXT_PUBLIC_WEBSITE_URL: z.string().min(1),
    NEXT_PUBLIC_HOSTNAME: z.string().min(1),
    NEXT_PUBLIC_NODE_ENV: z.enum(["development", "production"]),
  },

  // biome-ignore lint/correctness/noUndeclaredVariables: It's there; trust.
  runtimeEnv: Bun.env,

  emptyStringAsUndefined: true,
});
