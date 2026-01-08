"use client";
import {User} from "lucide-react";
import {useRouter} from "next/navigation";

export default function ProfileButton() {
  const router = useRouter();

  return (
    <User
      width={37.5}
      height={37.5}
      onClick={() => {
        router.push("/profile");
      }}
      className={
        "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
      }
    />
  );
}
