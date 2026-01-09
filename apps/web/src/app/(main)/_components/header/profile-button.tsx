"use client";
import {User} from "lucide-react";
import {useRouter} from "next/navigation";
import {authClient} from "../../../../lib/auth-client";

export default function ProfileButton() {
  const router = useRouter();
  const { data: authData } = authClient.useSession();

  const handleClick = () => {
    const email = authData?.user?.email ?? "test@ucsc.edu";
    router.push(`/profile?profile=${encodeURIComponent(email)}`);
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
