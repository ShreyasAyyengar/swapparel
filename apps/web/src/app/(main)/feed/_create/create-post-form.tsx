"use client";

import { userFormPostSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { FieldGroup } from "@swapparel/shad-ui/components/field";
import { Separator } from "@swapparel/shad-ui/components/separator";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import type { z } from "zod";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import ColorField from "./_fields/colour-field";
import DescriptionField from "./_fields/description-field";
import GarmentField from "./_fields/garment-field";
import HashtagsField from "./_fields/hashtags-field";
import MaterialField from "./_fields/material-field";
import PriceField from "./_fields/price-field";
import SizeField from "./_fields/size-field";
import TitleField from "./_fields/title-field";
import UploadField from "./_fields/upload-field";

export type FormValues = z.input<typeof userFormPostSchema>;
export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TitleField,
    DescriptionField,
    GarmentField,
    SizeField,
    ColorField,
    MaterialField,
    PriceField,
    HashtagsField,
    UploadField,
    // TODO some fields can be highlighted by highlighting texts, others not
  },
  formComponents: {},
});

export default function CreatePostForm({ closeAction }: { closeAction: () => void }) {
  const router = useRouter();
  const [_, setPost] = useQueryState("post");

  const createPostMutation = useMutation(
    webClientORPC.posts.createPost.mutationOptions({
      onSuccess: async (data) => {
        await setPost(data.id);
        closeAction();
      },
    })
  );

  const form = useAppForm({
    onSubmit: async ({ value }) => {
      await createPostMutation.mutateAsync({
        postData: {
          title: value.postData.title,
          description: value.postData.description,
          garmentType: value.postData.garmentType,
          size: value.postData.size,
          colour: value.postData.colour,
          material: value.postData.material,
          hashtags: value.postData.hashtags,
          price: value.postData.price,
        },
        images: value.images,
      });
    },
    defaultValues: {
      postData: {
        title: "" as FormValues["postData"]["title"],
        description: "" as FormValues["postData"]["description"],
        garmentType: "" as FormValues["postData"]["garmentType"],
        size: "" as FormValues["postData"]["size"],
        colour: [] as FormValues["postData"]["colour"],
        material: [] as FormValues["postData"]["material"],
        hashtags: [] as FormValues["postData"]["hashtags"],
        price: undefined as FormValues["postData"]["price"],
      },
      images: [] as FormValues["images"],
    } satisfies FormValues as FormValues,
    validators: {
      onChange: userFormPostSchema,
    },
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="inset fixed z-50 mx-10 my-8 w-full max-w-300 backdrop-blur-2xl">
      <div className="rounded-2xl border border-foreground">
        <div className="rounded-2xl bg-primary-200/40">
          <p className={"pt-5 text-center font-semibold text-2xl"}>{form.state.isSubmitting ? "Creating new post..." : "Create New Post!"}</p>
          <Separator className="mt-3" />
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="flex">
              {/*region fields*/}
              <FieldGroup className="mt-3 w-1/2 pr-5 pb-10 pl-5">
                <form.AppField name="postData.title">{(field) => <field.TitleField />}</form.AppField>

                <form.AppField name="postData.description">{(field) => <field.DescriptionField />}</form.AppField>

                <div className="justify-evenly max-md:space-y-5 md:grid md:grid-cols-2 md:gap-5">
                  <form.AppField name="postData.size">{(field) => <field.SizeField />}</form.AppField>
                  <form.AppField name="postData.colour">{(field) => <field.ColorField />}</form.AppField>
                  <form.AppField name="postData.material">{(field) => <field.MaterialField />}</form.AppField>
                  <form.AppField name="postData.garmentType">{(field) => <field.GarmentField />}</form.AppField>
                  <form.AppField name="postData.price">{(field) => <field.PriceField />}</form.AppField>
                  <form.AppField
                    name="postData.hashtags"
                    validators={{
                      onBlur: ({ value }) => {
                        // Extract just the hashtags validation from schema
                        const result = userFormPostSchema.shape.postData.shape.hashtags.safeParse(value);
                        if (!result.success) return result.error.issues[0]?.message;
                        return;
                      },
                    }}
                  >
                    {(field) => <field.HashtagsField />}
                  </form.AppField>
                </div>
              </FieldGroup>
              {/*endregion fields*/}

              <div className="h-auto border" />

              {/*region photo upload*/}
              <div className="mt-3 w-1/2 pt-7.5 pr-5 pb-10 pl-5">
                <FieldGroup className="h-full w-full">
                  <form.AppField name="images">{(field) => <field.UploadField />}</form.AppField>
                </FieldGroup>
              </div>
              {/*endregion photo upload*/}
            </div>
          </form>
          <div className="w-auto border" />
          <div className="flex justify-between">
            <Button className="m-3 mr-5 w-1/8" onClick={closeAction}>
              Cancel
            </Button>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  className={cn(
                    "m-3 mr-5 w-1/8 text-background",
                    `${canSubmit ? "bg-foreground hover:cursor-pointer hover:bg-foreground-500" : "bg-foreground/50 hover:cursor-not-allowed hover:bg-foreground/50"}`
                  )}
                  onClick={form.handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: determine how fields turn 'red' on invalid fields.
