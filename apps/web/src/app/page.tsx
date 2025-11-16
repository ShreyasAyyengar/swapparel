"use client";

import Navbar from "./_components/navbar";

export default function Home() {
  return (
    <div>
      <div className={"flex items-center justify-center p-8 align-middle"}>
        <Navbar />
      </div>
      <h1 className="mt-8 text-center font-bold text-2xl">SWAP, DON'T SHOP!</h1>
    </div>
  );
}

// TODO implement middleware
