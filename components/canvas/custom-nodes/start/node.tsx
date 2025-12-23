"use client";

import React from "react";
import { Node, NodeHeader, NodeTitle } from "@/components/ai-elements/node";
import { Play } from "lucide-react";

export const StartNode = () => {
  return (
    <Node
      handles={{ target: false, source: true }}
      className="min-w-28! cursor-pointer"
    >
      <NodeHeader className="bg-transparent border-none p-3 flex flex-row items-center gap-3">
        <div className="p-1.5 rounded-full bg-emerald-500">
          <Play className="h-3 w-3" />
        </div>
        <NodeTitle className="text-sm">Start</NodeTitle>
      </NodeHeader>
    </Node>
  );
};
