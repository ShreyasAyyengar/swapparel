import { Field, FieldError } from "@swapparel/shad-ui/components/field";
import { type FormValues, useFieldContext } from "../create-post-form";
import UploadDropzone from "../upload-dropzone";

export default function UploadField() {
  const field = useFieldContext<FormValues["images"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid} className="h-full w-full">
      <p>Field State: {JSON.stringify(field.state, null, 2)}</p>
      <UploadDropzone />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
