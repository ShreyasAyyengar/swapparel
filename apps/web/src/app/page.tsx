"use client";

import Navbar from "./_components/navbar";

export default function Home() {
  return (
    <div className={"flex h-[2000px] items-center justify-center p-8 align-middle"}>
      <p className="top-0 font-bold text-xl">Swapparel</p>
      <Navbar />
    </div>
  );
}
