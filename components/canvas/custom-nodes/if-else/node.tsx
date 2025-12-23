/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Node,
  NodeHeader,
  NodeTitle,
  NodeContent,
} from "@/components/ai-elements/node";
import { GitBranch } from "lucide-react";
import { Handle, Position } from "@xyflow/react";

export const IfElseNode = ({ data }: any) => {
  const conditions = data.conditions || [
    "input.output_parsed.classification == 'return_item'",
    "input.output_parsed.classification == 'cancel_subscription'",
    "input.output_parsed.classification == 'get_information'",
  ];

  return (
    <Node
      handles={{ target: true, source: false }}
      className="min-w-72 cursor-pointer"
    >
      <NodeHeader className="bg-transparent border-none p-3 flex flex-row items-center gap-3">
        <div className="p-1.5 rounded-lg text-black bg-orange-500">
          <GitBranch size={14} strokeWidth={2.5} />
        </div>
        <NodeTitle className="text-sm font-semibold">Condition</NodeTitle>
      </NodeHeader>

      <NodeContent className="p-3 pt-0 space-y-2">
        {conditions.map((condition: string, index: number) => (
          <div
            key={index}
            className="relative flex items-center p-2 rounded-md bg-muted/50 border border-border text-[11px] font-mono text-muted-foreground overflow-hidden whitespace-nowrap"
          >
            {condition}
            <Handle
              type="source"
              position={Position.Right}
              id={`condition-${index}`}
              className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background -right-1.25"
            />
          </div>
        ))}
        <div className="relative flex items-center justify-end p-2 rounded-md bg-muted/30 border border-dashed border-border text-[11px] font-medium text-muted-foreground">
          Else
          <Handle
            type="source"
            position={Position.Right}
            id="else"
            className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background -right-1.25"
          />
        </div>
      </NodeContent>
    </Node>
  );
};
