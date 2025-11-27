"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import FilterOptions from "./filter-options";

export default function FilterButton() {
  const [showingFilters, setShowingFilters] = useState(false);
  const toggleFilterOptions = () => setShowingFilters((prev) => !prev);

  return (
    <div className="fixed">
      <SlidersHorizontal size={37.5} className="hover:cursor-pointer" onClick={toggleFilterOptions} />
      {showingFilters && <FilterOptions onClick={toggleFilterOptions} />}
    </div>
  );
}
