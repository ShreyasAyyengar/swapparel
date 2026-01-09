import { Badge } from "@swapparel/shad-ui/components/badge";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { authClient } from "../../../../lib/auth-client";

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]); //TODO: replace with [] when done
  const [messageText, setMessageText] = useState("");
  const { data: authData } = authClient.useSession();

  const containerRef = useRef<HTMLDivElement>(null);

  function getText(formData: FormData) {
    const text = formData.get("messageInput") as string;
    setMessages((prevState) => [...prevState, text]);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className={"relative m-5 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto rounded-md border border-secondary p-5"} ref={containerRef}>
      <div className="flex flex-1 flex-col gap-5">
        {messages.length > 0 ? (
          messages.map((message, i) => <Badge key={i}>{message}</Badge>)
        ) : (
          <div className={"flex h-full w-full items-center justify-center"}>
            <p>No Messages to be Found...</p>
          </div>
        )}
      </div>

      <form
        className="sticky bottom-0 flex w-full items-center rounded-md border border-secondary bg-background"
        action={getText}
        onSubmit={(e) => {
          e.preventDefault();
          if (!messageText.trim()) return; // prevent empty submit
          const formData = new FormData(e.currentTarget);
          getText(formData);
          e.currentTarget.reset();
          setMessageText("");
        }}
      >
        <input
          type="text"
          name="messageInput"
          placeholder="Enter a message"
          className="ml-1 w-full p-1 focus:outline-0"
          required
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
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
