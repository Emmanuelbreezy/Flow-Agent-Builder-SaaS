"use client";

import { EmbedChat } from "@/components/embed/chat";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      }
    >
      <EmbedChat />
    </Suspense>
  );
};

export default Page;
