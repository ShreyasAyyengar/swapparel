import type { internalPostSchema } from "@swapparel/contracts";
import type z from "zod";
import ExpandedImage from "./expanded-image";

export default function ExpandedPost({ postData, onClose }: { postData: z.infer<typeof internalPostSchema>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex h-150 w-200 rounded-2xl bg-accent p-10 text-primary">
        <div className="relative flex-shrink-0 items-center">
          {/*<Image src={postData.images[0] ?? ""} alt="thumbnail" width={350} height={200} className="rounded-md border-2 border-[#6F4D3880]" />*/}
          {/*<ChevronLeft*/}
          {/*  type="button"*/}
          {/*  className="-translate-y-1/2 absolute top-1/2 left-3 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"*/}
          {/*/>*/}
          {/*<ChevronRight*/}
          {/*  type="button"*/}
          {/*  className="-translate-y-1/2 absolute top-1/2 right-3 h-10 w-10 cursor-pointer rounded-full bg-white/20 p-2 backdrop-blur-sm"*/}
          {/*/>*/}
          <ExpandedImage imageSRC={postData.images[0] ?? ""} />
        </div>
        <div className="ml-8 flex flex-col">
          <p title="username">{postData.createdBy}</p>
          <p>{postData.description}</p>
        </div>
      </div>
    </div>
  );
}
