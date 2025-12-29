import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import Badge12 from "@swapparel/shad-ui/components/shadcn-studio/badge/badge-12";
import { type KeyboardEvent, useState } from "react";

export default function FilterHashtags({
  hashtagList,
  setHashtagList,
  setOnlyHashtag,
  onlyHashtag,
}: {
  hashtagList: string[];
  setHashtagList: (values: string[]) => void;
  setOnlyHashtag: (only: boolean) => void;
  onlyHashtag: boolean;
}) {
  const [inputValue, setInputValue] = useState("");

  const addHashtag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // biome-ignore lint/performance/useTopLevelRegex: <regex line>
    const hashtagRegex = /^#[a-zA-Z0-9_]+$/;

    // Split by commas and process each part
    const parts = trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    // Add # prefix if not present
    let newHashtags = parts.map((part) => (part.startsWith("#") ? part : `#${part}`));

    // Remove duplicates within the new hashtags
    newHashtags = Array.from(new Set(newHashtags));

    // Filter out hashtags that don't match the regex or already exist in the list
    const validHashtags = newHashtags.filter((tag) => hashtagRegex.test(tag) && !hashtagList.includes(tag));

    if (validHashtags.length > 0) {
      setHashtagList([...hashtagList, ...validHashtags]);
    }

    setInputValue("");
  };

  const handleDelete = (hashtag: string | undefined) => {
    const newHashtags = hashtagList.filter((hashtagItem) => hashtagItem !== hashtag);
    setHashtagList(newHashtags);
  };

  const handleCheck = (checked: boolean) => {
    setOnlyHashtag(checked);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addHashtag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && hashtagList.length > 0) {
      // Remove last hashtag when backspace is pressed with empty input
      handleDelete(hashtagList.at(-1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    addHashtag(paste);
  };

  const hashtagBadges = hashtagList.map((hashtag) => <Badge12 key={hashtag} name={hashtag} handleDelete={handleDelete} />);

  return (
    <>
      <div className="my-2 w-auto border" />
      <p className="mb-2 font-bold">
        Hashtags <span className="font-normal text-xs"> | Match ONLY</span>
        <Checkbox className={"ml-2"} checked={onlyHashtag} onCheckedChange={handleCheck} />
      </p>

      <input
        type="text"
        placeholder="e.g. #spooky"
        aria-label="Search Hashtags"
        name="hashtag"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) {
            addHashtag(inputValue);
          }
        }}
        onPaste={handlePaste}
        className="focu mb-2 w-full max-w-xl rounded-full border border-foreground bg-secondary-foreground p-1 pl-2 placeholder-gray-400 transition duration-200 focus:border-accent focus:ring-accent"
      />
      <div className={"flex flex-wrap gap-1"}>{hashtagList.length > 0 && hashtagBadges}</div>
    </>
  );
}
