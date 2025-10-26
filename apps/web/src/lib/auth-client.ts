import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "../env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL, // The base URL for the API (where auth-server is running)
  plugins: [inferAdditionalFields()],
});
