"use client";

import { MessageCircleMore } from "lucide-react";

export default function MessagesButton() {
  const openMsg = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Messages");
  };
  return <MessageCircleMore width={40} height={40} onClick={openMsg} className="cursor-pointer" />;
}
