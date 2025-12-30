"use client";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/dashboard" className="flex-1 flex items-center gap-1 text-2xl">
      <div className="bg-primary size-7 p-1 rounded-sm flex items-center justify-center text-lg text-white">
        <span>F</span>
      </div>
      <div className="flex items-center">
        <span className="font-black text-primary text-lg">Flow</span>
        <span className="font-black text-foreground text-lg">agent.ai</span>
      </div>
    </Link>
  );
};

export default Logo;
