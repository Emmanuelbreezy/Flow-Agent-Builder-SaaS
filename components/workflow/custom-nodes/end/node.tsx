"use client";
import React from "react";
import { Square } from "lucide-react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import WorkflowNode from "../../workflow-node";
import { EndSettings } from "./settings";

export const EndNode = ({ data, selected, id }: NodeProps) => {
  const { deleteElements } = useReactFlow();
  const bgcolor = (data?.color as string) || "bg-red-500";

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <>
      <WorkflowNode
        label="End"
        subText=""
        className="min-w-fit!"
        isDeletable={true}
        icon={Square}
        selected={selected}
        handles={{ target: true, source: false }}
        color={bgcolor}
        settingsTitle="End Node Settings"
        settingsDescription="Choose the workflow output"
        settingComponent={<EndSettings id={id} data={data} />}
        onDelete={handleDelete}
      />
    </>
  );
};
