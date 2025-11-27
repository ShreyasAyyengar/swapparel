import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Textarea } from "@swapparel/shad-ui/components/textarea";
import { type FormValues, useFieldContext } from "../create-post-form";

export default function DescriptionField() {
  const field = useFieldContext<FormValues["postData"]["description"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="Relaxed fit, worn-in buttons, and gently frayed collar, in new condition..."
        aria-invalid={isInvalid}
        // TODO: experiment with max-h-<size>
        className="max-h-35"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
