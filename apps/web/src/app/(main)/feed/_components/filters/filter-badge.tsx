"use client";

import { Badge } from "@swapparel/shad-ui/components/badge";
import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import { type Dispatch, type SetStateAction, useId } from "react";

const FilterBadge = ({
  value,
  selectedValues,
  setSelectedArray,
}: {
  value: string;
  selectedValues: string[];
  setSelectedArray: Dispatch<SetStateAction<string[]>>;
}) => {
  const selected = selectedValues.includes(value);

  const id = useId();

  return (
    <Badge
      variant={selected ? "secondary" : "outline"}
      className="relative m-1 cursor-pointer rounded-sm outline-none has-focus-visible:border-ring/50 has-focus-visible:ring-2 has-focus-visible:ring-ring/50"
    >
      <Checkbox
        id={id}
        className="peer sr-only after:absolute after:inset-0"
        checked={selected}
        onCheckedChange={(checked) => {
          setSelectedArray((prev) => {
            if (checked) return [...prev, value];
            return prev.filter((item) => item !== value);
          });
          console.log(selectedValues);
        }}
      />
      <label htmlFor={id} className="cursor-pointer select-none after:absolute after:inset-0">
        {value}
      </label>
    </Badge>
  );
};

export default FilterBadge;
