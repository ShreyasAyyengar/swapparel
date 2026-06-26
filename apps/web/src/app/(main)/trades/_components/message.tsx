import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import { cn } from "@swapparel/shad-ui/lib/utils";
import Image from "next/image";
import type { z } from "zod";
import { authClient } from "../../../../lib/auth-client";

export default function Message({
  message,
  prevMessage,
  transaction,
}: {
  message: z.infer<typeof messageSchema>;
  prevMessage?: z.infer<typeof messageSchema>;
  transaction: z.infer<typeof transactionSchema>;
}) {
  const { data, isPending } = authClient.useSession();
  if (isPending || !data) return null;

  const sameAuthorAsPrev = prevMessage?.authorId === message.authorId;
  const fromSelf = message.authorId === data.user.id;
  const author = message.authorId === transaction.seller.userId ? transaction.seller : transaction.buyer;
  const avatarURL = author.avatarUrlSnapshot || "/default-avatar.png";
  const content = message.content[0] ?? "";

  return (
    <div className={cn("flex items-end", fromSelf && "justify-end")}>
      {!fromSelf && (
        <Image
          src={avatarURL || "/default-avatar.png"}
          alt="Avatar"
          className={cn("mr-2 size-7 rounded-full object-cover", sameAuthorAsPrev && "invisible")}
          width={28}
          height={28}
          unoptimized
        />
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
          fromSelf ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
          sameAuthorAsPrev ? "mt-0.5" : "mt-3"
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
        <p className={cn("mt-1 text-[10px]", fromSelf ? "text-primary-foreground/65" : "text-muted-foreground")}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
