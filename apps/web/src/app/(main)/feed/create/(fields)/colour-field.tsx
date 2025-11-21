import { colors } from "@swapparel/contracts";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { MultiSelect, type MultiSelectOption } from "@swapparel/shad-ui/components/multi-select";
import type { ReactFormApi } from "@tanstack/react-form";
import type { FormValues } from "../create-post-form";

type ColorFieldProps = {
  form: ReactFormApi;
};

const colorsSorted = [...colors].sort();
const colorMultiSelectContent: MultiSelectOption[] = colorsSorted.map((c) => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c,
}));

export function ColorField({ form }: ColorFieldProps) {
  return (
    <form.Field name={"colour"}>
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Color</FieldLabel>
            <MultiSelect
              options={colorMultiSelectContent}
              onValueChange={(newValue) => field.handleChange(newValue as FormValues["colour"])}
              className="!w-1/2"
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
