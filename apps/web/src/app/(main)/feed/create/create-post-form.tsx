"use client";

import { internalPostSchema } from "@swapparel/contracts";
import { FieldGroup } from "@swapparel/shad-ui/components/field";
import { Separator } from "@swapparel/shad-ui/components/separator";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { z } from "zod";
import ColorField from "./_fields/colour-field";
import DescriptionField from "./_fields/description-field";
import HashtagsField from "./_fields/hashtags-field";
import MaterialField from "./_fields/material-field";
import SizeField from "./_fields/size-field";
import TitleField from "./_fields/title-field";
import UploadDropzone from "./upload-dropzone";

const formValidationSchema = internalPostSchema.pick({
  title: true,
  description: true,
  size: true,
  colour: true,
  material: true,
  hashtags: true,
});

export type FormValues = z.input<typeof formValidationSchema>;
export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TitleField,
    DescriptionField,
    SizeField,
    ColorField,
    MaterialField,
    HashtagsField,
  },
  formComponents: {},
});

export default function CreatePostForm() {
  const form = useAppForm({
    onSubmit: ({ value }) => {
      console.log(value);
    },
    defaultValues: {
      title: "" as FormValues["title"],
      description: "" as FormValues["description"],
      size: "" as FormValues["size"],
      colour: [] as FormValues["colour"],
      material: [] as FormValues["material"],
      hashtags: [] as FormValues["hashtags"],
    } satisfies FormValues as FormValues,
    validators: {
      onChange: formValidationSchema,
    },
  });

  // TODO center lime div to it in the middle of screen
  return (
    <div className="mt-10 mb-10 flex justify-center border border-lime-300">
      <div className="mr-10 ml-10 w-300 rounded-2xl border border-foreground bg-secondary-100">
        <p className={"pt-5 text-center font-semibold text-2xl"}>Create New Post!</p>
        <Separator className="mt-3" />
        <div className="flex">
          <form
            className="mt-3 w-1/2"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="pr-5 pb-10 pl-5">
              <form.AppField name="title">{(field) => <field.TitleField />}</form.AppField>

              <form.AppField name="description">{(field) => <field.DescriptionField />}</form.AppField>

              <div className="justify-evenly max-md:space-y-5 md:grid md:grid-cols-2 md:gap-5">
                <form.AppField name="size">{(field) => <field.SizeField />}</form.AppField>
                <form.AppField name="colour">{(field) => <field.ColorField />}</form.AppField>
                <form.AppField name="material">{(field) => <field.MaterialField />}</form.AppField>
                <form.AppField name="hashtags">{(field) => <field.HashtagsField />}</form.AppField>
              </div>
            </FieldGroup>
          </form>
          <div className="h-auto border-1" />

          <div className="mt-[43px] mb-10 w-1/2">
            <UploadDropzone />
          </div>
        </div>
      </div>
      <div />
    </div>
  );
}
