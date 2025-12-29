import { uploadPhotoInput } from "@swapparel/contracts";
import { Separator } from "@swapparel/shad-ui/components/separator";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { ImageUp } from "lucide-react";
import { useCallback, useState } from "react";
import { z } from "zod";
import UploadedImageThumbnail from "./_fields/uploaded-image-thumbnail";
import { type FormValues, useFieldContext } from "./create-post-form";

export default function UploadDropzone() {
  const field = useFieldContext<FormValues["images"]>();

  const [draggingOver, setDraggingOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    // Only set draggingOver false if the relatedTarget is outside the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDraggingOver(false);
  }, []);

  // TODO check useEffect proper usage
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUploads(e.dataTransfer.files);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: processUploads is not used in the callback
  const onClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    // input.accept = VALID_MIME_TYPES.map((type) => type.replace("image/", ".")).join(",");
    input.multiple = true;
    input.click();
    input.addEventListener("change", () => {
      if (!input.files) return;
      processUploads(input.files);
    });
  }, []);

  const processUploads = useCallback(
    (files: FileList) => {
      const newUploads = Array.from(files).map((file) => ({
        file: z.file().parse(file),
        mimeType: file.type as FormValues["images"][number]["mimeType"],
      }));

      const validUploads = newUploads.filter((u) => uploadPhotoInput.safeParse(u).success);
      field.handleChange([...field.state.value, ...validUploads] as FormValues["images"]);
    },
    [field]
  );

  const handleOnClick = () => {
    if (field.state.value.length === 0) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border-2 bg-popover [transition:border_0.3s]",
        field.state.value.length === 0 && "h-full cursor-pointer border-dashed hover:border-foreground",
        draggingOver ? "border-blue-500" : "border-ring"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleOnClick}
      onKeyDown={handleOnClick}
    >
      {field.state.value.length > 0 ? (
        // TODO do not reload unused elements?
        <div className="m-4 grid grid-cols-1 place-items-center gap-x-8 gap-y-5 text-center md:grid-cols-3 lg:grid-cols-5">
          <UploadedImageThumbnail uploadDialogueClickHandler={onClick} />
          {field.state.value.map((upload) => (
            <UploadedImageThumbnail
              key={upload.file.name}
              file={upload.file}
              removeClickHandler={() => {
                field.handleChange(field.state.value.filter((u) => u.file.name !== upload.file.name) as FormValues["images"]);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <ImageUp size={150} strokeWidth={1.0} className="animate-[bounce_1s_ease-in_infinite]" />
          <Separator className="my-4" />
          <p className="p-5 text-foreground text-sm">Drag & Drop files here or click to browse</p>
        </div>
      )}
    </div>
  );
}
