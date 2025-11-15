import {Menu, MessageCircleMore} from "lucide-react";
import Image from "next/image";

export default function Header() {
  const openMenu = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Menu");
  };

  const openMsg = () => {
    // biome-ignore lint/suspicious/noAlert: <testing>
    alert("Open Msg");
  };

  return (
    <header className="relative flex items-center bg-secondary p-7">
      <div className="flex items-center gap-9">
        <Menu width={50} height={50} onClick={openMenu} className="cursor-pointer" />
      </div>
      <Image
        className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
        src="/simple-banner-slim.png"
        alt="banner-logo"
        width={200}
        height={10}
      />
      <div className="ml-auto flex items-center gap-9">
        <MessageCircleMore width={40} height={40} onClick={openMsg} className="hover:cursor-pointer" />
      </div>
    </header>
  );
}
