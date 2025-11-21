import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Input } from "@swapparel/shad-ui/components/input";
import { type FormValues, useFieldContext } from "../create-post-form";

export default function HashtagsField() {
  const field = useFieldContext<FormValues["hashtags"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Hashtags</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => {
          const values = e.target.value.split(",").map((value) => value.trim()) as FormValues["hashtags"];
          field.handleChange(values);
        }}
        placeholder="Relaxed fit, worn-in buttons, and gently frayed collar, in new condition..."
        type="text"
        aria-invalid={isInvalid}
        className="!w-1/2"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
