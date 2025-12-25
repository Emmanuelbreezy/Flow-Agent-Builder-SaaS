"use client";

import React from "react";
import { Brain } from "lucide-react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import WorkflowNode from "../../workflow-node";
import { AgentSettings } from "./settings";

export const AgentNode = ({ data, selected, id }: NodeProps) => {
  const { deleteElements } = useReactFlow();
  const bgcolor = (data?.color as string) || "bg-blue-500";
  const name = (data?.name as string) || "Agent";

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <>
      <WorkflowNode
        label={name}
        subText="Agent"
        icon={Brain}
        selected={selected}
        handles={{ target: true, source: true }}
        color={bgcolor}
        settingsTitle={name}
        settingsDescription="Call the model with your instructions and tools"
        settingComponent={<AgentSettings id={id} data={data} />}
        onDelete={handleDelete}
      />
    </>
  );
};
