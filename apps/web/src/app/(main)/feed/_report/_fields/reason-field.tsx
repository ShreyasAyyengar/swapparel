import { REPORT_POST_REASONS } from "@swapparel/contracts";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@swapparel/shad-ui/components/select";
import { type ReportPostFormValues, useFieldContext } from "../report-form";

const reasonSelectContent = REPORT_POST_REASONS.map((reason) => (
  <SelectItem key={reason} value={reason}>
    {reason}
  </SelectItem>
));

export default function ReasonField() {
  const field = useFieldContext<ReportPostFormValues["reason"]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(newValue) => field.handleChange(newValue as ReportPostFormValues["reason"])}
      >
        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
          <SelectValue placeholder="Select a reason" />
        </SelectTrigger>
        <SelectContent position="item-aligned">{reasonSelectContent}</SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
