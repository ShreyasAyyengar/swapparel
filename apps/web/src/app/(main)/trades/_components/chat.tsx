import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { authClient } from "../../../../lib/auth-client";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import Message from "./message";

export default function Chat({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
  const [messages, setMessages] = useState<z.infer<typeof messageSchema>[]>([]);
  const [messageText, setMessageText] = useState("");
  const { data: authData } = authClient.useSession();

  useEffect(() => {
    let cancelled = false;

    const watchTransaction = async () => {
      try {
        for await (const msg of await socketClientORPC.subscribeToChatMessages({ transactionId: transaction._id })) {
          setMessages((prevState) => [...prevState, msg.incomingMessage]);
          if (cancelled) break;
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error watching transaction:", error);
        }
      }
    };

    watchTransaction();

    return () => {
      cancelled = true;
      // If your socketClientORPC has a cleanup/unsubscribe method, call it here
    };
  }, [transaction._id]);

  useEffect(() => {
    const sortedMessages = [...transaction.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setMessages(sortedMessages);
  }, [transaction.messages]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className={"relative m-5 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto rounded-md border border-secondary p-5"} ref={containerRef}>
      <div className="flex flex-1 flex-col gap-1">
        {messages.length > 0 ? (
          messages.map((message, i) => <Message key={i} message={message} prevMessage={messages[i - 1]} transaction={transaction} />)
        ) : (
          <div className={"flex h-full w-full items-end justify-center"}>
            <p className="mb-10 font-semibold text-3xl">No messages sent yet...</p>
          </div>
        )}
      </div>

      <form
        className="sticky bottom-0 flex w-full items-center rounded-md border border-secondary bg-background"
        onSubmit={(e) => {
          e.preventDefault();
          if (!messageText.trim()) return; // prevent empty submit

          // sending message to backend through websocket
          socketClientORPC.publishChatMessage({
            transactionId: transaction._id,
            message: {
              authorEmail: authData.user.email,
              content: messageText,
              createdAt: new Date().toISOString(),
            },
          });

          e.currentTarget.reset();
          setMessageText("");
        }}
      >
        <input
          type="text"
          name="messageInput"
          placeholder="Enter a message"
          className="ml-1 h-full w-full p-2 focus:outline-0"
          required
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          autoComplete="off"
        />

        <button
          type="submit"
          className={`m-2 cursor-pointer rounded-md bg-primary p-2 transition-opacity ${messageText.trim() ? "opacity-100" : "pointer-events-none opacity-50"}`}
        >
          <Send />
        </button>
      </form>
    </div>
  );
}
