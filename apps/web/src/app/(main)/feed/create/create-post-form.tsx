"use client";

import { userFormPostSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { FieldGroup } from "@swapparel/shad-ui/components/field";
import { Separator } from "@swapparel/shad-ui/components/separator";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { z } from "zod";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import ColorField from "./_fields/colour-field";
import DescriptionField from "./_fields/description-field";
import HashtagsField from "./_fields/hashtags-field";
import MaterialField from "./_fields/material-field";
import SizeField from "./_fields/size-field";
import TitleField from "./_fields/title-field";
import UploadField from "./_fields/upload-field";

export type FormValues = z.input<typeof userFormPostSchema>;
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
    UploadField,
  },
  formComponents: {},
});

export default function CreatePostForm() {
  const form = useAppForm({
    onSubmit: ({ value }) => {
      webClientORPC.posts.createPost.queryOptions({
        // TODO change this to mutationOptions
        input: {
          postData: {
            title: value.postData.title,
            description: value.postData.description,
            size: value.postData.size,
            colour: value.postData.colour,
            material: value.postData.material,
            hashtags: value.postData.hashtags,
          },
          images: value.images,
        },
      });
    },
    defaultValues: {
      postData: {
        title: "" as FormValues["postData"]["title"],
        description: "" as FormValues["postData"]["description"],
        size: "" as FormValues["postData"]["size"],
        colour: [] as FormValues["postData"]["colour"],
        material: [] as FormValues["postData"]["material"],
        hashtags: [] as FormValues["postData"]["hashtags"],
      },
      images: [] as FormValues["images"],
    } satisfies FormValues as FormValues,
    validators: {
      onChange: userFormPostSchema,
    },
  });

  // TODO: maybe find better way to center form (make h-<size> be exact)
  return (
    <div className="flex h-[calc(100vh-62px)] items-center justify-center">
      <div className="mr-10 ml-10 w-300 rounded-2xl border border-foreground bg-secondary-100">
        <p className={"pt-5 text-center font-semibold text-2xl"}>Create New Post!</p>
        <Separator className="mt-3" />
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex">
            {/*DROPDOWNS AND TEXT*/}
            <FieldGroup className="mt-3 w-1/2 pr-5 pb-10 pl-5">
              <form.AppField name="postData.title">{(field) => <field.TitleField />}</form.AppField>

              <form.AppField name="postData.description">{(field) => <field.DescriptionField />}</form.AppField>

              <div className="justify-evenly max-md:space-y-5 md:grid md:grid-cols-2 md:gap-5">
                <form.AppField name="postData.size">{(field) => <field.SizeField />}</form.AppField>
                <form.AppField name="postData.colour">{(field) => <field.ColorField />}</form.AppField>
                <form.AppField name="postData.material">{(field) => <field.MaterialField />}</form.AppField>
                <form.AppField name="postData.hashtags">{(field) => <field.HashtagsField />}</form.AppField>
              </div>
            </FieldGroup>
            {/*DROPDOWNS AND TEXT*/}

            {/*LINE*/}
            <div className="h-auto border-1" />
            {/*LINE*/}

            {/*UPLOAD PHOTO*/}
            <div className="mt-3 w-1/2 pt-[30px] pb-10">
              <FieldGroup className="h-full w-full">
                <form.AppField name="images">{(field) => <field.UploadField />}</form.AppField>
              </FieldGroup>
            </div>
            {/*UPLOAD PHOTO*/}
          </div>
        </form>
        <div className="w-auto border-1" />
        <div className="flex justify-between">
          <Button className="m-3 mr-5 w-1/8">Cancel</Button>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                className="m-3 mr-5 w-1/8 bg-secondary text-foreground hover:bg-success/30"
                onClick={form.handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "..." : "Create"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
