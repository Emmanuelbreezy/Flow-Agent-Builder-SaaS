/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Copy, FileText } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { toast } from "sonner";

interface StartSettingsProps {
  id: string;
  data: any;
}

export const StartSettings = ({ data }: StartSettingsProps) => {
  const inputVariable = data.inputSchema || "start.input";

  const copyVariable = () => {
    navigator.clipboard.writeText(`{{${inputVariable}}}`);
    toast.success("Variable copied to clipboard");
  };
  return (
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
          size="icon-sm"
          className="h-6 text-xs "
          onClick={copyVariable}
        >
          <Copy className="size-4 text-muted-foreground" />
        </InputGroupButton>
      </InputGroup>
    </div>
  );
};
