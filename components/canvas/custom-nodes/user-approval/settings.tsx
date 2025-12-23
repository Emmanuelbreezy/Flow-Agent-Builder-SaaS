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
import { UserCheck, Plus, X } from "lucide-react";

interface UserApprovalSettingsProps {
  node: Node;
  onUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
}

export const UserApprovalSettings = ({
  node,
  onUpdate,
}: UserApprovalSettingsProps) => {
  const options = (node.data?.options as string[]) || ["Approve", "Reject"];

  const handleAddOption = () => {
    onUpdate?.(node.id, {
      ...node.data,
      options: [...options, ""],
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate?.(node.id, {
      ...node.data,
      options: newOptions,
    });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate?.(node.id, {
      ...node.data,
      options: newOptions,
    });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg text-black bg-orange-500">
            <UserCheck size={14} strokeWidth={2.5} />
          </div>
          <div>
            <CardTitle className="text-sm">User Approval Node</CardTitle>
            <CardDescription className="text-xs">
              Wait for user decision
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Approval Options</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddOption}
              className="h-6 px-2 text-xs"
            >
              <Plus size={12} className="mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  placeholder="Option name"
                  className="h-8 text-sm"
                />
                {options.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Each option creates a separate output branch for user selection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
