"use client";

import React from "react";
import { GitBranch } from "lucide-react";
import { Position, NodeProps, useReactFlow } from "@xyflow/react";
import WorkflowNode from "../../workflow-node";
import { BaseHandle } from "../../react-flow/base-handle";
import { IfElseSettings } from "./settings";

interface Condition {
  caseName?: string;
  condition: string;
}

export const IfElseNode = ({ data, selected, id }: NodeProps) => {
  const { deleteElements } = useReactFlow();
  const conditions = (data.conditions as Condition[]) || [{ condition: "" }];
  const bgcolor = (data?.color as string) || "bg-orange-500";

  const conditionStyle =
    "relative flex items-center justify-end p-2  rounded-md bg-muted/30 border border-dashed border-border text-[11px] font-medium text-muted-foreground whitespace-nowrap";

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <>
      <WorkflowNode
        label="If/else"
        subText="Condition"
        className="w-full"
        icon={GitBranch}
        selected={selected}
        handles={{ target: true, source: false }}
        color={bgcolor}
        settingsTitle="If / Else"
        settingsDescription="Create conditions to branch your workflow"
        settingComponent={<IfElseSettings id={id} data={data} />}
        onDelete={handleDelete}
      >
        {conditions?.map((condition: Condition, index: number) => (
          <div key={index} className="relative">
            <div className={conditionStyle}>
              <p className="whitespace-nowrap overflow-hidden  truncate max-w-[250px]">
                {" "}
                {condition.caseName ||
                  condition.condition ||
                  `Condition ${index + 1}`}
              </p>
            </div>
            <BaseHandle
              type="source"
              position={Position.Right}
              id={`condition-${index}`}
              className="size-2! -right-1.25"
            />
          </div>
        ))}
        <div className="relative">
          <div className={conditionStyle}>Else</div>
          <BaseHandle
            type="source"
            position={Position.Right}
            id="else"
            className="size-2! -right-1.25"
          />
        </div>
      </WorkflowNode>
    </>
  );
};
