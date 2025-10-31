"use client";

import { authClient } from "../lib/auth-client";
import SignInOutButton from "./_components/sign-in-out-button";

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen p-8">
      <SignInOutButton />
    </div>
  );
}
