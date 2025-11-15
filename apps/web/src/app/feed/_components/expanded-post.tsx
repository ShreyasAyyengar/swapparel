import type { internalPostSchema } from "@swapparel/contracts";
import Image from "next/image";
import type z from "zod";

export default function ExpandedPost({ postData }: { postData: z.infer<typeof internalPostSchema> }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Image src={postData.images[0] ?? ""} alt="thumbnail" width={200} height={200} className="rounded-md border-2 border-[#6F4D3880]" />
    </div>
  );
}
