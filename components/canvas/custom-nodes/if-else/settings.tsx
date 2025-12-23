"use client";

import React from "react";
import { Node } from "@xyflow/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus, X } from "lucide-react";

interface IfElseSettingsProps {
  node: Node;
  onUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
}

export const IfElseSettings = ({ node, onUpdate }: IfElseSettingsProps) => {
  const conditions = (node.data?.conditions as string[]) || [];

  const handleAddCondition = () => {
    onUpdate?.(node.id, {
      ...node.data,
      conditions: [...conditions, ""],
    });
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    onUpdate?.(node.id, {
      ...node.data,
      conditions: newConditions,
    });
  };

  const handleUpdateCondition = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    onUpdate?.(node.id, {
      ...node.data,
      conditions: newConditions,
    });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg text-black bg-orange-500">
            <GitBranch size={14} strokeWidth={2.5} />
          </div>
          <div>
            <CardTitle className="text-sm">If/Else Node</CardTitle>
            <CardDescription className="text-xs">
              Conditional branching logic
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Conditions</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddCondition}
              className="h-6 px-2 text-xs"
            >
              <Plus size={12} className="mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={condition}
                  onChange={(e) => handleUpdateCondition(index, e.target.value)}
                  placeholder="input.value == 'example'"
                  className="h-8 text-xs font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCondition(index)}
                  className="h-8 w-8 p-0"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Each condition creates a separate output branch. The
            &quot;Else&quot; branch catches all other cases.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
