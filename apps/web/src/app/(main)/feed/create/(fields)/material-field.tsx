import { materials } from "@swapparel/contracts";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import MultiSelect, { type MultiSelectOption } from "@swapparel/shad-ui/components/multi-select";
import { type FormValues, useFieldContext } from "../create-post-form";

const materialsSorted = [...materials].sort();
const materialMultiSelectContent: MultiSelectOption[] = materialsSorted.map((m) => ({
  label: m.charAt(0).toUpperCase() + m.slice(1),
  value: m,
}));

export default function MaterialField() {
  const field = useFieldContext<FormValues["material"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Material</FieldLabel>
      <MultiSelect
        options={materialMultiSelectContent}
        onValueChange={(newValue) => field.handleChange(newValue as FormValues["material"])}
        className="!w-1/2"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
