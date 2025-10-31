"use client";

import { Button } from "@swapparel/shad-ui/components/button";
import { Loader } from "lucide-react";
import { authClient } from "../../lib/auth-client";

export default function SignInOutButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="p-8">
        <Button disabled>
          <Loader className="animate-spin" />
        </Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8">
        <Button
          onClick={() => {
            authClient.signIn.social(
              {
                provider: "google",
                callbackURL: "http://localhost:3000",
                errorCallbackURL: "http://localhost:3000/error",
              },
              {}
            );
          }}
        >
          Sign In with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 dark:bg-amber-800">
      <Button
        className=""
        onClick={() => {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                // console.log("Sign out successful");
              },
            },
          });
        }}
      >
        Sign Out!
      </Button>
    </div>
  );
}
