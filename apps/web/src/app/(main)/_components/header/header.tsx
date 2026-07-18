import Link from "next/link";
import CreatePostDialog from "../../feed/_create/create-post-dialog";
import NotificationButton from "./notification-button";
import ProfileButton from "./profile-button";
import SlimBanner from "./simple-banner-slim.svg";
import SwapsHeaderButton from "./swaps-header-button";
import ThemeChanger from "./theme-changer";

export default function Header() {
  return (
    <header className="relative inset-0 top-0 z-1 flex items-center bg-secondary p-3">
      <Link href="/feed">
        <SlimBanner
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-foreground transition ease-in hover:scale-110 hover:fill-accent dark:hover:fill-primary"
          width={175}
          height={58}
        />
      </Link>
      <div className="mr-auto flex items-center gap-6">
        {/*<MenuHeaderButton />*/}
        {/*  TODO<future>: revamp */}
        <ProfileButton />
        <NotificationButton />
      </div>

      <div className="ml-auto flex items-center gap-6">
        <ThemeChanger />
        <CreatePostDialog />
        <SwapsHeaderButton />
      </div>
    </header>
  );
}
