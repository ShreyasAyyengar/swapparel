import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import FilterBadge from "./filter-badge";

export default function FilterSection({
  title,
  valueArray,
  selectedValues,
  onlyBoolean,
  setSelectedArray,
  setOnlyBoolean,
  matchOnly,
}: {
  title: string;
  valueArray: readonly string[];
  selectedValues: string[];
  onlyBoolean?: boolean;
  setSelectedArray: (values: string[]) => void;
  setOnlyBoolean?: (only: boolean) => void;
  matchOnly: boolean;
}) {
  const handleCheck = (checked: boolean) => {
    setOnlyBoolean?.(checked);
  };

  return (
    <>
      <div className="mb-2 w-auto border" />
      <p className="mb-2 font-bold">
        {title}
        {matchOnly && (
          <>
            <span className="font-normal text-xs"> | Match ONLY</span>
            <Checkbox className={"ml-2"} checked={onlyBoolean} onCheckedChange={handleCheck} />
          </>
        )}
      </p>

      <div className="mb-2">
        {valueArray.map((value) => (
          <FilterBadge value={value} key={value} selectedFilters={selectedValues} setSelectedFilters={setSelectedArray} />
        ))}
      </div>
    </>
  );
}
