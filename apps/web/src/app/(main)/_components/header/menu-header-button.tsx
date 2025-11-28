"use client";

import { Menu } from "lucide-react";

export default function MenuHeaderButton() {
  const openMenu = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Menu");
  };
  // TODO FIX FUCKASS ROTATE
  return (
    <Menu
      width={37.5}
      height={37.5}
      onClick={openMenu}
      className={
        "text-background duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary-foreground dark:hover:text-primary"
      }
    />
  );
}
