"use client";

import React from "react";
import { Panel } from "@/components/ai-elements/panel";
import { Node } from "@xyflow/react";
import { NODE_TYPES } from "@/constant/canvas";
import { StartSettings } from "@/components/workflow/custom-nodes/start/settings";
import { AgentSettings } from "@/components/workflow/custom-nodes/agent/settings";
import { IfElseSettings } from "@/components/workflow/custom-nodes/if-else/settings";
import { UserApprovalSettings } from "@/components/workflow/custom-nodes/user-approval/settings";
import { EndSettings } from "@/components/workflow/custom-nodes/end/settings";

interface RightPanelProps {
  selectedNode: Node | null;
}

export const SettingPanel = ({ selectedNode }: RightPanelProps) => {
  if (!selectedNode) return null;

  return (
    <Panel
      position="top-right"
      className="w-96 min-h-40 max-h-[calc(100%-100px)] bg-card border-border shadow-xl p-0 flex flex-col"
    >
      {selectedNode.type === NODE_TYPES.START && (
        <StartSettings node={selectedNode} />
      )}
      {selectedNode.type === NODE_TYPES.AGENT && (
        <AgentSettings node={selectedNode} />
      )}
      {selectedNode.type === NODE_TYPES.IF_ELSE && (
        <IfElseSettings node={selectedNode} />
      )}
      {selectedNode.type === NODE_TYPES.USER_APPROVAL && (
        <UserApprovalSettings node={selectedNode} />
      )}
      {selectedNode.type === NODE_TYPES.END && (
        <EndSettings node={selectedNode} />
      )}
    </Panel>
  );
};
