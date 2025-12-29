import { GARMENT_TYPES } from "@swapparel/contracts";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@swapparel/shad-ui/components/select";
import { type FormValues, useFieldContext } from "../create-post-form";

const garmentSelectContent = GARMENT_TYPES.map((size, index) => (
  <SelectItem key={index} value={size}>
    {size}
  </SelectItem>
));

export default function GarmentField() {
  const field = useFieldContext<FormValues["postData"]["garmentType"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      {/*TODO: fix highlighting bug*/}
      <FieldLabel htmlFor={field.name}>Garment Type</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(newValue) => field.handleChange(newValue as FormValues["postData"]["garmentType"])}
      >
        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent position="item-aligned">{garmentSelectContent.map((item) => item)}</SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
