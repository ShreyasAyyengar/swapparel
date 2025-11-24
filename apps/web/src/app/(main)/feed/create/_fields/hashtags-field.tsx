import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Input } from "@swapparel/shad-ui/components/input";
import { type FormValues, useFieldContext } from "../create-post-form";

export default function HashtagsField() {
  const field = useFieldContext<FormValues["postData"]["hashtags"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Hashtags</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => {
          const values = e.target.value.split(",").map((value) => value.trim()) as FormValues["postData"]["hashtags"];
          field.handleChange(values);
        }}
        placeholder="#plaided #shirt"
        type="text"
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
