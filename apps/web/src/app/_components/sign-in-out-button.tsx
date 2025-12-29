"use client";

import { Button } from "@swapparel/shad-ui/components/button";
import { Loader } from "lucide-react";
import Image from "next/image";
import { authClient } from "../../lib/auth-client";

// TODO<landing> refactor this to just be a sign in button if no session, else profile skeleton -> profile PFP + dropdown.
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
      <Button
        variant="ghost"
        className="#bg-[#F2F2F2] rounded-2xl bg-primary text-primary-foreground"
        onClick={() => {
          authClient.signIn.social(
            {
              provider: "google",
              callbackURL: "http://localhost:3000/feed",
              errorCallbackURL: "http://localhost:3000/error",
            },
            {}
          );
        }}
      >
        <div className="flex items-center">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            alt="Google Logo"
            width={24}
            height={24}
            className="mr-2"
          />
          Sign In with Google
        </div>
      </Button>
    );
  }

  return (
    <Button
      className="rounded-2xl bg-[#F2F2F2] text-black"
      variant="ghost"
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
  );
}
