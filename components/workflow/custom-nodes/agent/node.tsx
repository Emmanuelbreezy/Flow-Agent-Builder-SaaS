"use client";

import React from "react";
import { Brain } from "lucide-react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import WorkflowNode from "../../workflow-node";
import { AgentSettings } from "./settings";

export const AgentNode = ({ data, selected, id }: NodeProps) => {
  const { deleteElements } = useReactFlow();
  const bgcolor = (data?.color as string) || "bg-blue-500";

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <>
      <WorkflowNode
        label="Agent"
        subText="Agent"
        icon={Brain}
        selected={selected}
        handles={{ target: true, source: true }}
        color={bgcolor}
        settingsTitle="Agent Node Settings"
        settingsDescription="Configure the agent's behavior"
        settingComponent={<AgentSettings id={id} data={data} />}
        onDelete={handleDelete}
      />
    </>
  );
};
