import Link from "next/link";
import CreatePostButton from "./create-post-button";
import MenuButton from "./menu-button";
import MessagesButton from "./messages-button";
import SlimBanner from "./simple-banner-slim.svg";
import ThemeChanger from "./theme-changer";

export default function Header() {
  // TODO make header not look like shit-brown on dark mode
  return (
    <header className="sticky inset-0 top-0 flex items-center bg-primary-800 p-3 dark:bg-foreground">
      <Link href={"/feed"}>
        <SlimBanner // TODO figure out stroke widths
          className="-translate-x-1/2 -translate-y-1/2 stroke absolute top-1/2 left-1/2 fill-background p-2 transition ease-in hover:scale-110 hover:fill-accent dark:hover:fill-primary"
          height={175}
          width={175}
        />
      </Link>
      <MenuButton />
      <div className="ml-auto flex items-center gap-6">
        <ThemeChanger />
        <CreatePostButton />
        <MessagesButton />
      </div>
    </header>
  );
}
