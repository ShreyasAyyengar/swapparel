import type {internalPostSchema} from "@swapparel/contracts";
import type z from "zod";
import ExpandedImage from "./expanded-image";

export default function ExpandedPost({ postData, onClose }: { postData: z.infer<typeof internalPostSchema>; onClose: () => void }) {
  const MAX_DESCRIPTION = 1000;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex h-150 w-200 rounded-2xl bg-accent p-10 text-primary">
        <ExpandedImage imageSRC={postData.images} />
        <div className="ml-8 flex h-130 w-90 flex-col overflow-auto border-2 border-primary p-2">
          <p title="username">{postData.createdBy}</p>
          <hr className="my-2 border-foreground border-t-2" />

          <div className="mt-2">
            <p className="font-bold">Description:</p>
            <p className="wrap-break-word max-w-[45ch]">
              {`${postData.description.slice(0, MAX_DESCRIPTION)}${postData.description.length > MAX_DESCRIPTION ? "..." : ""}`}
              {/*{`${testString.slice(0, MAX_DESCRIPTION)}${testString.length > MAX_DESCRIPTION ? "..." : ""}`}*/}
            </p>
            <hr className="my-2 border-foreground border-t-2" />
            <p className="font-bold">
              Color: <span className="font-normal">{postData.colour.join(", ")}</span>
            </p>
            <p className="font-bold">
              Size: <span className="font-normal">{postData.size}</span>
            </p>
            <p className="font-bold">
              Material: <span className="font-normal">{postData.material}</span>
            </p>
            <p className="font-bold">
              HashTags: <span className="font-normal">{postData.hashtags}</span>
            </p>
            <hr className="my-2 border-foreground border-t-2" />
            <p className="font-bold">Q&A:</p>
            {/* TODO: IMPLEMENT Q AND A SECTION SPEEED I NEEED THISSSS*/}
          </div>
        </div>
      </div>
    </div>
  );
}
