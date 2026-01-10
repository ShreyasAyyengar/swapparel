import type { messageSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { cn } from "@swapparel/shad-ui/lib/utils";
import type { z } from "zod";
import { authClient } from "../../../../lib/auth-client";

export default function Message({ message, avatars }: { message: z.infer<typeof messageSchema>; avatars: Record<string, string> }) {
  const { data, isPending } = authClient.useSession();
  // biome-ignore lint/style/noNonNullAssertion: useSession(); has been called before this component in the tree
  const authData = data!;

  const fromSelf = message.authorEmail === authData.user.email;

  return (
    <Badge variant={fromSelf ? "secondary" : "default"} className={cn("flex", fromSelf && "ml-auto")}>
      {/*<Image src={message} alt="Avatar" className="mr-2 rounded-full" width={32} height={32} />*/}
      {message.content}
    </Badge>
  );
}
