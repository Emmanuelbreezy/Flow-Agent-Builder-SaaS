"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

interface IfElseSettingsProps {
  id: string;
  data: Record<string, unknown>;
}

interface Condition {
  caseName?: string;
  condition: string;
}

export const IfElseSettings = ({ id, data }: IfElseSettingsProps) => {
  const { updateNodeData } = useReactFlow();
  const conditions = (data?.conditions as Condition[]) || [{ condition: "" }];

  const handleAddCondition = () => {
    updateNodeData(id, {
      conditions: [...conditions, { caseName: "", condition: "" }],
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
    field: "caseName" | "condition",
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
              <Textarea
                value={condition.condition || ""}
                onChange={(e) =>
                  handleUpdateCondition(index, "condition", e.target.value)
                }
                placeholder="Enter condition, e.g. input == 5"
                rows={1}
                className="bg-muted/50 font-mono text-xs resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-1 mb-3">
        Use Common Expression Language to create a custom expression.
      </p>

      <Button variant="outline" size="sm" onClick={handleAddCondition}>
        <Plus className="size-4" />
        Add
      </Button>
    </div>
  );
};
