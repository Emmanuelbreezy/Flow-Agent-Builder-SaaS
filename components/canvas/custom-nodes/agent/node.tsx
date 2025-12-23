/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Node,
  NodeHeader,
  NodeTitle,
  NodeDescription,
} from "@/components/ai-elements/node";
import { Brain } from "lucide-react";

export const AgentNode = ({ data }: any) => {
  const bgcolor = data?.color || "bg-blue-500";
  return (
    <Node
      handles={{ target: true, source: true }}
      className="min-w-35 w-fit cursor-pointer"
    >
      <NodeHeader className="bg-transparent border-none flex flex-row items-center gap-3 px-4 py-3">
        <span className={`p-1.5 rounded-lg ${bgcolor}`}>
          <Brain className="size-4" />
        </span>
        <div>
          <NodeTitle className="text-sm font-semibold">
            {data?.name || "Agent"}
          </NodeTitle>
          <NodeDescription className="text-xs">Agent</NodeDescription>
        </div>
      </NodeHeader>
    </Node>
  );
};
