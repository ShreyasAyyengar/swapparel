import { colors as COLOR_ARRAY, materials as MATERIAL_ARRAY, sizeEnum } from "@swapparel/contracts";
import { X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { parseAsBoolean, parseAsNativeArrayOf } from "nuqs/server";
import { useEffect, useRef } from "react";
import FilterHashtags from "./filter-hashtags";
import FilterSection from "./filter-section";
import { useFilterStore } from "./filter-store";

export default function FilterOptions({ onClick, showingFilters }: { onClick: () => void; showingFilters: boolean }) {
  const { filteredColors, setFilteredColors, filteredColorOnly, setFilteredColorOnly } = useFilterStore();
  const { filteredMaterials, setFilteredMaterials, filteredMaterialOnly, setFilteredMaterialOnly } = useFilterStore();
  const { filteredSizes, setFilteredSizes, filteredSizeOnly, setFilteredSizeOnly } = useFilterStore();
  const { filteredHashtags, setFilteredHashtags, filteredHashtagOnly, setFilteredHashtagOnly } = useFilterStore();

  const [colors, setColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [colourOnly, setColourOnly] = useQueryState("colourOnly", parseAsBoolean.withDefault(false));
  const [sizes, setSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [sizeOnly, setSizeOnly] = useQueryState("sizeOnly", parseAsBoolean.withDefault(false));
  const [materials, setMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [materialOnly, setMaterialOnly] = useQueryState("materialOnly", parseAsBoolean.withDefault(false));
  const [hashtags, setHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [hashtagOnly, setHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean.withDefault(false));

  // Track if we're currently syncing to prevent circular updates
  const isSyncingRef = useRef(false);

  // Sync URL → Store (when URL changes, e.g., browser back/forward, direct URL access)
  useEffect(() => {
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    setFilteredColors(colors ?? []);
    setFilteredColorOnly(colourOnly);
    setFilteredMaterials(materials ?? []);
    setFilteredMaterialOnly(materialOnly);
    setFilteredSizes(sizes ?? []);
    setFilteredSizeOnly(sizeOnly);
    setFilteredHashtags(hashtags ?? []);
    setFilteredHashtagOnly(hashtagOnly);
    isSyncingRef.current = false;
  }, [
    colors,
    colourOnly,
    materials,
    materialOnly,
    sizes,
    sizeOnly,
    hashtags,
    hashtagOnly,
    setFilteredColorOnly,
    setFilteredColors,
    setFilteredHashtagOnly,
    setFilteredHashtags,
    setFilteredMaterialOnly,
    setFilteredMaterials,
    setFilteredSizeOnly,
    setFilteredSizes,
  ]);

  // Sync Store → URL (when user interacts with filters)
  useEffect(() => {
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    setColor(filteredColors);
    setColourOnly(filteredColorOnly);
    setMaterial(filteredMaterials);
    setMaterialOnly(filteredMaterialOnly);
    setSize(filteredSizes);
    setSizeOnly(filteredSizeOnly);
    setHashtag(filteredHashtags);
    setHashtagOnly(filteredHashtagOnly);
    isSyncingRef.current = false;
  }, [
    filteredColors,
    filteredColorOnly,
    filteredMaterials,
    filteredMaterialOnly,
    filteredSizes,
    filteredSizeOnly,
    filteredHashtags,
    filteredHashtagOnly,
    setColor,
    setColourOnly,
    setHashtag,
    setHashtagOnly,
    setMaterial,
    setMaterialOnly,
    setSize,
    setSizeOnly,
  ]);

  return (
    showingFilters && (
      <div className="mt-2 flex max-h-[calc(100vh-100px)] w-100 flex-col overflow-y-auto rounded-2xl border border-secondary bg-accent p-5 text-foreground">
        <div className="flex justify-end">
          <X className="fixed hover:cursor-pointer" onClick={onClick} />
        </div>
        {/*TODO: create a use context for set functions and selected arrays*/}
        <FilterSection
          title="Colors"
          valueArray={COLOR_ARRAY}
          selectedValues={filteredColors}
          onlyBoolean={filteredColorOnly}
          setSelectedArray={setFilteredColors}
          setOnlyBoolean={setFilteredColorOnly}
        />
        <FilterSection
          title="Materials"
          valueArray={MATERIAL_ARRAY}
          selectedValues={filteredMaterials}
          onlyBoolean={filteredMaterialOnly}
          setSelectedArray={setFilteredMaterials}
          setOnlyBoolean={setFilteredMaterialOnly}
        />
        <FilterSection
          title="Size"
          valueArray={sizeEnum}
          selectedValues={filteredSizes}
          onlyBoolean={filteredSizeOnly}
          setSelectedArray={setFilteredSizes}
          setOnlyBoolean={setFilteredSizeOnly}
        />
        <FilterHashtags
          hashtagList={selectedHashtags}
          setHashtagList={setSelectedHashtags}
          setOnlyHashtag={setOnlyHashtag}
          onlyHashtag={onlyHashtag}
          handleFilterSubmit={handleFilterSubmit}
        />
        {/*TODO: Clear all filters button*/}
      </div>
    )
  );
}
