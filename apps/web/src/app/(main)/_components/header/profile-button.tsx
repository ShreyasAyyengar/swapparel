"use client";
import { LoaderCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { env } from "../../../../env";
import { authClient } from "../../../../lib/auth-client";

export default function ProfileButton() {
  const router = useRouter();
  const { data: authData, isPending } = authClient.useSession();

  if (isPending)
    return (
      <LoaderCircle
        width={37.5}
        height={37.5}
        className="animate-spin text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
      />
    );

  const handleClick = () => {
    if (!authData) {
      authClient.signIn.social({
        provider: "google",
        callbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/profile`,
        errorCallbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/auth/error`,
      });
      return null;
    }
    router.push("/profile");
  };
  return (
    <User
      width={37.5}
      height={37.5}
      onClick={handleClick}
      className={
        "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
      }
    />
  );
}
