"use client";

import { Menu } from "lucide-react";

export default function MenuButton() {
  const openMenu = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Menu");
  };
  return <Menu width={50} height={50} onClick={openMenu} className="cursor-pointer" />;
}
