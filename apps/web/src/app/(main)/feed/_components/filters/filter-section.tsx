import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import type { Dispatch, SetStateAction } from "react";
import FilterBadge from "./filter-badge";

export default function FilterSection({
  title,
  valueArray,
  selectedValues,
  onlyBoolean,
  setSelectedArray,
  setOnlyBoolean,
}: {
  title: string;
  valueArray: readonly string[];
  selectedValues: string[];
  onlyBoolean: boolean;
  setSelectedArray: Dispatch<SetStateAction<string[]>>;
  setOnlyBoolean: Dispatch<SetStateAction<boolean>>;
}) {
  const handleCheck = (checked: boolean) => setOnlyBoolean(checked);

  return (
    <>
      <p className="mb-2 font-bold">
        {title}
        <span className="font-normal text-xs"> | Match ONLY</span>
        <Checkbox className={"ml-2"} checked={onlyBoolean} onCheckedChange={handleCheck} />
      </p>
      <div className="mb-2 w-auto border" />
      <div className="mb-2">
        {valueArray.map((value) => (
          <FilterBadge value={value} key={value} selectedFilters={selectedValues} setSelectedFilters={setSelectedArray} />
        ))}
      </div>
    </>
  );
}
