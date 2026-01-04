"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MentionInputComponent } from "../../mention-input";

interface IfElseSettingsProps {
  id: string;
  data: Record<string, unknown>;
}

interface Condition {
  caseName?: string;
  variable?: string;
  operator?: string;
  value?: string;
}

const OPERATORS = [
  { label: "Equals", value: "==" },
  { label: "Not equals", value: "!=" },
  { label: "Greater than", value: ">" },
  { label: "Less than", value: "<" },
  // Add more as needed
];

export const IfElseSettings = ({ id, data }: IfElseSettingsProps) => {
  const { updateNodeData } = useReactFlow();
  const conditions = (data?.conditions as Condition[]) || [
    {
      variable: "",
      operator: OPERATORS[0].value || "",
      value: "",
    },
  ];

  const handleAddCondition = () => {
    updateNodeData(id, {
      conditions: [
        ...conditions,
        { caseName: "", variable: "", operator: "", value: "" },
      ],
    });
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = conditions.filter((_, i) => i !== index);
      updateNodeData(id, {
        conditions: newConditions,
      });
    }
  };

  const handleUpdateCondition = (
    index: number,
    field: keyof Condition,
    value: string
  ) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    updateNodeData(id, {
      conditions: newConditions,
    });
  };

  const getConditionLabel = (index: number) => {
    if (index === 0) return "If";
    return `Else if`;
  };

  return (
    <div>
      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <div
            key={index}
            className="space-y-2 pb-2.5 border-b last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {getConditionLabel(index)}
              </h4>
              {conditions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveCondition(index)}
                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Input
                value={condition.caseName || ""}
                onChange={(e) =>
                  handleUpdateCondition(index, "caseName", e.target.value)
                }
                placeholder="Case name (optional)"
                className="bg-muted/50"
              />
              <div className="flex gap-2">
                <MentionInputComponent
                  nodeId={id}
                  value={condition.variable || ""}
                  placeholder="{{agent.output}}'"
                  multiline={false}
                  onChange={(value) =>
                    handleUpdateCondition(index, "variable", value)
                  }
                  className="bg-muted/50 font-mono text-xs w-full! max-w-48!"
                />
                <Select
                  value={condition.operator || ""}
                  onValueChange={(v) =>
                    handleUpdateCondition(index, "operator", v ?? "")
                  }
                >
                  <SelectTrigger className="w-28 text-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={condition.value || ""}
                  onChange={(e) =>
                    handleUpdateCondition(index, "value", e.target.value)
                  }
                  placeholder="Value"
                  className="bg-muted/50 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={handleAddCondition}>
        <Plus className="size-4" />
        Add
      </Button>
    </div>
  );
};
