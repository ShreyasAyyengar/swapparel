"use client";

import Navbar from "./_components/navbar";
import SignInOutButton from "./_components/sign-in-out-button";

export default function Home() {
  return (
    <div className={"flex h-[2000px] items-center justify-center p-8 align-middle"}>
      <p className="top-0 font-bold text-xl">Swapparel</p>
      <Navbar />
      {/*<p className="font-bold font-mono text-4xl">Swapparel</p>*/}
      <SignInOutButton />
    </div>
  );
}
