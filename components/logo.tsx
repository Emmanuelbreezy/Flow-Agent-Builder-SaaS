import { FlowArrowIcon } from "@phosphor-icons/react";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/dashboard" className="flex-1 flex items-center gap-1 text-2xl">
      <div className="bg-primary size-8 p-1 rounded-md flex items-center justify-center text-xl text-white">
        <FlowArrowIcon />
      </div>
      <span className="font-semibold text-foreground text-lg">Flow.ai</span>
    </Link>
  );
};

export default Logo;
