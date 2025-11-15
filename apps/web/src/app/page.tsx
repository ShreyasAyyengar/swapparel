"use client";

import { SlidersHorizontal } from "lucide-react";
import { useQueryState } from "nuqs";
import Navbar from "./_components/navbar";

export default function Home() {
  const [searchParams] = useQueryState("searchParams", {
    defaultValue: {},
    parse: (value) => JSON.parse(value),
    serialize: (value) => JSON.stringify(value),
  });

  return (
    <div>
      <div className={"flex items-center justify-center p-8 align-middle"}>
        <Navbar />
        <SlidersHorizontal />
      </div>
      <h1 className="mt-8 text-center font-bold text-2xl">SWAP, DON'T SHOP!</h1>
    </div>
  );
}

// TODO implement middleware
