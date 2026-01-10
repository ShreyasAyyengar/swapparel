import type {messageSchema} from "@swapparel/contracts";
import {cn} from "@swapparel/shad-ui/lib/utils";
import type {z} from "zod";
import {authClient} from "../../../../lib/auth-client";

export default function Message({ message, avatars }: { message: z.infer<typeof messageSchema>; avatars: Record<string, string> }) {
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
      if ((current + word).length > max) {
        lines.push(current.trim());
        current = `${word} `;
      } else {
        current += `${word} `;
      }
    }

    if (current) lines.push(current.trim());
    return lines;
  }

  return (
    <>
      {/*<Badge variant={fromSelf ? "secondary" : "default"} className={cn("flex", fromSelf && "ml-auto")}>*/}
      {/*  /!*<Image src={message} alt="Avatar" className="mr-2 rounded-full" width={32} height={32} />*!/*/}
      {/*  {message.content}*/}
      {/*</Badge>*/}
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
    </>
  );
}
