"use client";

import { Menu } from "lucide-react";
import random from "random";
import { useState } from "react";

export default function MenuButton() {
  const openMenu = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Menu");
  };

  const [hoverRotate, setHoverRotate] = useState<"rotate-10" | "-rotate-10">("rotate-10");
// TODO FIX FUCKASS ROTATE
  return (
    <Menu
      width={37.5}
      height={37.5}
      onClick={openMenu}
      onMouseEnter={() => setHoverRotate(random.boolean() ? "-rotate-10" : "rotate-10")}
      className={`hover:${hoverRotate} duration-100 ease-in hover:scale-110 hover:cursor-pointer hover:text-primary`}
    />
  );
}
