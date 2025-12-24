"use client";

import React from "react";
import { Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { NODE_TYPES } from "@/constant/canvas";

interface ExecutionTimelineProps {
  nodes: Node[];
  executingNodeId?: string;
  completedNodeIds?: string[];
  errorNodeIds?: string[];
}

export function ExecutionTimeline({
  nodes,
  executingNodeId,
  completedNodeIds = [],
  errorNodeIds = [],
}: ExecutionTimelineProps) {
  // Sort nodes by their position (top to bottom)
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

  return (
    <div className="h-full w-60 border-r border-border bg-muted/30 p-4 overflow-y-auto flex flex-col gap-3">
      <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
        Execution Flow
      </div>

      <div className="space-y-2 flex-1">
        {sortedNodes.map((node, index) => {
          const isExecuting = node.id === executingNodeId;
          const isCompleted = completedNodeIds.includes(node.id);
          const isError = errorNodeIds.includes(node.id);
          const nodeLabel = (node.data?.label as string) || node.type;

          let icon = <Circle className="size-4 text-muted-foreground" />;
          let statusColor = "text-muted-foreground";

          if (isError) {
            icon = <AlertCircle className="size-4 text-destructive" />;
            statusColor = "text-destructive";
          } else if (isCompleted) {
            icon = <CheckCircle2 className="size-4 text-green-500" />;
            statusColor = "text-green-500";
          } else if (isExecuting) {
            icon = <Clock className="size-4 text-blue-500 animate-spin" />;
            statusColor = "text-blue-500";
          }

          return (
            <div key={node.id} className="space-y-1">
              <div
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all",
                  isExecuting && "bg-blue-500/10 border border-blue-500/20",
                  isCompleted && "bg-green-500/10 border border-green-500/20",
                  isError && "bg-destructive/10 border border-destructive/20",
                  !isExecuting &&
                    !isCompleted &&
                    !isError &&
                    "hover:bg-accent cursor-pointer"
                )}
              >
                {icon}
                <span className="flex-1 font-medium truncate">{nodeLabel}</span>
                {isExecuting && (
                  <ChevronRight className="size-3 text-blue-500" />
                )}
              </div>

              {/* Connector line to next node */}
              {index < sortedNodes.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="w-0.5 h-4 bg-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
