/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Square } from "lucide-react";
import { Node, NodeHeader, NodeTitle } from "@/components/ai-elements/node";
import { Handle, Position } from "@xyflow/react";

export const EndNode = ({ data }: any) => {
  const bgcolor = data?.color || "bg-red-500";
  return (
    <Node
      handles={{ target: false, source: false }}
      className="min-w-28! cursor-pointer"
    >
      <NodeHeader className="bg-transparent border-none p-3 flex flex-row items-center gap-3">
        <div className={`p-1.5 rounded-full ${bgcolor}`}>
          <Square className="h-3 w-3" />
        </div>
        <NodeTitle className="text-sm">End</NodeTitle>
      </NodeHeader>

      <Handle position={Position.Left} type="target" className="w-2! h-2!" />
    </Node>
  );
};
