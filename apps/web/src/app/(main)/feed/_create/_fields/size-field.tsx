import { SIZES } from "@swapparel/contracts";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@swapparel/shad-ui/components/select";
import { type FormValues, useFieldContext } from "../create-post-form";

const sizeSelectContent = SIZES.map((size, index) => (
  <SelectItem key={index} value={size}>
    {size}
  </SelectItem>
));

export default function SizeField() {
  const field = useFieldContext<FormValues["postData"]["size"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Size</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(newValue) => field.handleChange(newValue as FormValues["postData"]["size"])}
      >
        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent position="item-aligned">{sizeSelectContent.map((item) => item)}</SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
