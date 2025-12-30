import { PRICE_MAX } from "@swapparel/contracts";
import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import { Slider } from "@swapparel/shad-ui/components/slider";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

const PRICE_MIN_DEFAULT = 1;


type PropTypes = {
  minPrice: number;
  maxPrice: number;
  setMinRange: (value: number) => void;
  setMaxRange: (value: number) => void;
  onlyBoolean: boolean;
  setOnlyBoolean: (only: boolean) => void;
};

export default function FilterPrice({ minPrice, maxPrice, setMinRange, setMaxRange, onlyBoolean, setOnlyBoolean }: PropTypes) {
  const handleCheck = (checked: boolean) => setOnlyBoolean(checked);
  const [prices, setPrices] = useState<number[]>([1, PRICE_MAX]);

  useEffect(() => {
    setMinRange(prices[0] ?? 1);
    setMaxRange(prices[1] ?? PRICE_MAX);
  }, [prices]);

  useEffect(() => {
    if (minPrice !== prices[0] || maxPrice !== prices[1]) {
      setPrices([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice]);


  return (
    <>
      <div className="mb-2 w-auto border" />
      <p className="font-bold">Price</p>

      <div className="flex flex-col">
        <div className="flex">
          <span className="font-normal text-xs">Filter Price</span>
          <Checkbox
            className="mr-2 ml-2"
            checked={filteringPrice}
            onCheckedChange={(checked) => {
              const next = Boolean(checked);

              if (next) {
                // turning ON: undo free-only; ensure min/max exist
                setMany(() => {
                  setShowFreeOnly(false);
                  setFilteringPrice(true);
                  if (minPrice === null) setMinPrice(PRICE_MIN_DEFAULT);
                  if (maxPrice === null) setMaxPrice(PRICE_MAX);
                });
              } else {
                // ✅ turning OFF: must clear min/max first, otherwise normalization re-enables
                setMany(() => {
                  setShowPricedOnly(false);
                  setFilteringPrice(false);
                  setMinPrice(null);
                  setMaxPrice(null);
                });
              }
            }}
          />
        </div>

        <div className="flex">
          <span className="font-normal text-xs">Show Free Only</span>
          <Checkbox
            className="mr-2 ml-2"
            checked={showFreeOnly}
            onCheckedChange={(checked) => {
              const next = Boolean(checked);

              if (next) {
                // ✅ free-only forces all price filtering off (and untoggles priced/filter)
                setMany(() => {
                  setShowFreeOnly(true);
                  setShowPricedOnly(false);
                  setFilteringPrice(false);
                  setMinPrice(null);
                  setMaxPrice(null);
                });
              } else {
                setShowFreeOnly(false);
              }
            }}
          />
        </div>

        <div className="flex">
          <span className="font-normal text-xs">Show Priced Only</span>
          <Checkbox
            className="mr-2 ml-2"
            checked={showPricedOnly}
            onCheckedChange={(checked) => {
              const next = Boolean(checked);

              if (next) {
                // priced-only implies filtering on + undo free-only + ensure min/max exist
                setMany(() => {
                  setShowFreeOnly(false);
                  setShowPricedOnly(true);
                  setFilteringPrice(true);
                  if (minPrice === null) setMinPrice(PRICE_MIN_DEFAULT);
                  if (maxPrice === null) setMaxPrice(PRICE_MAX);
                });
              } else {
                setShowPricedOnly(false);
              }
            }}
          />
        </div>
      </div>

      <Slider
        className="mt-8 mb-2"
        value={sliderValues}
        onValueChange={(values) => setSliderValues(values as [number, number])}
        onValueCommit={([min, max]) => {
          // committing a range implies filtering on + not free-only
          setMany(() => {
            setShowFreeOnly(false);
            setFilteringPrice(true);
            setMinPrice(Number(min));
            setMaxPrice(Number(max));
          });
        }}
        min={PRICE_MIN_DEFAULT}
        max={PRICE_MAX}
        step={10}
        disabled={!priceUIEnabled}
      />
    </>
  );
}
