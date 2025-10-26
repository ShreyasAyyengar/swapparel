import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { env } from "../env";

export const auth_client = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL, // The base URL for the API (where auth-server is running)
  plugins: [inferAdditionalFields()],
});
