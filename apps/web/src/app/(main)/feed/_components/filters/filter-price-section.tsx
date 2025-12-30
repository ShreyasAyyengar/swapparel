import { PRICE_MAX } from "@swapparel/contracts";
import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import { Slider } from "@swapparel/shad-ui/components/slider";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

const PRICE_MIN_DEFAULT = 1;

type PriceState = {
  minPrice: number | null;
  maxPrice: number | null;
  filteringPrice: boolean;
  showFreeOnly: boolean;
  showPricedOnly: boolean;
};

function normalizePriceState(s: PriceState): PriceState {
  const hasMinMax = s.minPrice !== null && s.maxPrice !== null;

  // Free-only dominates everything
  if (s.showFreeOnly) {
    return {
      ...s,
      filteringPrice: false,
      showPricedOnly: false,
      minPrice: null,
      maxPrice: null,
    };
  }

  // If URL has min/max, price filtering must be on
  let filteringPrice = s.filteringPrice || hasMinMax;

  // priced-only implies filteringPrice
  if (s.showPricedOnly) filteringPrice = true;

  // If filtering is off, clear min/max
  if (!filteringPrice) {
    return {
      ...s,
      filteringPrice: false,
      minPrice: null,
      maxPrice: null,
    };
  }

  // Filtering is on: default min/max if missing
  const minPrice = s.minPrice ?? PRICE_MIN_DEFAULT;
  const maxPrice = s.maxPrice ?? PRICE_MAX;

  // invalid mix -> reset entirely
  if (minPrice > maxPrice) {
    return {
      ...s,
      filteringPrice: false,
      showPricedOnly: false,
      minPrice: null,
      maxPrice: null,
    };
  }

  return {
    ...s,
    filteringPrice: true,
    minPrice,
    maxPrice,
  };
}

export default function FilterPriceSection() {
  const [minPrice, setMinPrice] = useQueryState("minPrice", parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", parseAsInteger);
  const [filteringPrice, setFilteringPrice] = useQueryState("price", parseAsBoolean.withDefault(false));
  const [showFreeOnly, setShowFreeOnly] = useQueryState("freeOnly", parseAsBoolean.withDefault(false));
  const [showPricedOnly, setShowPricedOnly] = useQueryState("pricedOnly", parseAsBoolean.withDefault(false));

  // Initialize slider values from URL params if they exist, otherwise use defaults
  const [sliderValues, setSliderValues] = useState<[number, number]>(() => {
    if (minPrice !== null && maxPrice !== null) {
      return [minPrice, maxPrice];
    }
    return [PRICE_MIN_DEFAULT, PRICE_MAX];
  });

  // guard prevents normalization loop while we "apply" a multi-field change
  const normalizingRef = useRef(false);

  // ✅ Always reflect URL min/max in the slider when they exist (even on initial reload)
  useEffect(() => {
    if (minPrice !== null && maxPrice !== null) {
      setSliderValues([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice]);

  // Single source of truth: normalize whenever URL state changes (unless guarded)
  useEffect(() => {
    if (normalizingRef.current) return;

    const current: PriceState = { minPrice, maxPrice, filteringPrice, showFreeOnly, showPricedOnly };
    const normalized = normalizePriceState(current);

    const changed =
      normalized.minPrice !== current.minPrice ||
      normalized.maxPrice !== current.maxPrice ||
      normalized.filteringPrice !== current.filteringPrice ||
      normalized.showFreeOnly !== current.showFreeOnly ||
      normalized.showPricedOnly !== current.showPricedOnly;

    if (!changed) return;

    normalizingRef.current = true;

    setShowFreeOnly(normalized.showFreeOnly);
    setShowPricedOnly(normalized.showPricedOnly);
    setFilteringPrice(normalized.filteringPrice);
    setMinPrice(normalized.minPrice);
    setMaxPrice(normalized.maxPrice);

    queueMicrotask(() => {
      normalizingRef.current = false;
    });
  }, [
    minPrice,
    maxPrice,
    filteringPrice,
    showFreeOnly,
    showPricedOnly,
    setMinPrice,
    setMaxPrice,
    setFilteringPrice,
    setShowFreeOnly,
    setShowPricedOnly,
  ]);

  const priceUIEnabled = !showFreeOnly && (filteringPrice || showPricedOnly);

  const setMany = (fn: () => void) => {
    normalizingRef.current = true;
    fn();
    queueMicrotask(() => {
      normalizingRef.current = false;
    });
  };

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
