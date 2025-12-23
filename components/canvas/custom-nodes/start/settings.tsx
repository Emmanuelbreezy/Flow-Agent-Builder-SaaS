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
import { FileText } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface StartSettingsProps {
  node: Node;
}

export const StartSettings = ({ node }: StartSettingsProps) => {
  const inputVariable = "input_as_text";

  const copyVariable = () => {
    navigator.clipboard.writeText(`{{${inputVariable}}}`);
    toast.success("Variable copied to clipboard");
  };
  // const handleChange = (field: string, value: string) => {
  //   onUpdate?.(node.id, {
  //     ...node.data,
  //     [field]: value,
  //   });
  // };

  return (
    <Card className="border-none! ring-0! shadow-none! pt-3!">
      <CardHeader>
        <CardTitle>Start Node</CardTitle>
        <CardDescription>Defines the workflow starting point</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="label" className="font-medium">
            Input variable
          </Label>
          <InputGroup className="border-0!">
            <InputGroupAddon align="inline-start">
              <FileText className="size-4 text-primary!" />
            </InputGroupAddon>
            <code className="flex-1 font-mono bg-background px-2 py-1">
              {`{{${inputVariable}}}`}
            </code>
            <InputGroupButton
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={copyVariable}
            >
              Copy
            </InputGroupButton>
          </InputGroup>

          <Separator className="my-4 bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
};
