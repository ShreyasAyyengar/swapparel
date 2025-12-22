import { Field } from "@swapparel/shad-ui/components/field";
import { type FormValues, useFieldContext } from "../create-post-form";
import UploadDropzone from "../upload-dropzone";

const MIME_TYPE_ERROR_REGEX = /^images\[(\d+)]\.mimeType$/;

export default function UploadField() {
  const field = useFieldContext<FormValues["images"]>();

  const allErrors = field.form.getAllErrors().form.errors[0] ?? {};
  const images = field.state.value ?? [];

  type MimeTypeError = {
    index: number;
    mimeType?: string;
    message: string;
    raw: unknown;
  };

  // shape of validation error issues
  type ValidationIssue = {
    message?: string;
    [key: string]: unknown;
  };

  const mimeTypeErrors: MimeTypeError[] = Object.entries(allErrors)
    .filter(([key]) => MIME_TYPE_ERROR_REGEX.test(key))
    .flatMap(([key, issues]) => {
      const match = key.match(MIME_TYPE_ERROR_REGEX);
      if (!match) return [];

      const index = Number(match[1]);

      // Type guard to check if issues is an array
      const issueArray = Array.isArray(issues) ? issues : [];

      return issueArray.map((issue: unknown) => {
        const validationIssue = issue as ValidationIssue;
        return {
          index,
          mimeType: images[index]?.mimeType,
          message: validationIssue.message ?? "Invalid file type.",
          raw: issue,
        };
      });
    });

  const hasMimeError = mimeTypeErrors.length > 0;

  // Manually inject only *this field's* errors into meta
  if (hasMimeError) {
    // Cast to any to allow custom error structure
    // TanStack Form's errors array is typed as ValidationError[] which is unknown[]
    // We're adding custom error metadata here
    (field.state.meta.errors as unknown[]) = mimeTypeErrors.map((e) => ({
      message: e.message,
      index: e.index,
      mimeType: e.mimeType,
      raw: e.raw,
    }));
  }

  // TODO find better solution for file validation / bubbling errors
  return (
    <Field data-invalid={hasMimeError} className="h-full w-full">
      <UploadDropzone />

      {hasMimeError && (
        <>
          {/* Use your own FieldError if you want */}
          {/*<FieldError errors={field.state.meta.errors} />*/}

          {/* Or render a custom list */}
          <ul className="mt-2 text-red-500 text-sm">
            {mimeTypeErrors.map((err) => (
              <li key={err.index}>
                File {err.index + 1}: {err.mimeType ? `${err.mimeType} not supported` : err.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </Field>
  );
}
