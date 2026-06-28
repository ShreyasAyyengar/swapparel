import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import { cn } from "@swapparel/shad-ui/lib/utils";
import Image from "next/image";
import type { z } from "zod";
import { authClient } from "../../../../lib/auth-client";

const getAttachmentImageClass = (count: number) => {
  if (count === 1) return "max-h-80 min-h-44";
  if (count === 2) return "h-36 sm:h-40";
  return "h-28 sm:h-32";
};

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
  const attachments = message.attachments ?? [];
  const hasAttachments = attachments.length > 0;

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
      <div className={cn("flex max-w-[82%] flex-col", fromSelf && "items-end", sameAuthorAsPrev ? "mt-0.5" : "mt-3")}>
        {hasAttachments && (
          <div
            className={cn(
              "mb-1.5 grid w-full min-w-48 max-w-sm overflow-hidden rounded-2xl border bg-background shadow-sm",
              attachments.length === 1 ? "grid-cols-1" : "grid-cols-2",
              fromSelf ? "rounded-br-md border-primary/20" : "rounded-bl-md border-border"
            )}
          >
            {attachments.map((attachmentUrl, index) => (
              <a
                key={attachmentUrl}
                href={attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className={cn("block overflow-hidden bg-muted", attachments.length > 1 && index > 1 && "border-border border-t")}
              >
                <Image
                  src={attachmentUrl}
                  alt={`Attachment ${index + 1}`}
                  className={cn(
                    "w-full object-cover transition-transform duration-200 hover:scale-[1.02]",
                    getAttachmentImageClass(attachments.length)
                  )}
                  width={720}
                  height={540}
                  unoptimized
                />
              </a>
            ))}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm",
            fromSelf ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
          <p className={cn("mt-1 text-[10px]", fromSelf ? "text-primary-foreground/65" : "text-muted-foreground")}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}
