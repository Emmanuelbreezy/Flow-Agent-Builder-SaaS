"use client";

import React from "react";
import { Globe } from "lucide-react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import WorkflowNode from "../../workflow-node";
import HttpSettings from "./settings";

export const HttpNode = ({ data, selected, id }: NodeProps) => {
  const { deleteElements } = useReactFlow();
  const bgcolor = (data?.color as string) || "bg-blue-500";

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <>
      <WorkflowNode
        label="HTTP"
        subText="Requests"
        icon={Globe}
        selected={selected}
        handles={{ target: true, source: true }}
        color={bgcolor}
        settingsTitle="HTTP Node Settings"
        settingsDescription="Configure the HTTP request settings"
        settingComponent={<HttpSettings id={id} data={data} />}
        onDelete={handleDelete}
      />
    </>
  );
};
