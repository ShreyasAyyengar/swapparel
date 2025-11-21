import Image from "next/image";
import Link from "next/link";
import CreatePostButton from "./create-post-button";
import MenuButton from "./menu-button";
import MessagesButton from "./messages-button";

export default function Header() {
  return (
    <header className="sticky inset-0 top-0 flex items-center bg-secondary p-3">
      <MenuButton />
      <Link href={"/feed"}>
        <Image
          className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
          src="/simple-banner-slim.png"
          alt="banner-logo"
          width={150}
          height={10}
        />
      </Link>
      <div className="ml-auto flex items-center gap-6">
        <CreatePostButton />
        <MessagesButton />
      </div>
    </header>
  );
}
