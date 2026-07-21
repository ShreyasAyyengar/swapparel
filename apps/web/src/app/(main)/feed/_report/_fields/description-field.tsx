import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Textarea } from "@swapparel/shad-ui/components/textarea";
import { type ReportPostFormValues, useFieldContext } from "../report-form";

export default function DescriptionField() {
  const field = useFieldContext<ReportPostFormValues["description"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Additional details (optional)</FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="Add any details that would help us review this report..."
        aria-invalid={isInvalid}
        className="max-h-35"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
