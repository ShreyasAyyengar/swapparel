"use client";

import { Badge } from "@swapparel/shad-ui/components/badge";
import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import { memo, useId } from "react";

const FilterBadge = ({
  value,
  selectedFilters,
  setSelectedFilters,
}: {
  value: string;
  selectedFilters: string[];
  setSelectedFilters: (values: string[]) => void;
}) => {
  const selected = selectedFilters.includes(value);
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
          if (checked) setSelectedFilters([...selectedFilters, value]);
          else setSelectedFilters(selectedFilters.filter((item) => item !== value));
        }}
      />
      <label htmlFor={id} className="cursor-pointer select-none after:absolute after:inset-0">
        {value}
      </label>
    </Badge>
  );
};

export default memo(FilterBadge);
