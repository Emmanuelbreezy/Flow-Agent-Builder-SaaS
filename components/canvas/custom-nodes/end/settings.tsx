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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Square } from "lucide-react";

interface EndSettingsProps {
  node: Node;
}

export const EndSettings = ({ node }: EndSettingsProps) => {
  // const handleChange = (field: string, value: string) => {
  //   onUpdate?.(node.id, {
  //     ...node.data,
  //     [field]: value,
  //   });
  // };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-emerald-500">
            <Square className="h-3 w-3" />
          </div>
          <div>
            <CardTitle className="text-sm">End Node</CardTitle>
            <CardDescription className="text-xs">
              Workflow exit point
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label" className="text-xs font-medium">
            Node Label
          </Label>
          <Input
            id="label"
            value={(node.data?.label as string) || "Start"}
            placeholder="Start"
            className="h-8 text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
