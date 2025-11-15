import { SlidersHorizontal, MessageCircleMore, Menu } from "lucide-react";
import Image from "next/image";
import Search from "./search-bar"

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-secondary p-4">
        <Menu width={50} height={50} />
        <Search />
        <Image src="/simple-banner-slim.png" alt="banner-logo" width={200} height={10} />
        <MessageCircleMore width={40} height={40}/>
    </header>
  );
}
