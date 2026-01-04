"use client";
import React from "react";
import { Play } from "lucide-react";
import { NodeProps } from "@xyflow/react";
import WorkflowNode from "../../workflow-node";
import { StartSettings } from "./settings";

export const StartNode = (node: NodeProps) => {
  const { data, selected, id } = node;
  const bgcolor = (data?.color as string) || "bg-emerald-500";

  return (
    <>
      <WorkflowNode
        nodeId={id}
        label={"Start"}
        subText="Trigger"
        className="min-w-28!"
        isDeletable={false}
        icon={Play}
        selected={selected}
        handles={{ target: false, source: true }}
        color={bgcolor}
        settingsTitle="Start Node Settings"
        settingsDescription="Configure the workflow starting point"
        settingComponent={<StartSettings nodeId={id} />}
      />
    </>
  );
};

export default StartNode;
