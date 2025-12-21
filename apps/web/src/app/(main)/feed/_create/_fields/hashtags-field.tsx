import { Badge } from "@swapparel/shad-ui/components/badge";
import { Field, FieldError, FieldLabel } from "@swapparel/shad-ui/components/field";
import { X } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { type FormValues, useFieldContext } from "../create-post-form";

export default function HashtagsField() {
  const field = useFieldContext<FormValues["postData"]["hashtags"]>();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const hashtags = field.state.value;

  const addHashtag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Ensure hashtag starts with #
    const hashtag = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

    // Add to array if not already present
    if (!hashtags.includes(hashtag)) {
      field.handleChange([...hashtags, hashtag]);
    }
    setInputValue("");
  };

  const removeHashtag = (index: number) => {
    const newHashtags = hashtags.filter((_, i) => i !== index);
    field.handleChange(newHashtags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addHashtag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && hashtags.length > 0) {
      // Remove last hashtag when backspace is pressed with empty input
      removeHashtag(hashtags.length - 1);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Hashtags</FieldLabel>
      <div
        onClick={handleContainerClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); // prevent scrolling on Space
            handleContainerClick(e);
          }
        }}
        tabIndex={0}
        className="field-sizing-content flex h-9 w-full cursor-text flex-wrap items-center gap-1.5 overflow-x-auto rounded-md border border-input bg-popover px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-accent hover:text-accent-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40"
        aria-invalid={isInvalid}
      >
        {hashtags.map((hashtag, index) => (
          <Badge key={index} variant="secondary" className="flex shrink-0 items-center gap-1">
            {hashtag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeHashtag(index);
              }}
              className="ml-1 rounded-full hover:bg-muted-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={field.name}
          name={field.name}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Add remaining input as hashtag on blur if not empty
            if (inputValue.trim()) {
              addHashtag(inputValue);
            }
          }}
          placeholder={hashtags.length === 0 ? "#plaided #shirt #cool" : ""}
          type="text"
          className="min-w-[120px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
