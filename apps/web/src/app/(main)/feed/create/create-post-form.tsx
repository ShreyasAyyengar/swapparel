"use client";

import { internalPostSchema } from "@swapparel/contracts";
import { FieldGroup } from "@swapparel/shad-ui/components/field";
import { useForm } from "@tanstack/react-form";
import type z from "zod";
import { ColorField } from "./(fields)/colour-field";
import { DescriptionField } from "./(fields)/description-field";
import { HashtagsField } from "./(fields)/hashtags-field";
import { MaterialField } from "./(fields)/material-field";
import { SizeField } from "./(fields)/size-field";
import { TitleField } from "./(fields)/title-field";

const formValidationSchema = internalPostSchema.pick({
  title: true,
  description: true,
  size: true,
  colour: true,
  material: true,
  hashtags: true,
});

export type FormValues = z.input<typeof formValidationSchema>;

export default function CreatePostForm() {
  const form = useForm({
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
    } as FormValues,
    validators: {
      onChange: formValidationSchema,
    },
  });

  return (
    <div className="mt-20 mb-20 flex justify-center">
      <form
        className="mr-10 ml-10 w-300 rounded-2xl border border-gray-200"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <p className={"pt-5 text-center font-semibold text-2xl"}>Create New Post!</p>

        {/*
        useAppForm should be what you need => https://tanstack.com/form/latest/docs/framework/react/guides/form-composition#breaking-big-forms-into-smaller-pieces
        */}
        <FieldGroup className="p-10">
          <TitleField form={form} />

          <DescriptionField form={form} />

          <SizeField form={form} />

          <ColorField form={form} />

          <MaterialField form={form} />

          <HashtagsField form={form} />
        </FieldGroup>
      </form>
    </div>
  );
}
