import { PRICE_MAX } from "@swapparel/contracts";
import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import { DualRangeSlider } from "@swapparel/shad-ui/components/duel-range-slider";
import { useEffect, useState } from "react";

type PropTypes = {
  setMinRange: (value: number) => void;
  setMaxRange: (value: number) => void;
  onlyBoolean: boolean;
  setOnlyBoolean: (only: boolean) => void;
};

export default function FilterPrice({ setMinRange, setMaxRange, onlyBoolean, setOnlyBoolean }: PropTypes) {
  const handleCheck = (checked: boolean) => setOnlyBoolean(checked);
  const [prices, setPrices] = useState<number[]>([1, PRICE_MAX]);

  useEffect(() => {
    setMinRange(prices[0] ?? 1);
    setMaxRange(prices[1] ?? PRICE_MAX);
  }, [prices]);

  return (
    <>
      <p className="mb-2 font-bold">
        Price
        <span className="font-normal text-xs">| Filter Price</span>
        <Checkbox className={"mr-2 ml-2"} checked={onlyBoolean} onCheckedChange={handleCheck} />
      </p>
      <div className="mb-2 w-auto border" />
      <DualRangeSlider
        className={"mt-6 mb-2"}
        label={(value) => value}
        value={prices}
        onValueChange={setPrices}
        min={1}
        max={PRICE_MAX}
        step={1}
      />
    </>
  );
}
