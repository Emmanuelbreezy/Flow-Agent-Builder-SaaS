"use client";

import { TOOL_MODE_ENUM } from "@/lib/workflow/constants";
import { Button } from "@/components/ui/button";
import {
  HandIcon,
  MinusIcon,
  MousePointerIcon,
  PlusIcon,
  Maximize,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useReactFlow, useStore } from "@xyflow/react";
import { useWorkflow } from "@/context/workflow-context";

const Controls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { toolMode, setToolMode } = useWorkflow();

  // Get zoom level from React Flow store
  const zoom = useStore((s) => s.transform[2]);
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className="
        -translate-x-1/2 absolute bottom-6 left-1/2
        flex items-center gap-1 rounded-full border
        bg-background/80 backdrop-blur-md py-1.5 px-3 shadow-lg z-50
      "
    >
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant={toolMode === TOOL_MODE_ENUM.HAND ? "secondary" : "ghost"}
          className="rounded-full h-8 w-8"
          onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
        >
          <HandIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant={toolMode === TOOL_MODE_ENUM.SELECT ? "secondary" : "ghost"}
          className="rounded-full h-8 w-8"
          onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
        >
          <MousePointerIcon size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-px">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full h-8 w-8"
          onClick={() => zoomOut()}
        >
          <MinusIcon size={16} />
        </Button>
        <div className="min-w-7 text-center text-[13px] font-medium tabular-nums">
          {zoomPercent}%
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full h-8 w-8"
          onClick={() => zoomIn()}
        >
          <PlusIcon size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-4" />

      <Button
        size="icon"
        variant="ghost"
        className="rounded-full h-8 w-8"
        onClick={() => fitView()}
      >
        <Maximize size={16} />
      </Button>
    </div>
  );
};

export default Controls;
