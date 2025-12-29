import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Input } from "@swapparel/shad-ui/components/input";
import { useState } from "react";
import { type FormValues, useFieldContext } from "../create-post-form";

export default function PriceField() {
  const [enabled, setEnabled] = useState(false);
  const field = useFieldContext<FormValues["postData"]["price"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const value = String(field.state.value ?? "");

  return (
    <Field data-invalid={isInvalid}>
      <div className="flex items-center space-x-3">
        <FieldLabel htmlFor={field.name}>Set a Price</FieldLabel>
        <Checkbox checked={enabled} onCheckedChange={(checked) => setEnabled(checked.valueOf() as boolean)} />
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-foreground/70">$</span>

        <Input
          id={field.name}
          name={field.name}
          disabled={!enabled}
          // keep only digits in form state (no $)
          value={value}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/[^\d]/g, "");
            field.handleChange(Number(digitsOnly));
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text");
            const digitsOnly = pasted.replace(/[^\d]/g, "");
            field.handleChange(Number(digitsOnly));
          }}
          inputMode="numeric"
          pattern="\d*"
          placeholder={"15"}
          type="text"
          aria-invalid={isInvalid}
          className="pl-7"
        />
      </div>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
