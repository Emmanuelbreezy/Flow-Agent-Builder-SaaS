/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useReactFlow } from "@xyflow/react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EndSettingsProps {
  id: string;
  data: Record<string, any>;
}

export const EndSettings = ({ id, data }: EndSettingsProps) => {
  const { updateNodeData } = useReactFlow();
  const outputValue = (data.outputValue as string) || "";

  const handleUpdateOutput = (value: string) => {
    updateNodeData(id, {
      outputValue: value,
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="output" className="font-medium">
        Output
      </Label>
      <Textarea
        id="output"
        rows={4}
        value={outputValue}
        onChange={(e) => handleUpdateOutput(e.target.value)}
        placeholder="Define the output variable or message"
        className="bg-muted/50 resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Set the final output value or message for the workflow
      </p>
    </div>
  );
};
