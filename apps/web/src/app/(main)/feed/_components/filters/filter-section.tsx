import FilterBadge from "./filter-badge";

export default function FilterSection({
  title,
  valueArray,
  setSelectedArray,
}: {
  title: string;
  valueArray: readonly string[];
  setSelectedArray: () => void;
}) {
  return (
    <>
      <p className="mb-2 font-bold">{title}</p>
      <div className="mb-2 w-auto border-1" />
      <div className="mb-2">
        {valueArray.map((value) => (
          <FilterBadge value={value} key={value} />
        ))}
      </div>
    </>
  );
}
