import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function ExpandedImage({ imageSRC }: { imageSRC: string }) {
  return (
    <>
      <Image src={imageSRC} alt="thumbnail" width={350} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
      <ChevronLeft
        type="button"
        className="-translate-y-1/2 absolute top-1/2 left-3 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
      />
      <ChevronRight
        type="button"
        className="-translate-y-1/2 absolute top-1/2 right-3 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
      />
    </>
  );
}
