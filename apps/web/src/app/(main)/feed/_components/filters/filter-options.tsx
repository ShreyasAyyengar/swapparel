import { colors, materials, sizeEnum } from "@swapparel/contracts";
import { X } from "lucide-react";
import FilterHashtags from "./filter-hashtags";
import FilterSection from "./filter-section";

export default function FilterOptions({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-2 flex max-h-[calc(100vh-100px)] w-100 flex-col overflow-y-auto rounded-2xl border border-secondary bg-accent p-5 text-foreground">
      <div className="flex justify-end">
        <X className="fixed hover:cursor-pointer" onClick={onClick} />
      </div>
      <FilterSection title="Colors" valueArray={colors} />
      <FilterSection title="Materials" valueArray={materials} />
      <FilterSection title="Size" valueArray={sizeEnum} />
      <FilterHashtags />
    </div>
  );
}
