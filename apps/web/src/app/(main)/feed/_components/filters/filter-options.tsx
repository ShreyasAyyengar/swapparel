import { COLOURS, GARMENT_TYPES, MATERIALS, SIZES } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { parseAsBoolean, parseAsNativeArrayOf, parseAsString, useQueryState } from "nuqs";
import { memo, useEffect, useRef } from "react";
import FilterHashtags from "./filter-hashtags";
import FilterPriceSection from "./filter-price-section";
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
  const [materials, setMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [materialOnly, setMaterialOnly] = useQueryState("materialOnly", parseAsBoolean.withDefault(false));
  const [hashtags, setHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [hashtagOnly, setHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean.withDefault(false));
  const [garmentType, setGarmentType] = useQueryState("garmentType", parseAsNativeArrayOf(parseAsString));
  const [_, setFilteringPrice] = useQueryState("price", parseAsBoolean.withDefault(false));
  const [__, setShowFreeOnly] = useQueryState("freeOnly", parseAsBoolean.withDefault(false));
  const [___, setShowPricedOnly] = useQueryState("pricedOnly", parseAsBoolean.withDefault(false));

  const ref = useRef<HTMLDivElement | null>(null);

  const clearFilters = () => {
    // arrays
    setColor(null);
    setSize(null);
    setMaterial(null);
    setHashtag(null);
    setGarmentType(null);

    // booleans (withDefault)
    setColourOnly(false);
    setMaterialOnly(false);
    setHashtagOnly(false);
    setFilteringPrice(false);
    setShowFreeOnly(false);
    setShowPricedOnly(false);
  };

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
        className="mt-2 flex max-h-[80vh] w-150 flex-col overflow-y-auto rounded-2xl border border-secondary bg-accent p-5 text-foreground"
      >
        <Button className={"my-4 cursor-pointer"} onClick={clearFilters}>
          CLEAR FILTERS
        </Button>
        <FilterSection
          title={"Garment Type"}
          valueArray={GARMENT_TYPES}
          selectedValues={garmentType}
          setSelectedArray={setGarmentType}
          matchOnly={false}
        />
        <FilterSection
          title="Colors"
          valueArray={COLOURS}
          selectedValues={colors}
          onlyBoolean={colourOnly}
          setSelectedArray={setColor}
          setOnlyBoolean={setColourOnly}
          matchOnly={true}
        />
        <FilterSection
          title="Materials"
          valueArray={MATERIALS}
          selectedValues={materials}
          onlyBoolean={materialOnly}
          setSelectedArray={setMaterial}
          setOnlyBoolean={setMaterialOnly}
          matchOnly={true}
        />
        <FilterSection title="Size" valueArray={SIZES} selectedValues={sizes} setSelectedArray={setSize} matchOnly={false} />
        <FilterPriceSection />
        <FilterHashtags hashtagList={hashtags} setHashtagList={setHashtag} setOnlyHashtag={setHashtagOnly} onlyHashtag={hashtagOnly} />
        {/*TODO: Clear all filters button*/}
      </div>
    )
  );
}
export default memo(FilterOptions);
