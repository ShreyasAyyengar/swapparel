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

  const [uploads, setUploads] = useState<FormValues["images"]>([]);

  const [draggingOver, setDraggingOver] = useState(false);

  // function logFieldValue() {
  //   console.log("------------------");
  //   console.log("field.state.meta.errors:", field.state.meta.errors);
  // }
  //
  // useEffect(() => {
  //   const interval = setInterval(logFieldValue, 1000);
  //   return () => clearInterval(interval);
  // }, [field.state.value]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    // Only set draggingOver false if the relatedTarget is outside the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDraggingOver(false);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingOver(false);

    const newUploads = Array.from(e.dataTransfer.files).map((file) =>
      uploadPhotoInput.parse({
        file: z.file().parse(file),
        mimeType: file.type,
      })
    );

    setUploads((prev) => [...prev, ...newUploads]);
    field.handleChange(newUploads);
  };

  const onClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    // input.accept = VALID_MIME_TYPES.map((type) => type.replace("image/", ".")).join(",");
    input.multiple = true;
    input.click();
    input.addEventListener("change", () => {
      if (!input.files) return;
      const newUploads = Array.from(input.files).map((file) => ({
        file: z.file().parse(file),
        mimeType: file.type,
      }));

      console.log("newUploads:", newUploads);

      field.state.meta.errors.push("Invalid MIME type");

      // TODO fwd invalid MIME type to TanStack form field.state.meta.errors

      // Combine with existing uploads
      const allUploads = [...uploads, ...newUploads];

      // Let TanStack Form validate - this will populate field.state.meta.errors if invalid
      field.handleChange(allUploads);

      console.log("field.state.value:", field.state.value);

      // Only update local state if validation passes
      const validationResult = uploadPhotoInput.array().safeParse(allUploads);
      if (validationResult.success) setUploads(allUploads);
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border-2 bg-popover [transition:border_0.3s]",
        uploads.length === 0 && "h-full cursor-pointer border-dashed hover:border-foreground",
        draggingOver ? "border-blue-500" : "border-ring"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {uploads.length > 0 ? (
        // TODO do not reload unused elements?
        <div className="m-4 grid grid-cols-1 place-items-center gap-x-8 gap-y-5 text-center md:grid-cols-3 lg:grid-cols-5">
          <UploadedImageThumbnail uploadDialogueClickHandler={onClick} />
          {uploads.map((upload) => (
            <UploadedImageThumbnail
              key={upload.file.name}
              file={upload.file}
              removeClickHandler={() => setUploads((prev) => prev.filter((u) => u.file.name !== upload.file.name))}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center" onClick={onClick} onKeyDown={onClick}>
          {/*TODO: fix linear easing */}
          <ImageUp size={150} strokeWidth={1.0} className="animate-[bounce_3s_ease-in_infinite]" />
          <Separator className="my-4" />
          <p className="text-foreground text-sm">Drag & Drop files here or click to browse</p>
        </div>
      )}
    </div>
  );
}
