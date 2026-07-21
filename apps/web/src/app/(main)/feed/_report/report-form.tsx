"use client";

import { postReportSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { FieldGroup } from "@swapparel/shad-ui/components/field";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { z } from "zod";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import DescriptionField from "./_fields/description-field";
import ReasonField from "./_fields/reason-field";

const reportFormSchema = postReportSchema.pick({
  reason: true,
  description: true,
});

export type ReportPostFormValues = z.input<typeof reportFormSchema>;

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ReasonField,
    DescriptionField,
  },
  formComponents: {},
});

export default function ReportForm({ reportedPostId, closeAction }: { reportedPostId: string; closeAction: () => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createReportMutation = useMutation(
    webClientORPC.postReport.createReport.mutationOptions({
      onSuccess: () => {
        closeAction();
      },
      onError: (error) => {
        if ("data" in error && error.data && typeof error.data === "object" && "message" in error.data) {
          setErrorMessage(String(error.data.message));
        } else {
          setErrorMessage(error.message ?? "Something went wrong. Please try again.");
        }
      },
    })
  );

  const form = useAppForm({
    onSubmit: ({ value }) => {
      setErrorMessage(null);
      createReportMutation.mutate({
        reportedPostId,
        reason: value.reason,
        description: value.description,
      });
    },
    defaultValues: {
      reason: "" as ReportPostFormValues["reason"],
      description: "" as ReportPostFormValues["description"],
    } satisfies ReportPostFormValues as ReportPostFormValues,
    validators: {
      onChange: reportFormSchema,
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="space-y-4">
          <form.AppField name="reason">{(field) => <field.ReasonField />}</form.AppField>
          <form.AppField name="description">{(field) => <field.DescriptionField />}</form.AppField>
        </FieldGroup>
      </form>
      {errorMessage && <p className="mt-3 text-destructive text-sm">{errorMessage}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={closeAction} className="cursor-pointer">
          Cancel
        </Button>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              onClick={form.handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={cn("cursor-pointer", !canSubmit && "bg-muted text-muted-foreground")}
            >
              {isSubmitting ? "Submitting..." : "Submit report"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </>
  );
}
