/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Node,
  NodeHeader,
  NodeTitle,
  NodeContent,
} from "@/components/ai-elements/node";
import { UserCheck } from "lucide-react";
import { Handle, Position } from "@xyflow/react";

export const UserApprovalNode = ({ data }: any) => {
  const options = data.options || ["Approve", "Reject"];

  return (
    <Node
      handles={{ target: true, source: false }}
      className="min-w-52 cursor-pointer active:cursor-grabbing"
    >
      <NodeHeader className="bg-transparent border-none p-3 flex flex-row items-center gap-3">
        <div className="p-1.5 rounded-lg text-black bg-orange-500">
          <UserCheck size={14} strokeWidth={2.5} />
        </div>
        <NodeTitle className="text-sm font-semibold">User approval</NodeTitle>
      </NodeHeader>

      <NodeContent className="p-3 pt-0 space-y-2">
        {options.map((option: string, index: number) => (
          <div
            key={option}
            className="relative flex items-center justify-center p-2 rounded-md bg-muted/50 border border-border text-[12px] font-medium"
          >
            {option}
            <Handle
              type="source"
              position={Position.Right}
              id={`option-${index}`}
              className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background -right-1.25"
            />
          </div>
        ))}
      </NodeContent>
    </Node>
  );
};
