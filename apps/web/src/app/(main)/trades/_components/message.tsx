import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import { cn } from "@swapparel/shad-ui/lib/utils";
import Image from "next/image";
import type { z } from "zod";
import { authClient } from "../../../../lib/auth-client";

export default function Message({
  message,
  transaction,
}: {
  message: z.infer<typeof messageSchema>;
  transaction: z.infer<typeof transactionSchema>;
}) {
  const { data, isPending } = authClient.useSession();
  // biome-ignore lint/style/noNonNullAssertion: useSession(); has been called before this component in the tree
  const authData = data!;
  const MESSAGECHUNK = 25;

  const fromSelf = message.authorEmail === authData.user.email;

  function chunkWords(str: string, max = MESSAGECHUNK) {
    const words = str.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      // If the word itself is longer than max, we need to split it
      if (word.length > max) {
        // Flush current line first
        if (current) {
          lines.push(current.trim());
          current = "";
        }

        // Split the long word into chunks
        for (let i = 0; i < word.length; i += max) {
          lines.push(word.slice(i, i + max));
        }
      } else {
        // Normal word logic
        if ((current + word).length > max) {
          lines.push(current.trim());
          current = `${word} `;
        } else {
          current += `${word} `;
        }
      }
    }

    if (current) lines.push(current.trim());
    return lines;
  }

  // which ever one matches the auth data

  const avatarURL =
    message.authorEmail === transaction.seller.email ? transaction.seller.avatarURL : transaction.buyer.avatarURL || "/default-avatar.png";
  return (
    <div className={"flex items-center"}>
      {!fromSelf && <Image src={avatarURL || "/default-avatar.png"} alt="Avatar" className="mr-2 h-8 w-8 rounded-full" width={10} height={10} />}
      <div
        className={cn(
          "flex flex-col rounded-md p-2 text-foreground",
          fromSelf ? "ml-auto bg-secondary text-background" : "mr-auto bg-primary text-foreground"
        )}
      >
        {chunkWords(message.content, MESSAGECHUNK).map((chunk, i) => (
          <p key={i} className="leading-snug">
            {chunk}
          </p>
        ))}
      </div>

      {fromSelf && <Image src={avatarURL || "/default-avatar.png"} alt="Avatar" className="ml-2 h-8 w-8 rounded-full" width={10} height={10} />}
    </div>
  );
}
