import { sizeEnum } from "@swapparel/contracts";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@swapparel/shad-ui/components/select";
import type { ReactFormApi } from "@tanstack/react-form";
import type { FormValues } from "../create-post-form";

type SizeFieldProps = {
  form: ReactFormApi;
};

const sizeSelectContent = sizeEnum.map((size, index) => (
  <SelectItem key={index} value={size}>
    {size}
  </SelectItem>
));

export function SizeField({ form }: SizeFieldProps) {
  return (
    <form.Field name={"size"}>
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Size</FieldLabel>
            {/**/}
            <Select name={field.name} value={field.state.value} onValueChange={(newValue) => field.handleChange(newValue as FormValues["size"])}>
              <SelectTrigger id={field.name} aria-invalid={isInvalid} className="!w-1/2">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="item-aligned">{sizeSelectContent}</SelectContent>
            </Select>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
