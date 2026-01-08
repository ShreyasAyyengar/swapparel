"use client";

import {cn} from "@swapparel/shad-ui/lib/utils";
import {SlidersHorizontal} from "lucide-react";
import {useRef, useState} from "react";
import FilterOptions from "./filter-options";

export default function FilterButton({ className = "fixed" }: { className: string }) {
  const [showingFilters, setShowingFilters] = useState(false);
  const toggleFilterOptions = () => setShowingFilters((prev) => !prev);

  const sliderRef = useRef<SVGSVGElement | null>(null);

  return (
    <div className={cn("fixed", className)}>
      <SlidersHorizontal ref={sliderRef} size={37.5} className="hover:cursor-pointer" onClick={toggleFilterOptions} />
      <FilterOptions sliderRef={sliderRef} onClick={toggleFilterOptions} showingFilters={showingFilters} setShowingFilters={setShowingFilters} />
    </div>
  );
}
