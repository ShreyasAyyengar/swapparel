import { CircleFadingPlus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function UploadedImageThumbnail({ file, dialogueOnClick }: { file?: File; dialogueOnClick?: () => void }) {
  const [topX, setTopX] = useState<boolean>(true);

  const onClick = () => {
    if (file === undefined) {
      dialogueOnClick?.();
    } else {
      // biome-ignore lint/suspicious/noAlert: <gay>
      alert("Handle delete!");
    }
  };

  return (
    <div
      className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-2xl text-sm ${file ? "" : "border border-neutral-600"}`}
      onClick={onClick}
      onKeyDown={onClick}
    >
      {file ? (
        <div className="group relative h-full w-full rounded-2xl border border-foreground">
          <Image src={URL.createObjectURL(file)} alt={file.name} width={65} height={65} className="h-full w-full rounded-2xl object-cover" />
          <X size={20} className="-top-1 -right-1 absolute rounded-full bg-zinc-700 opacity-100 transition-opacity group-hover:opacity-0" />
          <X
            size={50}
            className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 rounded-full bg-destructive opacity-0 transition-all group-hover:opacity-100"
          />
        </div>
      ) : (
        <CircleFadingPlus
          className="text-neutral-400 [transition:color_0.2s,rotate_0.75s] hover:rotate-360 hover:text-foreground"
          size={65}
          strokeWidth={1.0}
        />
      )}
    </div>
  );
}
