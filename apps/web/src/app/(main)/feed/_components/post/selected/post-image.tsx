import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function PostImage({ imageSRC }: { imageSRC: string[] }) {
  const [currentImageCount, setCurrentImageCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const increaseImageCount = () => {
    if (currentImageCount === imageSRC.length - 1) {
      return;
    }
    setCurrentImageCount((prev) => prev + 1);
  };
  const decreaseImageCount = () => {
    if (currentImageCount === 0) {
      return;
    }
    setCurrentImageCount((prev) => prev - 1);
  };
  return (
    <div
      className="relative flex-shrink-0 items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="presentation"
    >
      <Image src={imageSRC[currentImageCount] ?? ""} alt="gallery" width={350} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
      {currentImageCount > 0 && isHovered && (
        <ChevronLeft
          type="button"
          className="-translate-y-1/2 absolute top-1/2 left-3 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
          onClick={decreaseImageCount}
        />
      )}
      {currentImageCount < imageSRC.length - 1 && isHovered && (
        <ChevronRight
          type="button"
          className="-translate-y-1/2 absolute top-1/2 right-3 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"
          onClick={increaseImageCount}
        />
      )}

      <p>
        {currentImageCount + 1} / {imageSRC.length}
      </p>
    </div>
  );
}
