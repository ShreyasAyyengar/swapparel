import { colors as COLOR_ARRAY, materials as MATERIAL_ARRAY, sizeEnum } from "@swapparel/contracts";
import { X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { parseAsBoolean, parseAsNativeArrayOf } from "nuqs/server";
import FilterHashtags from "./filter-hashtags";
import FilterSection from "./filter-section";

export default function FilterOptions({ onClick, showingFilters }: { onClick: () => void; showingFilters: boolean }) {
  const [colors, setColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [colourOnly, setColourOnly] = useQueryState("colourOnly", parseAsBoolean.withDefault(false));
  const [sizes, setSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [sizeOnly, setSizeOnly] = useQueryState("sizeOnly", parseAsBoolean.withDefault(false));
  const [materials, setMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [materialOnly, setMaterialOnly] = useQueryState("materialOnly", parseAsBoolean.withDefault(false));
  const [hashtags, setHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [hashtagOnly, setHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean.withDefault(false));

  return (
    showingFilters && (
      <div className="mt-2 flex max-h-[calc(100vh-100px)] w-100 flex-col overflow-y-auto rounded-2xl border border-secondary bg-accent p-5 text-foreground">
        <div className="flex justify-end">
          <X className="fixed hover:cursor-pointer" onClick={onClick} />
        </div>
        <FilterSection
          title="Colors"
          valueArray={COLOR_ARRAY}
          selectedValues={colors}
          onlyBoolean={colourOnly}
          setSelectedArray={setColor}
          setOnlyBoolean={setColourOnly}
        />
        <FilterSection
          title="Materials"
          valueArray={MATERIAL_ARRAY}
          selectedValues={materials}
          onlyBoolean={materialOnly}
          setSelectedArray={setMaterial}
          setOnlyBoolean={setMaterialOnly}
        />
        <FilterSection
          title="Size"
          valueArray={sizeEnum}
          selectedValues={sizes}
          onlyBoolean={sizeOnly}
          setSelectedArray={setSize}
          setOnlyBoolean={setSizeOnly}
        />
        <FilterHashtags hashtagList={hashtags} setHashtagList={setHashtag} setOnlyHashtag={setHashtagOnly} onlyHashtag={hashtagOnly} />
        {/*TODO: Clear all filters button*/}
      </div>
    )
  );
}
