"use client";

import React from "react";
import { Panel } from "@/components/ai-elements/panel";
import {
  Brain,
  GitBranch,
  UserCheck,
  Layers,
  Settings2,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_TYPES } from "@/constant/canvas";

const NODE_LIST = [
  {
    group: "Core",
    items: [
      {
        type: NODE_TYPES.AGENT,
        name: "Agent",
        icon: Brain,
        color: "bg-blue-500",
      },
      {
        type: NODE_TYPES.END,
        name: "End",
        icon: Square,
        color: "bg-red-400",
      },
    ],
  },
  {
    group: "Tools",
    items: [
      {
        type: NODE_TYPES.MCP,
        name: "MCP",
        icon: Layers,
        color: "bg-yellow-400",
      },
    ],
  },
  {
    group: "Logic",
    items: [
      {
        type: NODE_TYPES.IF_ELSE,
        name: "If / else",
        icon: GitBranch,
        color: "bg-orange-500",
      },
      {
        type: NODE_TYPES.USER_APPROVAL,
        name: "User approval",
        icon: UserCheck,
        color: "bg-orange-500",
      },
    ],
  },
  {
    group: "Data",
    items: [
      {
        type: NODE_TYPES.SET_STATE,
        name: "Content",
        icon: Settings2,
        color: "bg-purple-400",
      },
    ],
  },
];

export const NodePanel = () => {
  const onDragStart = (event: React.DragEvent, nodeData: string) => {
    event.dataTransfer.setData("application/reactflow", nodeData);
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
              {group.items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    onDragStart(e, JSON.stringify(item));
                  }}
                  className={cn(
                    "flex items-center gap-3 p-1 rounded-lg hover:bg-accent transition-all cursor-grab active:cursor-grabbing group"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg flex items-center justify-center",
                      item.color
                    )}
                  >
                    <item.icon className="size-3.5!" />
                  </div>
                  <span className="text-[14px] font-medium text-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};
