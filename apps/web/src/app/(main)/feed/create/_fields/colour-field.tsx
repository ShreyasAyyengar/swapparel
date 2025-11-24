import { colors } from "@swapparel/contracts";
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

const colorsSorted = [...colors].sort();

export default function ColorField() {
  const field = useFieldContext<FormValues["postData"]["colour"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Color</FieldLabel>
      <MultiSelect values={field.state.value} onValuesChange={(newValues) => field.handleChange(newValues as FormValues["postData"]["colour"])}>
        <MultiSelectTrigger className="w-full max-w-[400px]">
          <MultiSelectValue placeholder="Select colours..." />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {colorsSorted.map((c) => (
              <MultiSelectItem key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
