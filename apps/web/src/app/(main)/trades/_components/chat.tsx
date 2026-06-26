import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import Message from "./message";

export default function Chat({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
  const [messages, setMessages] = useState<z.infer<typeof messageSchema>[]>([]);
  const [messageText, setMessageText] = useState("");
  const { data: chatHistory, isPending } = useQuery(
    webClientORPC.transaction.getMessageHistory.queryOptions({ input: { transactionId: transaction._id } })
  );

  useEffect(() => {
    const sortedMessages = [...(chatHistory?.messages ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setMessages(sortedMessages);
  }, [chatHistory?.messages]);

  useEffect(() => {
    let aborted = false;

    const watchTransaction = async () => {
      try {
        for await (const msg of await socketClientORPC.messaging.subscribeTransactionChat({ transactionId: transaction._id })) {
          if (aborted) break;

          setMessages((prevState) => [...prevState, msg.incomingMessage]);
        }
      } catch {
        // The subscription is expected to close when the selected trade changes.
      }
    };

    watchTransaction();

    return () => {
      aborted = true;
    };
  }, [transaction._id]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-2/5 rounded-2xl" />
            <Skeleton className="ml-auto h-16 w-1/2 rounded-2xl" />
            <Skeleton className="h-10 w-1/3 rounded-2xl" />
          </div>
        ) : messages.length > 0 ? (
          <div className="flex min-h-full flex-col justify-end gap-1">
            {messages.map((message, i) => (
              <Message key={message._id} message={message} prevMessage={messages[i - 1]} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <MessageCircle className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No messages yet</p>
              <p className="text-muted-foreground text-sm">Start the conversation about this trade.</p>
            </div>
          </div>
        )}
      </div>

      <form
        className="flex items-end gap-2 border-border border-t bg-background p-3 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const message = messageText.trim();
          if (!message) return;

          socketClientORPC.messaging.publishChatMessage({
            transactionId: transaction._id,
            message,
          });

          setMessageText("");
        }}
      >
        <textarea
          name="messageInput"
          placeholder="Message about this trade..."
          className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          required
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          autoComplete="off"
          rows={1}
        />
        <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl" disabled={!messageText.trim()} aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
