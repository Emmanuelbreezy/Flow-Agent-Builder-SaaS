"use client";

import React from "react";
import { Panel } from "@/components/ai-elements/panel";
import { cn } from "@/lib/utils";
import { NODE_TYPES, NODE_CONFIG } from "@/constant/canvas";

const NODE_LIST = [
  {
    group: "Core",
    items: [NODE_TYPES.AGENT, NODE_TYPES.END, NODE_TYPES.COMMENT],
  },
  {
    group: "Tools",
    items: [NODE_TYPES.MCP],
  },
  {
    group: "Logic",
    items: [NODE_TYPES.IF_ELSE, NODE_TYPES.USER_APPROVAL],
  },
  {
    group: "Data",
    items: [NODE_TYPES.SET_STATE],
  },
];

export const NodePanel = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    // Only pass the node type, the full config will be loaded in onDrop
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: nodeType })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Panel
      position="top-left"
      className="w-60 h-fit bg-card shadow-xl pb-5 flex flex-col"
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {NODE_LIST.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="text-[11px] font-medium text-muted-foreground px-1">
              {group.group}
            </h4>
            <div className="grid grid-cols-1 gap-1">
              {group.items.map((nodeType) => {
                const config = NODE_CONFIG?.[nodeType];
                const Icon = config.icon;

                return (
                  <div
                    key={nodeType}
                    draggable
                    onDragStart={(e) => onDragStart(e, nodeType)}
                    className={cn(
                      "flex items-center gap-3 p-1 rounded-lg hover:bg-accent transition-all cursor-grab active:cursor-grabbing group"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-sm! size-7 flex items-center justify-center",
                        config.color
                      )}
                    >
                      <Icon className="size-3.5! text-white" />
                    </div>
                    <span className="text-[14px] font-medium text-foreground">
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};
