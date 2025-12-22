import Image from "next/image";

type PostImage = {
  imageSRC: string[];
  currentImageCount: number;
};

export default function PostImage({ imageSRC, currentImageCount = 0 }: PostImage) {
  return (
    <div className="relative shrink-0 items-center" role="presentation">
      <Image src={imageSRC[currentImageCount] ?? ""} alt="gallery" width={350} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
      <p>
        {currentImageCount + 1} / {imageSRC.length}
      </p>
    </div>
  );
}
