import { SlidersHorizontal } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="m-4 flex justify-center">
      <Image src="/simple-banner-slim.png" alt={""} width={200} height={10} />
      <SlidersHorizontal />
    </header>
  );
}
