import { colors, materials, sizeEnum } from "@swapparel/contracts";
import { X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { parseAsBoolean, parseAsNativeArrayOf } from "nuqs/server";
import { useEffect, useState } from "react";
import FilterHashtags from "./filter-hashtags";
import FilterSection from "./filter-section";

export default function FilterOptions({ onClick, showingFilters }: { onClick: () => void; showingFilters: boolean }) {
  const [selectedColor, setColor] = useQueryState("colour", parseAsNativeArrayOf(parseAsString));
  const [selectedColourOnly, setColourOnly] = useQueryState("colourOnly", parseAsBoolean.withDefault(false));
  const [selectedSize, setSize] = useQueryState("size", parseAsNativeArrayOf(parseAsString));
  const [selectedSizeOnly, setSizeOnly] = useQueryState("sizeOnly", parseAsBoolean.withDefault(false));
  const [selectedMaterial, setMaterial] = useQueryState("material", parseAsNativeArrayOf(parseAsString));
  const [selectedMaterialOnly, setMaterialOnly] = useQueryState("materialOnly", parseAsBoolean.withDefault(false));
  const [selectedHashtag, setHashtag] = useQueryState("hashtag", parseAsNativeArrayOf(parseAsString));
  const [selectedHashtagOnly, setHashtagOnly] = useQueryState("hashtagOnly", parseAsBoolean.withDefault(false));

  // TODO replace with useReducer
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [onlyColor, setOnlyColor] = useState<boolean>(false);

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [onlyMaterials, setOnlyMaterials] = useState<boolean>(false);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [onlySize, setOnlySize] = useState<boolean>(false);

  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [onlyHashtag, setOnlyHashtag] = useState<boolean>(false);

  const handleFilterSubmit = async () => {
    await setColor(selectedColors);
    await setColourOnly(onlyColor);
    await setMaterial(selectedMaterials);
    await setMaterialOnly(onlyMaterials);
    await setSize(selectedSizes);
    await setSizeOnly(onlySize);
    await setHashtag(selectedHashtags);
    await setHashtagOnly(onlyHashtag);
  };

  useEffect(() => {
    handleFilterSubmit();
  }, [handleFilterSubmit]);

  return (
    showingFilters && (
      <div className="mt-2 flex max-h-[calc(100vh-100px)] w-100 flex-col overflow-y-auto rounded-2xl border border-secondary bg-accent p-5 text-foreground">
        <div className="flex justify-end">
          <X className="fixed hover:cursor-pointer" onClick={onClick} />
        </div>
        {/*TODO: create a use context for set functions and selected arrays*/}
        <FilterSection
          title="Colors"
          valueArray={colors}
          selectedValues={selectedColors}
          onlyBoolean={onlyColor}
          setSelectedArray={setSelectedColors}
          setOnlyBoolean={setOnlyColor}
        />
        <FilterSection
          title="Materials"
          valueArray={materials}
          selectedValues={selectedMaterials}
          onlyBoolean={onlyMaterials}
          setSelectedArray={setSelectedMaterials}
          setOnlyBoolean={setOnlyMaterials}
        />
        <FilterSection
          title="Size"
          valueArray={sizeEnum}
          selectedValues={selectedSizes}
          onlyBoolean={onlySize}
          setSelectedArray={setSelectedSizes}
          setOnlyBoolean={setOnlySize}
        />
        <FilterHashtags hashtagList={selectedHashtags} setHashtagList={setSelectedHashtags} handleFilterSubmit={handleFilterSubmit} />
      </div>
    )
  );
}
