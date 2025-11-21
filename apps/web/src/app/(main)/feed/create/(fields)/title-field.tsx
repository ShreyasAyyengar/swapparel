import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Input } from "@swapparel/shad-ui/components/input";
import { type FormValues, useFieldContext } from "../create-post-form";

export default function TitleField() {
  const field = useFieldContext<FormValues["title"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="Plaided Red Shirt"
        type="text"
        aria-invalid={isInvalid}
        className="!w-1/2"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
