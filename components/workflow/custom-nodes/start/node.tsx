/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Play } from "lucide-react";
import { NodeProps } from "@xyflow/react";
import WorkflowNode from "../../workflow-node";
import { StartSettings } from "./settings";

export const StartNode = ({ data, selected, id }: NodeProps) => {
  console.log(data, "data");
  console.log(selected, "selected");
  const bgcolor = (data?.color as string) || "bg-emerald-500";

  return (
    <>
      <WorkflowNode
        label="Start"
        subText="Trigger"
        className="min-w-28!"
        isDeletable={false}
        icon={Play}
        selected={selected}
        handles={{ target: false, source: true }}
        color={bgcolor}
        settingsTitle="Start Node Settings"
        settingsDescription="Configure the workflow starting point"
        settingComponent={<StartSettings id={id} data={data} />}
      />
    </>
  );
};

export default StartNode;
