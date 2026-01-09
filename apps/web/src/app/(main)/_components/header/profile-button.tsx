"use client";
import { LoaderCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
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

  if (!authData) return <div />; // TODO: sign in button

  const handleClick = () => {
    const email = authData.user.email;
    router.push(`/profile?profile=${encodeURIComponent(email)}`); //TODO: encodeURI???
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
