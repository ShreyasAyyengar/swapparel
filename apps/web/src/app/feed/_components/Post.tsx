import type { internalPostSchema } from "@swapparel/contracts";
import Image from "next/image";
import type z from "zod";

export default function Post({ postData }: { postData: z.infer<typeof internalPostSchema> }) {
  // use effect
  return (
    <button type="button">
      <Image src={postData.images[0]} alt="thumbnail" />
    </button>
  );
}
