import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Input } from "@swapparel/shad-ui/components/input";
import { useState } from "react";
import { type FormValues, useFieldContext } from "../create-post-form";

export default function HashtagsField() {
  const field = useFieldContext<FormValues["postData"]["hashtags"]>();
  const [inputValue, setInputValue] = useState(field.state.value.join(" "));

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Hashtags</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => {
          // Only parse into array when input loses focus
          const values = inputValue
            .split(/\s+/)
            .map((v) => v.trim())
            .filter(Boolean) as FormValues["postData"]["hashtags"];
          field.handleChange(values);
        }}
        placeholder="#plaided #shirt #cool"
        type="text"
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
