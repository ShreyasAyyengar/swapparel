"use client";

import { cn } from "@swapparel/shad-ui/lib/utils";
import { CopyPlus } from "lucide-react";
import { useQueryState } from "nuqs";
import random from "random";
import { useState } from "react";
import { env } from "../../../../env";
import { authClient } from "../../../../lib/auth-client";

export default function CreatePostHeaderButton() {
  const { data } = authClient.useSession();
  const [_, setIsCreating] = useQueryState("create");
  const [bool, setBool] = useState(false);

  const validateCreate = () => {
    if (data?.session) {
      setIsCreating("");
    } else {
      authClient.signIn.social({
        provider: "google",
        callbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/feed?create`,
        errorCallbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/auth/error`,
      });
    }
  };

  return (
    <CopyPlus
      width={37.5}
      height={37.5}
      onClick={() => validateCreate()}
      onMouseEnter={() => {
        setBool(random.boolean());
      }}
      className={cn(
        "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary",
        bool ? "hover:-rotate-10" : "hover:rotate-10"
      )}
    />
  );
}
