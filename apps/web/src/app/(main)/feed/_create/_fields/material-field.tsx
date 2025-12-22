import { MATERIALS } from "@swapparel/contracts";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@swapparel/shad-ui/components/multi-select";
import { type FormValues, useFieldContext } from "../create-post-form";

const materialsSorted = [...MATERIALS].sort();

export default function MaterialField() {
  const field = useFieldContext<FormValues["postData"]["material"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Material</FieldLabel>
      <MultiSelect
        values={field.state.value}
        onValuesChange={(newValues) => field.handleChange(newValues as FormValues["postData"]["material"])}
      >
        <MultiSelectTrigger className="w-full max-w-[400px]">
          <MultiSelectValue placeholder="Select material..." />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {materialsSorted.map((m) => (
              <MultiSelectItem key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
