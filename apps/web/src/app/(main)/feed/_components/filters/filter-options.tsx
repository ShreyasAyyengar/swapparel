import { COLOURS, GARMENT_TYPES, MATERIALS, SIZES } from "@swapparel/contracts";
import { X } from "lucide-react";
import { parseAsBoolean, parseAsInteger, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { memo, useEffect, useRef } from "react";
import FilterHashtags from "./filter-hashtags";
import FilterPrice from "./filter-price";
import FilterSection from "./filter-section";

function FilterOptions({
  sliderRef,
  onClick,
  showingFilters,
  setShowingFilters,
}: {
  sliderRef: React.RefObject<SVGSVGElement | null>;
  onClick: () => void;
  showingFilters: boolean;
  setShowingFilters: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [colors, setColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [colourOnly, setColourOnly] = useQueryState("colourOnly", parseAsBoolean.withDefault(false));
  const [sizes, setSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [sizeOnly, setSizeOnly] = useQueryState("sizeOnly", parseAsBoolean.withDefault(false));
  const [materials, setMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [materialOnly, setMaterialOnly] = useQueryState("materialOnly", parseAsBoolean.withDefault(false));
  const [hashtags, setHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [hashtagOnly, setHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean.withDefault(false));
  const [garmentType, setGarmentType] = useQueryState("garmentType", parseAsNativeArrayOf(parseAsString));
  const [garmentOnly, setGarmentOnly] = useQueryState("garmentOnly", parseAsBoolean.withDefault(false));
  const [minPrice, setMinPrice] = useQueryState("minPrice", parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", parseAsInteger);
  const [filterPrice, setFilterPrice] = useQueryState("filterPrice", parseAsBoolean.withDefault(false));

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && sliderRef.current && !ref.current.contains(e.target as Node) && !sliderRef.current.contains(e.target as Node)) {
        setShowingFilters(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    showingFilters && (
      <div
        ref={ref}
        className="mt-2 flex max-h-[calc(100vh-100px)] w-100 flex-col overflow-y-auto rounded-2xl border border-secondary bg-accent p-5 text-foreground"
      >
        <div className="flex justify-end">
          <X className="fixed hover:cursor-pointer" onClick={onClick} />
        </div>
        <FilterSection
          title={"Garment Type"}
          valueArray={GARMENT_TYPES}
          selectedValues={garmentType}
          onlyBoolean={garmentOnly}
          setSelectedArray={setGarmentType}
          setOnlyBoolean={setGarmentOnly}
        />
        <FilterSection
          title="Colors"
          valueArray={COLOURS}
          selectedValues={colors}
          onlyBoolean={colourOnly}
          setSelectedArray={setColor}
          setOnlyBoolean={setColourOnly}
        />
        <FilterSection
          title="Materials"
          valueArray={MATERIALS}
          selectedValues={materials}
          onlyBoolean={materialOnly}
          setSelectedArray={setMaterial}
          setOnlyBoolean={setMaterialOnly}
        />
        <FilterSection
          title="Size"
          valueArray={SIZES}
          selectedValues={sizes}
          onlyBoolean={sizeOnly}
          setSelectedArray={setSize}
          setOnlyBoolean={setSizeOnly}
        />
        <FilterPrice setMinRange={setMinPrice} setMaxRange={setMaxPrice} onlyBoolean={filterPrice} setOnlyBoolean={setFilterPrice} />
        <FilterHashtags hashtagList={hashtags} setHashtagList={setHashtag} setOnlyHashtag={setHashtagOnly} onlyHashtag={hashtagOnly} />
        {/*TODO: Clear all filters button*/}
      </div>
    )
  );
}
export default memo(FilterOptions);
