import Image from "next/image";
import MenuButton from "./menu-button";
import MessagesButton from "./messages-button";

export default function Header() {
  return (
    <header className="relative flex items-center bg-secondary p-7">
      <MenuButton />
      <Image
        className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
        src="/simple-banner-slim.png"
        alt="banner-logo"
        width={200}
        height={10}
      />
      <div className="ml-auto flex items-center gap-9">
        <MessagesButton />
      </div>
    </header>
  );
}
