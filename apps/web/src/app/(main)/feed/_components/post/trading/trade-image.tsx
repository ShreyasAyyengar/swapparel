import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function TradingImage({ images }: { images: string[] }) {
  const [isHovered, setHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className={"relative"} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex max-h-[calc(83vh-80px)] items-center justify-center overflow-y-auto rounded-md border-2 border-secondary">
        <Image
          src={images[currentImage] ?? ""}
          width={1200}
          height={1200}
          alt={"expanded-image"}
          className="flex w-full items-center justify-center"
        />
      </div>
      <p className={"absolute bottom-3 left-4 rounded-md bg-black/30 px-2 backdrop-blur-lg"}>
        {currentImage + 1} / {images.length}
      </p>
      {isHovered && currentImage < images.length - 1 && (
        <ChevronRight
          className="absolute top-1/2 right-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-lg"
          size={12}
          onClick={() => setCurrentImage((prev) => prev + 1)}
        />
      )}
      {isHovered && currentImage > 0 && (
        <ChevronLeft
          className="absolute top-1/2 left-4 z-10 h-10 w-10 translate-y-[-50%] cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-lg"
          size={12}
          onClick={() => setCurrentImage((prev) => prev - 1)}
        />
      )}
    </div>
  );
}
