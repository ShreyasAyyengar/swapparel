import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import { type Dispatch, type SetStateAction, useState } from "react";
import FilterBadge from "./filter-badge";

export default function FilterSection({
  title,
  valueArray,
  setSelectedArray,
  setOnlyBoolean,
}: {
  title: string;
  valueArray: readonly string[];
  setSelectedArray: Dispatch<SetStateAction<string[]>>;
  setOnlyBoolean: Dispatch<SetStateAction<boolean>>;
}) {
  const [selected, setSelected] = useState(false);

  const handleCheck = (checked: boolean) => {
    setSelected(checked);
    setOnlyBoolean(checked);
  };
  return (
    <>
      <p className="mb-2 font-bold">
        {title}
        <span className="font-normal text-xs"> | Match ONLY</span>
        <Checkbox className={"ml-2"} checked={selected} onCheckedChange={handleCheck} />
      </p>
      <div className="mb-2 w-auto border" />
      <div className="mb-2">
        {valueArray.map((value) => (
          <FilterBadge value={value} key={value} setSelectedArray={setSelectedArray} />
        ))}
      </div>
    </>
  );
}
