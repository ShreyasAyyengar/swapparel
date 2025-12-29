import { Field } from "@swapparel/shad-ui/components/field";
import { type FormValues, useFieldContext } from "../create-post-form";
import UploadDropzone from "../upload-dropzone";

const MIME_TYPE_ERROR_REGEX = /^images\[(\d+)]\.mimeType$/;

export default function UploadField() {
  const field = useFieldContext<FormValues["images"]>();

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

  // TODO EVENTUALLY find better solution for file validation / bubbling errors
  const allErrors = field.form.state.errors[0];
  const errorMap = allErrors && typeof allErrors === "object" ? (allErrors as Record<string, unknown>) : {};
  const images = field.state.value ?? [];

  const mimeTypeErrors: MimeTypeError[] = Object.entries(errorMap)
    .filter(([key]) => MIME_TYPE_ERROR_REGEX.test(key))
    .flatMap(([key, issues]) => {
      const match = key.match(MIME_TYPE_ERROR_REGEX);
      if (!match) return [];

      const index = Number(match[1]);
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

  return (
    <Field data-invalid={hasMimeError} className="h-full w-full">
      <UploadDropzone />

      {hasMimeError && (
        <ul className="mt-2 text-red-500 text-sm">
          {mimeTypeErrors.map((err) => (
            <li key={err.index}>
              File {err.index + 1}: {err.mimeType ? `${err.mimeType} not supported` : err.message}
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}
