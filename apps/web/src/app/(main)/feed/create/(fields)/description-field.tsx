import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Textarea } from "@swapparel/shad-ui/components/textarea";
import type { ReactFormApi } from "@tanstack/react-form";

type DescriptionFieldProps = {
  form: ReactFormApi;
};

export function DescriptionField({ form }: DescriptionFieldProps) {
  return (
    <form.Field name={"description"}>
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Relaxed fit, worn-in buttons, and gently frayed collar, in new condition..."
              aria-invalid={isInvalid}
              className="!w-1/2 h-35"
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
