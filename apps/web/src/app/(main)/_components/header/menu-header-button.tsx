"use client";

import { Menu } from "lucide-react";

export default function MenuHeaderButton() {
  const openMenu = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Menu");
  };
  return (
    <Menu
      width={37.5}
      height={37.5}
      onClick={openMenu}
      className={
        "duration-100 ease-in hover:scale-110 hover:cursor-pointer "
      }
    />
  );
}
